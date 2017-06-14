
# Codeprep Contents Generator

====

## Overview
codeprep README => chapter file generator using nodejs.

## Description
this script generates chapter & playground templates.

## Demo
![demo](https://github.com/koka831/codeprep_contents_generator/blob/master/generator.gif)

## Requirement
- nodejs >= 7.10
## Usage
- type `codeprep_gen` where being `README.md`, then generates chapter*.md.
## Install

```sh
git clone https://github.com/koka831/codeprep_contents_generator

// export path & CODEPREP_TEMPLATE_PATH
export ${current_dir}:$PATH
export CODEPREP_TEMPLATE_PATH=${current_dir}

```

## settings
- `./src/*.md` : template files
- generator.js
  - `input_chapter_delimiter`: (default: "#")
    - identifier of chapter title.
  - `input_section_delimiter`: (default: "##")
    - identifier of section title.
  - `output_chapter_delimiter`: (default: "#")
    - chapters' title header in output files.
  - `output_section_delimiter`: (default: "##")
    - sections' title header in output files.

## Contribution

## Licence

