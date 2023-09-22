/*jshint esversion:6 */

/**
 * USE with
 * 
 * gulp init - Concatenates Abrantes with the plugins in this Gulpfile
 * gulp minify - Minifies Abrantes and the plugins
 * 
 * 
 */

const { src, dest, series, watch } = require('gulp');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const rename = require('gulp-rename');

/**
 * It will concatenate Abrantes with the plugins in the src of this function
 */
function init() {
    return src([
        'Abrantes.js',
        'plugins/ga4-gtag.js',
        // 'plugins/matomo.js',
        // 'plugins/hotjar.js',
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
        .pipe(terser())
        .pipe(rename({ suffix: ".min" }))
        .pipe(dest('./'));
}

exports.init = init;
exports.minify = minify;
