var lazypipe = require('lazypipe');

//jshint camelcase:false
module.exports = function (gulp, $, gutil, helpers, src, options) {
  'use strict';

  // Leveraging lazypipe
  var compassTask = lazypipe()
    // Run compass (TODO THIS PLUGIN IS REALLY MESSED UP)
    .pipe($.compass, {
      config_file: 'app/config.rb',
      css: 'app/styles/css',
      sass: 'app/styles',
      image: 'app/images'
    })
    // Autoprefix properties which last version are still red
    .pipe($.autoprefixer, options.autoprefix)
    // Concat css file
    .pipe($.concat, options.name + '.css')
    .pipe($.concatUtil.header, helpers.banner(options));

  // Minify css
  var minifyCssTask = lazypipe()
    // Add min js extension
    .pipe($.rename, {suffix: '.min'})
    // uglify
    .pipe($.minifyCss)
    // Add header on top on the minified file
    .pipe($.concatUtil.header, helpers.banner(options));

  // --------------------------------------------

  // Run compass
  gulp.task('compass', 'Compile sass files using compass', function () {
    return gulp.src(src.sass, {cwd: src.cwd})
      // Only process changed files
      .pipe($.changed(src.stylesDir))
      .pipe(compassTask())
      .on('error', helpers.logError)
      // And write in the styles dir
      .pipe(gulp.dest(src.stylesDir, {cwd: src.tmp}))
      .pipe($.size())
      .pipe($.connect.reload())
      // Run minify only if --min
      .pipe($.if(gutil.env.min, minifyCssTask()))
      // then write the min file
      .pipe($.if(gutil.env.min, gulp.dest(src.stylesDir, {cwd: src.tmp})))
      .pipe($.if(gutil.env.min, $.size()));
  });

  gulp.task('minifycss', 'Minify css', function () {
    // Exclude min css
    return gulp.src([src.css, '!**/*.min.css'], {cwd: src.tmp})
      .pipe(minifyCssTask())
      .on('error', helpers.logError)
      // then write the min file
      .pipe(gulp.dest(src.stylesDir, {cwd: src.tmp}))
      .pipe($.size());
  });

};
