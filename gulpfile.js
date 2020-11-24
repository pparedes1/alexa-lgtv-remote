const babel = require('gulp-babel');
const eslint = require('gulp-eslint7');
const gulp = require('gulp');
const merge = require('merge-stream');
const nodemon = require('nodemon');

gulp.task('lint', lint);
gulp.task('lint').description='lints all the code';


gulp.task('build', gulp.series(lint,builder));
gulp.task('build').description='builds project, converting files into dist';

gulp.task('watch', gulp.series(watcher, 'build'));
gulp.task('watch').description='watches any changes or additions to the code';

gulp.task('serve', gulp.parallel('watch', startServer));
gulp.task('serve').description='serves the nodemon and watches files';

function lint () {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(['**/*.js','!node_modules/**'])
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.        
        .pipe(eslint({fix:true}))
        .pipe(eslint.format())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.failAfterError());
}

function builder () {
    var src = gulp.src('src/**/*.js')
        .pipe(babel())
        .pipe(gulp.dest('dist/src'));

    var bin = gulp.src('bin/**/*.js')
        .pipe(babel())
        .pipe(gulp.dest('dist/bin'));

    var index = gulp.src('index.js')
        .pipe(babel())
        .pipe(gulp.dest('dist/'));

    var locales = gulp.src('src/locales/**/*')
        .pipe(gulp.dest('dist/src/locales'));

    return merge(src, bin, index, locales);
}


function watcher() {
    var watcher=gulp.watch(['index.js','bin/**/*.js','src/locales/**/*','src/**/*.js',], gulp.series('build')); //watch these files and then build after
    watcher.on('all', function(event, path) {
        console.log('File ' + path + ' was ' + event + ', starting build tasks...');
    });
}

function startServer() {
    return nodemon({
        script: 'dist/index.js',
    });}