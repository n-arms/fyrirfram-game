const esbuild = require('esbuild')


esbuild.build({
  entryPoints: ['./src/index.ts'],
  outfile: 'lib/index.js',
  bundle: true,
  minify: true,
  platform: 'browser',
  sourcemap: true,
  target: ["chrome58"],//"edge16","firefox57","node12","safari11"],//'node14',
  plugins: []
}).catch(() => process.exit(1))