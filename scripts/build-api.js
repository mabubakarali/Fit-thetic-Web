import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

let esbuild;
try {
  esbuild = require('esbuild');
} catch {
  esbuild = require(path.resolve(__dirname, '../client/node_modules/esbuild'));
}

async function build() {
  await esbuild.build({
    entryPoints: [path.resolve(__dirname, '../server/src/serverless.ts')],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: path.resolve(__dirname, '../api/index.js'),
    external: [
      'mongodb-memory-server',
    ],
    banner: {
      js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
    },
  });
  console.log('✅ [Build] Successfully bundled serverless API handler into api/index.js');
}

build().catch((err) => {
  console.error('[Build Error]', err);
  process.exit(1);
});
