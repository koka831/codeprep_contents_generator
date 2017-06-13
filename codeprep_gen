#!/usr/bin/env node
'use strict';

let { Generator } = require('./generator');

let opts = {};

process.argv.slice(2).forEach((v, i) => {
  if (v == '-f'|| v == '--force') {
    opts['force'] = true;
  } else {
    opts['force'] = false;
  }
});

let gene = new Generator(opts);
gene.load();
// todo check force flag
gene.gen();
