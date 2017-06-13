#!/usr/bin/env node
'use strict';

let { Generator } = require('./generator');

let gene = new Generator();
gene.load();
// todo check force flag
gene.gen();
