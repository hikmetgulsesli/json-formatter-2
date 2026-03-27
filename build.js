import * as esbuild from 'esbuild';

const result = await esbuild.build({
  entryPoints: ['src/index.tsx'],
  bundle: true,
  outfile: 'dist/bundle.js',
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  minify: false,
  jsx: 'automatic',
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
  },
});

if (result.errors.length > 0) {
  console.error('Build errors:', result.errors);
  process.exit(1);
}
