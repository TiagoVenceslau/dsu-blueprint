const gulp = require('gulp');
const {src, dest, parallel, series} = gulp;
const ts = require('gulp-typescript');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const concat = require('gulp-concat');

const tsOptions = {
    "emitDeclarationOnly": true,
    "sourceMap": false,
    "declarationMap": false
};

function exportModules() {
    const tsProject = ts.createProject('tsconfig.json', tsOptions);
    return src('src/!tests/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(babel({
            presets: [['@babel/preset-env', {
                targets: {"esmodules": true}
            }]]
        }))
        .pipe(uglify())
        .pipe(rename({ extname: '.min.esm.js' }))
        .pipe(sourcemaps.write())
        .pipe(dest('dist/esm/'));
}

function exportCoreModules() {
    const tsProject = ts.createProject('tsconfig.json', tsOptions);
    return src('src/core/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(babel({
            presets: [['@babel/preset-env', {
                targets: {"esmodules": true}
            }]]
        }))
        .pipe(uglify())
        .pipe(rename({ extname: '.min.esm.js' }))
        .pipe(sourcemaps.write())
        .pipe(dest('dist/core/esm/'));
}

function exportDefault() {
    const tsProject = ts.createProject('tsconfig.json', tsOptions);
    return src('src/!tests/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(babel())
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(sourcemaps.write())
        .pipe(dest('dist/'));
}

function exportCoreDefault() {
    const tsProject = ts.createProject('tsconfig.json', tsOptions);
    return src('src/core/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(babel())
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(sourcemaps.write())
        .pipe(dest('dist/core/'));
}

function exportModulesBundles() {
    const tsProject = ts.createProject('tsconfig.json', tsOptions);
    return src('src/!tests/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(babel({
            presets: [['@babel/preset-env', {
                targets: {"esmodules": true}
            }]]
        }))
        .pipe(concat('index.bundle.js'))
        .pipe(uglify())
        .pipe(rename({ extname: '.min.esm.js' }))
        .pipe(sourcemaps.write())
        .pipe(dest('dist/esm/'));
}

function exportCoreModulesBundles() {
    const tsProject = ts.createProject('tsconfig.json', tsOptions);
    return src('src/core/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(babel({
            presets: [['@babel/preset-env', {
                targets: {"esmodules": true}
            }]]
        }))
        .pipe(concat('index.bundle.js'))
        .pipe(uglify())
        .pipe(rename({ extname: '.min.esm.js' }))
        .pipe(sourcemaps.write())
        .pipe(dest('dist/core/esm/'));
}

function exportDefaultBundles() {
    const tsProject = ts.createProject('tsconfig.json', tsOptions);
    return src('src/!tests/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(babel())
        .pipe(concat('index.bundle.js'))
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(sourcemaps.write())
        .pipe(dest('dist/'));
}

function exportCoreDefaultBundles() {
    const tsProject = ts.createProject('tsconfig.json', tsOptions);
    return src('src/core/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(babel())
        .pipe(concat('index.bundle.js'))
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(sourcemaps.write())
        .pipe(dest('dist/core/'));
}

exports.default = series(parallel(series(exportDefault, exportDefaultBundles), series( exportModules, exportModulesBundles)), parallel(series(exportCoreDefault, exportCoreDefaultBundles), series(exportCoreModules, exportCoreModulesBundles)));