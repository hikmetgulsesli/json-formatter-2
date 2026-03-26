import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/index.tsx'],
  bundle: true,
  outfile: 'dist/bundle.js',
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  minify: false,
  jsx: 'automatic',
  jsxImportSource: 'react',
});
