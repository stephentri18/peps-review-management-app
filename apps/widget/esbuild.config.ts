/// <reference types="node" />
import * as esbuild from 'esbuild';

const isDev = process.argv.includes('--watch');

const ctx = await esbuild.context({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: !isDev,
  format: 'iife',
  globalName: 'ReviewsWidget',
  target: ['es2018'],
  outfile: 'dist/widget.js',
  sourcemap: isDev ? 'inline' : false,
  loader: { '.css': 'text' },      // ← import CSS as a plain string
  define: {
    'process.env.API_BASE': JSON.stringify(
      process.env.API_BASE ?? 'http://localhost:4000'
    ),
  },
});

if (isDev) {
  await ctx.watch();
  console.log('[Widget] Watching...');
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log('[Widget] Built → dist/widget.js');
}