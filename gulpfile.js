/* eslint-disable no-undef */
/*jshint esversion:6 */

/**
 * USE with
 * 
 * gulp init - Concatenates Abrantes with the plugins in this Gulpfile
 * gulp minify - Minifies Abrantes and the plugins
 * 
 * 
 */

// eslint-disable-next-line no-unused-vars
const { src, dest, series, watch } = require('gulp');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');

/**
 * It will concatenate Abrantes with the plugins in the src of this function
 */
function init() {
    return src([
        'Abrantes.js',
        'plugins/ga4-gtag.js',
        // 'plugins/matomo.js',
        'plugins/hotjar.js',
        // 'plugins/clarity.js',
        'plugins/formtrack.js',
        'plugins/add2DL.js',
        'plugins/log.js',
        'plugins/seed.js',
    ])
        .pipe(concat("AbrantesPlus.js"))
        .pipe(dest('./'));
}

/**
 * Minifies the file wih Abrantes and the plugins
 */
function minify() {
    return src([
        'AbrantesPlus.js',
    ])
        .pipe(sourcemaps.init())
        .pipe(terser())
        .pipe(rename({ suffix: ".min" }))
        .pipe(sourcemaps.write('./'))
        .pipe(dest('./'));
}

/**
 * Creates the ES6 module version (AbrantesPlusMod.js)
 * Concatenates files and adds module export at the end
 */
function initMod() {
    const { Transform } = require('stream');

    // Custom transform to add ES6 export at the end
    const addModuleExport = new Transform({
        objectMode: true,
        transform(file, encoding, callback) {
            if (file.isBuffer()) {
                const moduleExport = `
// ES6 Module export - also expose globally for backward compatibility
if (typeof window !== 'undefined') {
    window.Abrantes = Abrantes;
}

export default Abrantes;
`;
                file.contents = Buffer.concat([file.contents, Buffer.from(moduleExport)]);
            }
            callback(null, file);
        }
    });

    return src([
        'Abrantes.js',
        'plugins/ga4-gtag.js',
        // 'plugins/matomo.js',
        'plugins/hotjar.js',
        // 'plugins/clarity.js',
        'plugins/formtrack.js',
        'plugins/add2DL.js',
        'plugins/log.js',
        'plugins/seed.js',
    ])
        .pipe(concat("AbrantesPlusMod.js"))
        .pipe(addModuleExport)
        .pipe(dest('./'));
}

/**
 * Minifies the ES6 module version
 */
function minifyMod() {
    return src([
        'AbrantesPlusMod.js',
    ])
        .pipe(sourcemaps.init())
        .pipe(terser({
            module: true
        }))
        .pipe(rename({ suffix: ".min" }))
        .pipe(sourcemaps.write('./'))
        .pipe(dest('./'));
}

exports.init = init;
exports.initMod = initMod;
exports.minify = minify;
exports.minifyMod = minifyMod;
