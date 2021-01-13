const Range = require('./spreadsheets_range');

test('columnToNumber returns 1', () => {
  expect(Range.columnToNumber('A')).toBe(1);
});

test('columnToNumber returns 26', () => {
  expect(Range.columnToNumber('Z')).toBe(26);
});

test('columnToNumber returns 27', () => {
  expect(Range.columnToNumber('AA')).toBe(27);
});

test('numberToColumn returns A', () => {
  const range = new Range();
  expect(range.numberToColumn(1)).toBe('A');
});

test('numberToColumn returns Z', () => {
  const range = new Range();
  expect(range.numberToColumn(26)).toBe('Z');
});

test('numberToColumn returns AA', () => {
  const range = new Range();
  expect(range.numberToColumn(27)).toBe('AA');
});

test('createRangeString returns Sheet!B2:D4', () => {
  const range = new Range();
  expect(range.createRangeString('Sheet', 2, 2, 4, 4)).toBe('Sheet!B2:D4');
});

test('createRectangleRange returns Sheet!B2:D4', () => {
  const range = new Range('Sheet', 1, 1);
  expect(range.createRectangleRange(2, 2)).toBe('Sheet!A1:C3');
});
