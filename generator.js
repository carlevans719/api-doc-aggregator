// @ts-check

const widdershins = require('widdershins');
const rp = require('request-promise');
const { spawn } = require('child_process');
const { writeFile: writeFileCb, mkdir: mkdirCb } = require('fs');
const { promisify } = require('util');
const { join } = require('path');

const writeFile = promisify(writeFileCb);
const mkdir = promisify(mkdirCb);

const BASE_URL_PATH = 'apis';
const PUBLIC_DIR = 'public';
const INPUTS_DIR = 'slate-inputs';
const TEMPLATES_DIR = 'templates';

function spawnPromise (command, ...args) {
  return new Promise((resolve, reject) => {
    const stdout = [];
    const stderr = [];
    const handle = spawn(command, ...args);

    handle.stdout.on('data', data => stdout.push(data));
    handle.stderr.on('data', data => stderr.push(data));

    handle.on('close', code => {
      if (code !== 0) {
        return reject(`${command} exited with code: ${code}.\n\n${stderr.join('\n')}`);
      }

      return resolve(`${command} exited with code: ${code}.\n\n${stdout.join('\n')}`);
    });
  });
}

async function fetchAndParseSpecs (specsToFetch) {
  const parsedSpecs = {};

  for (const name in specsToFetch) {
    try {
      const spec = await rp(specsToFetch[name]);
      parsedSpecs[name] = JSON.parse(spec);
    } catch (ex) {
      console.error(`Failed to load ${name} API`);
    }
  }

  return parsedSpecs;
}

async function convertSpecs (specsToConvert) {
  const convertedSpecs = {};

  const options = {
    codeSamples: true,
    httpsnippet: true,
    // sample: true,
    tocSummary: true,
    language_tabs: [
      'shell',
      'http',
      'javascript',
      'node',
      'csharp',
    ],
    language_clients: [
      { node: 'request' },
      { javascript: 'fetch' },
    ],
    toc_footers: [
      { url: '/', description: 'Home' },
      ...Object.keys(specsToConvert)
        .map(name => ({ url: `/${BASE_URL_PATH}/${name}`, description: `${name} API`})),
    ],
    theme: 'Github',
    search: true,
    includes: ['errors.md'],
    code_clipboard: true,
  };

  for (const name in specsToConvert) {
    try {
      convertedSpecs[name] = await widdershins.convert(specsToConvert[name], options);
    } catch (ex) {
      console.error(`Failed to convert ${name} spec`);

      // Remove spec from the map and call this func again without it.
      // This ensures it doesn't appear in the ToC of other specs
      specsToConvert = Object.assign({}, specsToConvert);
      delete specsToConvert[name];
      return convertSpecs(specsToConvert);
    }
  }

  return convertedSpecs;
}

async function buildSass () {
  try {
    await spawnPromise('npx', [
      'sass',
      '--update',
      '--style',
      'compressed',
      '--no-source-map',
      `./${TEMPLATES_DIR}/slate/css`,
    ]);
    console.log('Build SASS succeeded');
    return true;

  } catch (ex) {
    console.error('Build SASS failed.', ex.message);
  }
}

async function generateDocumentation (specsToGenerate) {
  await buildSass();

  for (const name in specsToGenerate) {
    const inputDir = join(INPUTS_DIR, name);
    const outputDir = join(PUBLIC_DIR, BASE_URL_PATH, name);

    await mkdir(inputDir, { recursive: true });
    await mkdir(outputDir, { recursive: true });
    await writeFile(join(inputDir, 'index.md'), specsToGenerate[name]);
    await spawnPromise('cp', ['-r', join(TEMPLATES_DIR, '_includes'), inputDir]);
    await spawnPromise('cp', [join(TEMPLATES_DIR, 'index.11tydata.js'), inputDir]);
    await spawnPromise('npx', [
      '@11ty/eleventy',
      `--input=${inputDir}`,
      `--output=${outputDir}`,
    ]);

    // Copy over static assets - css, js, img
    await spawnPromise('cp', ['-r', join(TEMPLATES_DIR, 'slate'), outputDir]);

  }
}

module.exports = async function generate (apisToProcess) {
  apisToProcess = Object.assign({}, apisToProcess);

  const parsedSpecs = await fetchAndParseSpecs(apisToProcess);
  const convertedSpecs = await convertSpecs(parsedSpecs);

  await generateDocumentation(convertedSpecs);

  return convertedSpecs;
};
