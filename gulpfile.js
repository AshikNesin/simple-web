// Based on Una's Gulp Starter Kit (https://github.com/una/gulp-starter-env)
const gulp = require('gulp'),
    sass = require('gulp-sass'),
    rename = require('gulp-rename'),
    cssmin = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    scsslint = require('gulp-sass-lint'),
    cache = require('gulp-cached'),
    prefix = require('gulp-autoprefixer'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    minifyHTML = require('gulp-minify-html'),
    size = require('gulp-size'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    plumber = require('gulp-plumber'),
    deploy = require('gulp-gh-pages'),
    notify = require('gulp-notify'),
    babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps'),
    eslint = require('gulp-eslint'),
    del = require('del');




gulp.task('scss', () => {
    let onError = function(err) {
        notify.onError({
            title: "Gulp",
            subtitle: "Failure!",
            message: "Error: <%= error.message %>",
            sound: "Beep"
        })(err);
        this.emit('end');
    };

    return gulp.src('src/assets/scss/main.scss')
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sass())
        .pipe(size({ gzip: true, showFiles: true }))
        .pipe(prefix())
        .pipe(rename('styles.css'))
        // .pipe(gulp.dest('dist/assets/css'))
        .pipe(cssmin())
        .pipe(size({ gzip: true, showFiles: true }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/assets/css'))
        .pipe(reload({ stream: true }))

});


gulp.task('js', () => {
    return gulp.src('src/assets/js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify())
        .pipe(size({ gzip: true, showFiles: true }))
        .pipe(concat('bundle.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/assets/js'))
        .pipe(reload({ stream: true }));

});

gulp.task('scss-lint', () => {
    return gulp.src('src/assets/scss/**/*.scss')
        .pipe(cache('scsslint'))
        .pipe(scsslint());
});

gulp.task('minify-html', () => {
    let opts = {
        comments: true,
        spare: true
    };

    return gulp.src('src/*.html')
        .pipe(minifyHTML(opts))
        .pipe(gulp.dest('dist/'))
        .pipe(reload({ stream: true }));
});

gulp.task('eslint', () => {
    return gulp.src(['src/assets/js/**/*.js', '!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('imgmin', () => {
    return gulp.src('src/assets/img/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dist/assets/img'));
});
gulp.task('browser-sync', () => {
    browserSync({
        server: {
            baseDir: "dist/"
        }
    });
});

gulp.task('deploy', () => {
    return gulp.src('dist/**/*')
        .pipe(deploy());
});

gulp.task('watch', () => {
    gulp.watch('src/assets/scss/**/*.scss', ['scss']);
    gulp.watch('src/assets/js/*.js', ['js']);
    gulp.watch('src/*.html', ['minify-html']);
    gulp.watch('src/assets/img/*', ['imgmin']);
});

// gulp.task('build',() => {

// })
gulp.task('clean', () => del(['dist/**/*']))


gulp.task('serve', ['browser-sync', 'js', 'imgmin', 'minify-html', 'scss', 'watch']);

gulp.task('default', ['serve']);
