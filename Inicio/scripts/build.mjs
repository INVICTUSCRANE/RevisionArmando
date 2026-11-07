/**
 * Compila el sitio en /dist:
 *   dist/css/app.css  ← Tailwind (src/styles/main.css)
 *   dist/js/app.js    ← módulos de src/js empaquetados en un solo archivo (funciona sin servidor)
 *   dist/fonts/*      ← fuentes Barlow
 * Uso: `npm run build` (producción) o `npm run dev` (recompila al guardar).
 */
import { spawn } from 'node:child_process';
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');
const require = createRequire(import.meta.url);

function copyFonts() {
    mkdirSync('dist/fonts', { recursive: true });
    const files = {
        '@fontsource/barlow': ['400', '500', '600'].map(w => `barlow-latin-${w}-normal.woff2`),
        '@fontsource/barlow-condensed': ['500', '600', '700'].map(w => `barlow-condensed-latin-${w}-normal.woff2`)
    };
    for (const [pkg, names] of Object.entries(files)) {
        const dir = join(dirname(require.resolve(`${pkg}/package.json`)), 'files');
        names.forEach(name => copyFileSync(join(dir, name), join('dist/fonts', name)));
    }
}

function buildCss() {
    const args = ['tailwindcss', '-i', 'src/styles/main.css', '-o', 'dist/css/app.css', watch ? '--watch' : '--minify'];
    const child = spawn('npx', args, { stdio: 'inherit', shell: process.platform === 'win32' });
    return watch ? Promise.resolve() : new Promise((resolve, reject) => child.on('exit', code => (code ? reject(new Error(`tailwindcss terminó con código ${code}`)) : resolve())));
}

async function buildJs() {
    const options = {
        entryPoints: ['src/js/main.js'],
        bundle: true,
        format: 'iife',
        target: ['es2020'],
        outfile: 'dist/js/app.js',
        minify: !watch,
        sourcemap: true,
        logLevel: 'info'
    };
    if (watch) await (await esbuild.context(options)).watch();
    else await esbuild.build(options);
}

copyFonts();
await Promise.all([buildCss(), buildJs()]);
