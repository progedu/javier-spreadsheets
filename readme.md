# javier-spreadsheets

標準入力から CSV を受け取り、 Google Spreadsheets へ反映する CLI ツールです。

# Prerequesties

### 1 git clone, npm install, npm link する

```
git clone git@github.com:ohataken/javier-spreadsheets.git
cd javier-spreadsheets 
npm install 
npm link 
```

### 2 credentials を手に入れて ~/.javier_spreadsheets_credentials.json に配置する 

Google Workspace の管理者にもらうもの、中身はこんな感じ。

```
{
  "installed": {
    "client_id": "000000000000-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com",
    "project_id": "xxxxxxxx",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "XXXXXXXXXXXXXXXXXXXXXXXX",
    "redirect_uris": [
      "urn:ietf:wg:oauth:2.0:oob",
      "http://localhost"
    ]
  }
}
```

または、環境変数 JAVIER_SPREADSHEETS_CREDS_PATH でファイルパスを指定してもよい。

### 3 javier-spreadsheets setup を実行して、画面に表示された URL を開き、コードをコピーして、ターミナルにペーストする。

```
javier-spreadsheets setup 
```

すると、以下のように表示されるので URL をブラウザで開く。

```
Authorize this app by visiting this url: https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.file%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fspreadsheets&response_type=code&client_id=000000000000-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob
```

いつもの OAuth2 の認証画面になる。許可を進めていくと、 localhost にリダイレクトされるため、ページが表示されなくなる。このときのアドレスは以下のようになっているはず。

```
http://localhost/?code=XXXXXXXXXXXXXXXX&scope=https://www.googleapis.com/auth/drive%20https://www.googleapis.com/auth/drive.file%20https://www.googleapis.com/auth/spreadsheets
```

この `XXXXXXXXXXXXXXXX` の部分だけを切り取って、ターミナルの

```
Enter the code from that page here: 
```

の部分に貼り付けて、 Enter を押す。

# 使い方

### csv ファイルを標準出力して、パイプで受け取り Google Spreadsheet へ反映する場合

```
cat [csv file] | javier-spreadsheets update [sheet url] [sheetname!range] 
```

実行例

```
echo "1, 2" | javier-spreadsheets update https://docs.google.com/spreadsheets/d/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/edit#gid=0 'Sheet 1!A1'
```

### jq と組み合わせて、 JSON を CSV に変換して Google Spreadsheets へ反映する。

例えば、 Slack API の conversations.list の返り値の内容を使う場合。以下のような json ファイルをもとに作業を進めるとして、 

```conversations.list.json
{
  "ok": true,
  "channels": [
    {
      "id": "C00ABCDEF",
      "name": "random",
      "is_channel": true,
      "is_group": false,
      "is_im": false,
      "created": 1452174102,
      "is_archived": false,
      "is_general": false,
      "unlinked": 0,
      "name_normalized": "random",
      "is_shared": false,
      "parent_conversation": null,
      "creator": "U00ABCDEF",
      "is_ext_shared": false,
      "is_org_shared": false,
      "shared_team_ids": [
        "T00ABCDEF"
      ],
      "pending_shared": [],
      "pending_connected_team_ids": [],
      "is_pending_ext_shared": false,
      "is_member": false,
      "is_private": false,
      "is_mpim": false,
      "topic": {
        "value": "雑談チャンネルです",
        "creator": "U00ABCDEF",
        "last_set": 1560686578
      },
      "num_members": 6880
    },
    {
      "id": "C01ABCDEF",
      "name": "development",
      "is_channel": true,
      "is_group": false,
      "is_im": false,
      "created": 1452174102,
      "is_archived": false,
      "is_general": true,
      "unlinked": 0,
      "name_normalized": "development",
      "is_shared": false,
      "parent_conversation": null,
      "creator": "U01ABCDEF",
      "is_ext_shared": false,
      "is_org_shared": false,
      "shared_team_ids": [
        "T01ABCDEF"
      ],
      "pending_shared": [],
      "pending_connected_team_ids": [],
      "is_pending_ext_shared": false,
      "is_member": false,
      "is_private": false,
      "is_mpim": false,
      "topic": {
        "value": "developers",
        "creator": "U01ABCDEF",
        "last_set": 1571620610
      },
      "num_members": 18434
    },
```

この JSON ファイルから channels の中の name と num_members を取り出す場合は以下のように

```
cat conversations.list.json | jq -r '.channels[] | [.name, .num_members] | @csv' | javier-spreadsheets update https://docs.google.com/spreadsheets/d/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/edit 'Sheet 1!A1'
```

jq の使い方が上達すればいろいろできると思う(jqわからない)。
