// @ts-check

//
// this is a script for updating versions in various files. 
// @see README.md
// 
// this is destructive, so be careful. we edit files in-place.
//

import { promises as fs, read } from 'fs';
import path from 'path';

console.info('');

//--- read versions ------------------------------------------------------------

// get the package version by importing it
import pkg2 from '../package.json' assert { type: 'json' };
const package_version = pkg2.version;
console.info('package version:', package_version);

// get the TREB version by importing the script
import { TREB } from '@trebco/treb';
const treb_version = TREB.version;
console.info('treb version:', treb_version);

//--- update versions in php file ----------------------------------------------

const php_file = 'treb-spreadsheet.php';
let contents = await fs.readFile(php_file, { encoding: 'utf-8' });
contents = contents.replace(/(Version:\s+)[\d.]+\n/, '$1' + package_version + '\n');
contents = contents.replace(/(\$version\s*=\s*)'[\d.]+'/, '$1' + `'${treb_version}'`);
// console.info(contents);
await fs.writeFile(php_file, contents, { encoding: 'utf-8' });

//--- update versions in block file ---------------------------------------------

const block_file = path.join('src', 'block.json');
contents = await fs.readFile(block_file, { encoding: 'utf-8' });
const obj = JSON.parse(contents);
obj.version = package_version;
obj.attributes['treb-version'].default = treb_version;
contents = JSON.stringify(obj, undefined, 2);
// console.info(contents);
await fs.writeFile(block_file, contents, { encoding: 'utf-8' });

//--- update version in the readme.txt file ------------------------------------

const readme_file = 'readme.txt';
contents = await fs.readFile(readme_file, { encoding: 'utf-8' });
contents = contents.replace(/(Stable tag:\s*)[\d.]+\n/, '$1' + package_version + '\n');
// console.info(contents);
await fs.writeFile(readme_file, contents, { encoding: 'utf-8' });





