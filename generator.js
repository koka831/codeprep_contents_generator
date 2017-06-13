#!/usr/bin/env node
'use strict';

let shell    = require('shelljs'),
    fs       = require('fs'),
    util     = require('util'),
    readline = require('readline'),
    config   = require('config');

const chapter_delimiter = config.get('chapter_delimiter');
const section_delimiter = config.get('section_delimiter');
const ignore_firstline = config.get('ignore_firstline');

// generates chapter*.md
const ofname = 'chapter';
const chapter_regex = new RegExp(chapter_delimiter + "\\s(.*)");
const section_regex = new RegExp(section_delimiter + "\\s(.*)");
const playground_regex = new RegExp('Playground', 'i');
const readme = './README.md';


class Generator {
  constructor() {
    this.chapters = [];
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
        last_chapter.add_section(line);
      } else if (chapter_regex.test(line)) {
        const chapter = new Chapter(line);
        this.chapters.push(chapter);
      }
    });
  }

  gen() {
    // TODO: check force flag at call
    // TODO: check Playground
    // > create chapter*.md
    // > put exerpt text
    // > for each sections
    // >> put template
    // > put summary text
    this.chapters.forEach((chapter, i) => {
      const current_file = ofname + (i + 1).toString() + '.md';
      // check if playground
      if (playground_regex.test(chapter.title)) {
        shell.cat('./src/playground.md').to(current_file);
      } else {
        shell.echo(chapter.title).to(current_file);
        shell.cat('./src/chapter_exerpt.md').toEnd(current_file);
        //chapter.section.forEach() => {
          // TODO: put section title
          //  shell.cat('./src/section.md').toEnd(current_file);
        //}
        shell.cat('./src/chapter_summary.md').toEnd(current_file);
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
