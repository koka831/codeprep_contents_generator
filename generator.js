#!/usr/bin/env node
'use strict';

let shell    = require('shelljs'),
    fs       = require('fs'),
    path     = require('path'),
    util     = require('util'),
    readline = require('readline');

const input_title_delimiter = '#';
const input_chapter_delimiter = '#';
const input_section_delimiter = '##';
const output_chapter_delimiter = '#';
const output_section_delimiter = '##';
const ignore_firstline = true;

const ofname = 'chapter';
const chapter_regex = new RegExp(input_chapter_delimiter + "\\s(.*)");
const section_regex = new RegExp(input_section_delimiter + "\\s(.*)");
const playground_regex = new RegExp('Playground', 'i');

const template_path = process.env.CODEPREP_TEMPLATE_PATH;
const readme = './README.md';
const template_playground = template_path + '/src/playground.md';
const template_chapter_exerpt = template_path + '/src/chapter_exerpt.md';
const template_chapter_summary = template_path + '/src/chapter_summary.md';
const template_book_yml = template_path + '/src/book.yml';
const template_section = template_path + '/src/section.md';

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
      if (i == 0 && ignore_firstline) {
        this.title = line.replace(input_title_delimiter, "");
        return;
      }
      if (section_regex.test(line)) { // section
        let last_chapter = this.chapters[this.chapters.length-1];
        let section = new Section(line.replace(input_section_delimiter, ""));
        last_chapter.add_section(section);

      } else if (chapter_regex.test(line)) { // chapter
        const chapter = new Chapter(line.replace(input_chapter_delimiter, ""));
        this.chapters.push(chapter);
      } else { // push comment or ignore line
        // fuckin' parser!
        if (line.length == 0) return;
        if (this.chapters.length == 0) return;
        let last_chapter = this.chapters[this.chapters.length-1];
        if (last_chapter.sections.length == 0) return;
        let last_section = last_chapter.sections[last_chapter.sections.length-1];
        last_section.add_comment(line);
      }
    });
  }

  isExist(fname) {
    try {
      fs.statSync(fname);
      return true;
    } catch (err) {
      if (err.code == 'ENOENT') return false;
    }
  }

  gen() {
    if (this.isExist(ofname+'1.md') && !this.opts['force']) {
      console.log("already chapter files exist. please use -f|--force flag.");
      return;
    }

    // generate book.yml
    if (!this.isExist('book.yml') && this.opts['book_yml']) {
      shell.cat(template_book_yml).to('book.yml');
      shell.sed('-i', /\s*\$\{title\}/, this.title, 'book.yml');
    }
    this.chapters.forEach((chapter, i) => {
      const current_file = ofname + (i + 1).toString() + '.md';
      if (playground_regex.test(chapter.title)) {
        shell.cat(template_playground).to(current_file);
      } else {
        shell.echo(output_chapter_delimiter + chapter.title + '\n').to(current_file);
        shell.cat(template_chapter_exerpt).toEnd(current_file);

        chapter.sections.forEach((section, j) => {
          shell.cat(template_section).toEnd(current_file);
          shell.sed('-i', /\s*\$\{title\}/, section.title, current_file);
          if (this.opts['comment']) {
            shell.sed('-i', /\s*\$\{comment\}/, section.comment, current_file);
          } else {
            shell.sed('-i', /\s*\$\{comment\}/, "", current_file);
          }
        });

        shell.cat(template_chapter_summary).toEnd(current_file);
      }
    });
  }

}

class Chapter {
  constructor(title) {
    this.title = title;
    this.sections = [];
  }

  add_section(section) {
    this.sections.push(section);
  }
}

class Section {
  constructor(title) {
    this.title = title;
    this.comment = "";
  }

  add_comment(text) {
    this.comment += text;
  }
}


exports.Generator = Generator;
