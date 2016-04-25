var gulp = require('gulp');
var mocha = require('gulp-mocha');
var bg = require('gulp-bg');
var wait = require('gulp-wait');
var run = require('gulp-run');

var bgstart;

gulp.task('start', bgstart = bg('node', '.'));

gulp.task('test', ['start'], function () {
  return gulp.src('./test/test.js', {read: true}).pipe(wait(1500))
    .pipe(mocha({
            'reporter': 'mocha-junit-reporter',
            'reporterOptions': {
                'mochaFile': './report-mocha.xml'
            }
        }))
    .once('end', function () {
      bgstart.setCallback(function () { process.exit(0); });
      bgstart.stop(0);
    })
    .once('error', function () {
      bgstart.setCallback(function () { process.exit(0); });
      bgstart.stop(0);
    });
});

gulp.task('testdev', ['start'], function () {
  return gulp.src('./test/test.js', {read: true}).pipe(wait(1500))
    .pipe(mocha({reporter: 'nyan'}))
    .once('end', function () {
      bgstart.setCallback(function () { process.exit(0); });
      bgstart.stop(0);
    })
    .once('error', function () {
      bgstart.setCallback(function () { process.exit(0); });
      bgstart.stop(0);
    });
});

gulp.task('default', ['start', 'test']);
