import pkg from './package.json';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

const LIBRARY_NAME = 'source';
const GLOBALS = {};
const banner = `/*!
 * ${pkg.name}
 * ${pkg.description}
 *
 * @version v${pkg.version}
 * @homepage ${pkg.homepage}
 * @repository ${pkg.repository.url}
 * @author ${pkg.author}
 * @license ${pkg.license}
 */`;

export default {
    input: 'index.js',
    external: Object.keys(pkg['dependencies'] || []),
    output: [
        {
            banner,
            name: LIBRARY_NAME,
            file: pkg.unpkg, // UMD
            format: 'umd',
            exports: 'auto',
            globals: GLOBALS
        },
        {
            banner,
            file: pkg.main, // CommonJS
            format: 'cjs',
            // We use `default` here as we are only exporting one thing using `export default`.
            // https://rollupjs.org/guide/en/#outputexports
            exports: 'auto',
            globals: GLOBALS
        },
        {
            banner,
            file: pkg.module, // ESM
            format: 'es',
            exports: 'default',
            globals: GLOBALS
        }
    ],
    plugins: [
        babel({
            babelHelpers: 'bundled',
            exclude: ['node_modules/**']
        }),
        terser({
            output: {
                comments: /^!/
            }
        })
    ]
}
