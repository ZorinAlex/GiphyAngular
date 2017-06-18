var gulp = require('gulp');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var rename = require('gulp-rename');

gulp.task('scripts', function(){
    gulp.src('app.js')
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('dist'));
});
gulp.task('css', function () {
    gulp.src('style.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('dist'));
});