#! /usr/bin/env node

const Javier = require('./index');

Javier.argv(function(a1, a2, command, spreadsheetsUrl, startRange, valuesString) {
  Javier.open((javier) => {
    javier.execUpdateCommand(spreadsheetsUrl, startRange, JSON.parse(valuesString));
  });
});
