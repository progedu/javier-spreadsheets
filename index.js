const fs = require('fs');
const os = require('os');
const readline = require('readline');
const { google } = require('googleapis');
const Range = require('./spreadsheets_range');

module.exports = class {

  stat(path) {
    return new Promise((resolve) => {
      return fs.stat(path, (err, stat) => {
        return resolve(err ? err : stat);
      });
    });
  }

  writeJSONFile(path, object, options) {
    return new Promise((resolve) => {
      return fs.writeFile(path, JSON.stringify(object), options, (err) => {
        return resolve();
      });
    });
  }

  readJSONFile(path, options) {
    return new Promise((resolve) => {
      return fs.readFile(path, options, (err, data) => {
        return resolve(JSON.parse(data));
      });
    });
  }

  getDefaultCredentialsPath() {
    return os.homedir() + '/.javier_spreadsheets_credentials.json';
  }

  getCredentialsPathFromEnv() {
    return process.env.JAVIER_SPREADSHEETS_CREDS_PATH || this.getDefaultCredentialsPath();
  }

  getDefaultTokenPath() {
    return os.homedir() + '/.javier_spreadsheets_token.json';
  }

  getTokenPathFromEnv() {
    return process.env.JAVIER_SPREADSHEETS_TOKEN_PATH || this.getDefaultTokenPath();
  }

  createReadlineInterface() {
    return readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * https://developers.google.com/sheets/api/quickstart/nodejs の手続きを解釈し直したもの。
   * @method
   */
   async generateTokenJSON() {
    const creds = await this.readJSONFile(this.getCredentialsPathFromEnv());
    const client = this.createGoogleOAuth2Client(creds);

    console.log('Authorize this app by visiting this url:', client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    }));

    const code = await new Promise((resolve) => {
      const rl = this.createReadlineInterface();
      return rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        return resolve(code);
      });
    });

    const token = await new Promise((resolve, reject) => {
      return client.getToken(code, (err, token) => {
        return err ? reject(err) : resolve(token);
      });
    });

    return new Promise((resolve, reject) => {
      return this.writeJSONFile(this.getTokenPathFromEnv(), token, (err) => {
        return err ? reject(err) : resolve();
      });
    });
  }

  createAuthorizedGoogleOAuth2Client(callback) {
    return this.createGoogleOAuth2Client((err, client) => {
      return this.readSpreadsheetsTokenJSON((_, json) => {
        client.setCredentials(json);
        return callback(err, client);
      });
    });
  }

  createGoogleOAuth2Client(creds) {
    const { client_id, client_secret, redirect_uris } = creds.installed;
    return new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );
  }

  createGoogleOAuth2ClientAndAuthorize(creds, token) {
    const client = this.createGoogleOAuth2Client(creds);
    client.setCredentials(token);
    return client;
  }

  createSpreadsheetsClient(auth) {
    return google.sheets({ version: 'v4', auth }).spreadsheets;
  }

  isJSONCompatibleForCSV(json) {
    if (!Array.isArray(json)) {
      return false;
    }

    for (let i = 0; i < json.length; ++i) {
      if (!Array.isArray(json[i])) {
        return false;
      }
    }

    return true;
  }

  spreadsheetsUpdate(spreadsheets, spreadsheetId, range, values) {
    if (!this.isJSONCompatibleForCSV(values)) {
      throw 'json is not compatible for CSV format';
    }

    return spreadsheets.values.update({
      spreadsheetId,
      valueInputOption: 'USER_ENTERED',
      range: range,
      requestBody: {
        range,
        values,
      }
    });
  }

  parseStdinCSV(callback) {
    const values = [];

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function(data) {
      data.split("\n").forEach((line) => {
        values.push(line.split(','));
      });
    });

    process.stdin.on('end', function() {
      return callback(values);
    });
  }

  static argv(callback) {
    return callback.apply(this, process.argv);
  }

  getSpreadsheetIdFromUrl(urlstring) {
    const m = /https:\/\/docs.google.com\/spreadsheets\/d\/(.*?)\//.exec(urlstring);
    return m && m[1]
  }

  static open(callback) {
    return callback(new this());
  }
  
  async execUpdateCommand(spreadsheetsUrl, startRange, values) {
    const creds = await this.readJSONFile(this.getCredentialsPathFromEnv());
    const token = await this.readJSONFile(this.getTokenPathFromEnv());

    const client = this.createGoogleOAuth2ClientAndAuthorize(creds, token);
    const spreadsheets = this.createSpreadsheetsClient(client);

    const range = Range.fromA1Notation(startRange);

    await this.spreadsheetsUpdate(spreadsheets, this.getSpreadsheetIdFromUrl(spreadsheetsUrl), range.createRectangleRange(values[0].length, values.length), values);
  }

  async execUpdateCommandViaStdin(spreadsheetsUrl, startRange) {
    return this.parseStdinCSV((values) => {
      console.log(values);
      this.execUpdateCommand(spreadsheetsUrl, startRange, values);
    });
  }

};
