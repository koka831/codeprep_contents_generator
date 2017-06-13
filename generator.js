#!/usr/bin/env node
'use strict';

let shell    = require('shelljs'),
    fs       = require('fs'),
    util     = require('util'),
    readline = require('readline'),
    config   = require('config');

const input_chapter_delimiter = config.get('input_chapter_delimiter');
const input_section_delimiter = config.get('input_section_delimiter');
const output_chapter_delimiter = config.get('output_chapter_delimiter');
const output_section_delimiter = config.get('output_section_delimiter');
const ignore_firstline = config.get('ignore_firstline');

// generates chapter*.md
const ofname = 'chapter';
const chapter_regex = new RegExp(input_chapter_delimiter + "\\s(.*)");
const section_regex = new RegExp(input_section_delimiter + "\\s(.*)");
const playground_regex = new RegExp('Playground', 'i');

const readme = './README.md';
const template_playground = './src/playground.md';
const template_chapter_exerpt = './src/chapter_exerpt.md';
const template_chapter_summary = './src/chapter_summary.md';
const template_section = './src/section.md';

class Generator {
  constructor(opts) {
    this.chapters = [];
    this.opts = opts;
  }

  load() {
    // convert into class objects&into array
    // TODO: how test around file io
    const data = fs.readFileSync(readme, 'utf8');
    const lines = data.split('\n');

    lines.forEach((line, i) => {
      if (i == 0 && ignore_firstline) return;
      if (section_regex.test(line)) {
        let last_chapter = this.chapters[this.chapters.length-1];
        last_chapter.add_section(line.replace(input_section_delimiter, ""));
      } else if (chapter_regex.test(line)) {
        const chapter = new Chapter(line.replace(input_chapter_delimiter, ""));
        this.chapters.push(chapter);
      }
    });
  }

  isExist() {
    try {
      fs.statSync(ofname+'1.md');
      return true;
    } catch (err) {
      if (err.code == 'ENOENT') return false;
    }
  }

  gen() {
    if (this.isExist() && !this.opts['force']) {
      console.log("already chapter files exist. please use -f|--force flag.");
      return;
    }
    this.chapters.forEach((chapter, i) => {
      const current_file = ofname + (i + 1).toString() + '.md';
      if (playground_regex.test(chapter.title)) {
        shell.cat(template_playground).to(current_file);
      } else {
        shell.echo(output_chapter_delimiter + chapter.title + '\n').to(current_file);
        shell.cat(template_chapter_exerpt).toEnd(current_file);

        chapter.section.forEach((title, j) => {
          shell.cat(template_section).toEnd(current_file);
          shell.sed('-i', /\s*\$\{title\}/, title, current_file);
        });

        shell.cat(template_chapter_summary).toEnd(current_file);
      }
    });
  }

}

class Chapter {
  constructor(title) {
    this.title = title;
    this.section = [];
  }

  add_section(title) {
    this.section.push(title);
  }
}


exports.Generator = Generator;
