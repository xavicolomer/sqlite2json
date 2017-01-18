'use strict';

const sqlite3 = require('sqlite3');
const commandLineArgs = require('command-line-args');
const fs = require('fs');
const Promise = require('bluebird');

const optionDefinitions = [
  { name: 'database', alias: 'd', type: String },
  { name: 'structure', alias: 's', type: String },
  { name: 'output', alias: 'o', type: String, defaultOption: 'output.json' },
  { name: 'extend', alias: 'e', type: Boolean, defaultOption: false }
];

const options = commandLineArgs(optionDefinitions);

let db;
let structure;
let outputFile = options.output || 'output.json';
let output = {};

const isDatabaseValid = () =>
  new Promise((resolve, reject) => {
    if (!options.database) {
      console.log('You have to define a valid sqlite database path (-d /path/to/file).');
      reject();
    }

    if (!fs.existsSync(options.database)) {
      console.log('Database file path is not valid.');
      reject();
    }

    try {
      db = new sqlite3.Database(options.database);
      resolve();
    } catch (err) {
      console.log('Database file is not valid or is corrupted.');
      reject();
    }
  });

const isStructureValid = () =>
  new Promise((resolve, reject) => {
    if (!options.structure) {
      //parse whole db
      resolve();
    }

    if (!fs.existsSync(options.structure)) {
      console.log('Structure file path is not valid.');
      reject();
    }

    fs.readFile(options.structure, 'utf8', (err, data) => {
      if (err) {
        console.log('Structure file path is not valid or its corrupted.');
        reject();
      }
      try {
        structure = structure || { tables: [] };
        structure.tables = structure.tables.concat(JSON.parse(data).tables);
        resolve();
      } catch (err) {
        console.log('Structure file has not a valid JSON structure.');
        reject();
      }
    });
  });

const buildStructure = () =>
  new Promise((resolve, reject) => {
    structure = structure || { tables: [] };

    db.all(`select name from sqlite_master where type='table' and name not like 'sqlite_sequence';`, (err, tables) => {
      for (let i = 0, len = tables.length; i < len; ++i) {
        structure.tables.push({
          key: tables[i].name,
          query: `SELECT * from ${tables[i].name}`
        });
      }

      resolve();
    });
  });

const parse = () =>
  new Promise((resolve, reject) => {
    if (!structure.tables) {
      reject();
    }

    for (let i = 0, len = structure.tables.length; i < len; ++i) {
      const item = structure.tables[i];

      db.all(item.query, (err, items) => {
        output[item.key] = items;
        if (i === len - 1) {
          resolve();
        }
      });
    }
  });

const writeOutput = () =>
  new Promise((resolve, reject) => {
    let content = '';

    try {
      content = JSON.stringify(output);
    } catch (err) {
      console.log(err);
      reject(err);
    }

    fs.writeFile(outputFile, content, (err) => {
      if (err) {
        console.log(err);
        reject(err);
      }

      resolve();
    });
  });

const init = () => {
  if (options.extend) {
    isDatabaseValid()
      .then(buildStructure)
      .then(isStructureValid)
      .then(parse)
      .then(writeOutput)
      .catch(e => console.log(e));
  } else {
    if (options.structure) {
      isDatabaseValid()
        .then(isStructureValid)
        .then(parse)
        .then(writeOutput)
        .catch(e => console.log(e));
    } else {
      isDatabaseValid()
        .then(buildStructure)
        .then(parse)
        .then(writeOutput)
        .catch(e => console.log(e));
    }
  }
}

init();
