module.exports = class SpreadsheetsRange {

  static columnToNumberRec(column, i) {
    const d = 1 + column[0].charCodeAt(0) - 'A'.charCodeAt(0);

    if (column.length === 1) {
      return d + i;
    } else {
      return this.columnToNumberRec(column.slice(1), d * 26 + i);
    }
  }

  static columnToNumber(column) {
    return this.columnToNumberRec(column, 0);
  }

  static fromA1Notation(a1notation) {
    const m = /(.*?)!([A-Z]+)([0-9]+)/g.exec(a1notation); 

    if (m) {
      const sheetname = m[1];
      const startColumnNum = this.columnToNumber(m[2]);
      const startRowNum = parseInt(m[3]);
      return new this(sheetname, startColumnNum, startRowNum);
    } else {
      throw 'fromA1Notation parse error';
    }
  }

  constructor(sheetname, startColumnNum, startRowNum) {
    this.sheetname = sheetname;
    this.startColumnNum = startColumnNum;
    this.startRowNum = startRowNum;
  }

  numberToColumnRec(i, column) {
    const q = Math.floor((i - 1) / 26);
    const r = (i - 1) % 26;
    const d = String.fromCharCode('A'.charCodeAt(0) + r);

    if (q === 0) {
      return d + column;
    } else {
      return this.numberToColumnRec(q, d + column);
    }
  }

  numberToColumn(i) {
    return this.numberToColumnRec(i, '');
  }

  createRangeString(sheetname, startColumnNum, startRowNum, endColumnNum, endRowNum) {
    return `${sheetname}!${this.numberToColumn(startColumnNum)}${startRowNum}:${this.numberToColumn(endColumnNum)}${endRowNum}`;
  }

  createRectangleRange(columns, rows) {
    return this.createRangeString(this.sheetname, this.startColumnNum, this.startRowNum, this.startColumnNum + columns, this.startRowNum + rows);
  }

};
