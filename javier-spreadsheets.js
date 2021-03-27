#! /usr/bin/env node

const Javier = require('./index');

Javier.argv(function(a1, a2, command, spreadsheetsUrl, startRange, valuesString) {
  Javier.open((javier) => {
    if (command === 'setup') {
      javier.generateTokenJSON();
    } else if (command === "update") {
      javier.execUpdateCommandViaStdin(spreadsheetsUrl, startRange);
    }
  });
});
