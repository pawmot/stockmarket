'use strict';

var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var debug = require('gulp-debug');
var inject = require('gulp-inject');
var tsc = require('gulp-typescript');
var tslint = require('gulp-tslint');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var Config = require('./gulpfile.config');
var tsProject = tsc.createProject('tsconfig.json');
var browserSync = require('browser-sync').create();
var runSequence = require('run-sequence');
var nodemon = require('nodemon');
var sass = require('gulp-sass');

var config = new Config();

/**
 * Generates the app.d.ts references file dynamically from all application *.ts files.
 */
// gulp.task('gen-ts-refs', function () {
//     var target = gulp.src(config.appTypeScriptReferences);
//     var sources = gulp.src([config.allTypeScript], {read: false});
//     return target.pipe(inject(sources, {
//         starttag: '//{',
//         endtag: '//}',
//         transform: function (filepath) {
//             return '/// <reference path="../..' + filepath + '" />';
//         }
//     })).pipe(gulp.dest(config.typings));
// });

gulp.task('front-ts-lint', function () {
    return gulp.src(config.frontendTypeScriptFiles).pipe(tslint()).pipe(tslint.report('prose'));
});

gulp.task('back-ts-lint', function () {
    return gulp.src(config.backendTypeScriptFiles).pipe(tslint()).pipe(tslint.report('prose'));
});

function compileTs(typeScriptSources, root) {
    var sourceTsFiles;
    if(typeScriptSources.constructor !== Array) {
        sourceTsFiles = [typeScriptSources,
                         config.libraryTypeScriptDefinitions];
    } else {
        sourceTsFiles = typeScriptSources.slice();
        sourceTsFiles.push(config.libraryTypeScriptDefinitions);
    }

    var tsResult = gulp.src(sourceTsFiles)
                       .pipe(sourcemaps.init())
                       .pipe(tsc(tsProject));

    tsResult.dts.pipe(gulp.dest(root));

    return tsResult.js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(root));
}

gulp.task('compile-backend-ts-debug', function () {
    return compileTs(config.backendTypeScriptFiles, config.sources);
});

gulp.task('compile-frontend-ts-debug', function () {
    return compileTs(config.frontendTypeScriptFiles, config.publicRoot);
});

gulp.task('clean-ts', function (cb) {
  var typeScriptGenFiles = [
                              config.sources +'/**/*.js',
                              config.sources +'/**/*.js.map',
                              '!' + config.bowerComponents
                           ];

  // delete the files
  del(typeScriptGenFiles, cb);
});

gulp.task('transpile-scss', function() {
    gulp.src(config.scssFiles)
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['> 5%'],
            cascade: true
        }))
        .pipe(gulp.dest(config.cssDir));
})

gulp.task('watch', function() {
    gulp.watch([config.backendTypeScriptFiles], ['back-ts-lint', 'compile-backend-ts-debug']);
    gulp.watch([config.frontendTypeScriptFiles], ['front-ts-lint', 'compile-frontend-ts-debug']);
    gulp.watch([config.scssFiles], ['transpile-scss']);
});

gulp.task('nodemon', function(cb) {
var started = false;

    return nodemon({
        script: config.startScript,
    nodeArgs: ['--debug']
    }).on('start', function () {
        // to avoid nodemon being started multiple times
        // thanks @matthisk
        if (!started) {
            cb();
            started = true;
        }
    }).on('restart', function() {
        setTimeout(function() {
            browserSync.reload(true);
        }, config.browsersyncRestartDelay);
    });
});

gulp.task('serve', ['nodemon', 'watch'], function() {
    browserSync.init({
        port: 7000,
        proxy: "http://localhost:3000",
        files: [
            config.publicRoot + '/**/*.js',
            config.publicRoot + '/**/*.html',
            config.publicRoot + '/**/*.css',
            '!' + config.bowerComponents
        //'!' + config.publicRoot + '/scss/**/*.scss'
        ],
        loglevel: "debug"
    });
});

gulp.task('default', ['ts-lint', 'compile-ts']);