const gulp = require('gulp')
const fs = require('fs-extra')
const { basename, dirname } = require('path')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')
const browserSync = require('browser-sync').create()
const loadPlugins = require('gulp-load-plugins')
const $ = loadPlugins()

const {
  readYamlFile,
  banner,
  config: {
    devDir = 'dev',
    distDir = 'dist',
    sassConfig = {},
    base64Config = {},
    pugConfig = {},
  },
} = require('./utils')
const isProduction = () => process.env.NODE_ENV === 'production'
const destDir = () => (isProduction() ? distDir : devDir)
const minify = Boolean(process.env.minify)

/**
 * Inject data of Object to pug
 * @param {string} file File
 */
const injectPugData = file => {
  const viewsDir = dirname(file.path)
  const globalDataPath = `${viewsDir}/data/global.yml`
  const localDataPath = `${viewsDir}/data/${basename(file.path, '.pug')}.yml`
  const globalData = readYamlFile(globalDataPath)
  const localData = readYamlFile(localDataPath)

  return Object.assign(globalData, { local: localData })
}

/**
 * Clean dest folder
 */
const clean = () => fs.remove(destDir())

/**
 * Handle SCSS
 */
function styles () {
  return gulp
    .src('src/scss/**/*.scss')
    .pipe($.plumber())
    .pipe($.changed(`${destDir()}/css`))
    .pipe($.sass(sassConfig).on('error', $.sass.logError))
    .pipe($.postcss())
    .pipe($.if(minify, $.base64(base64Config)))
    .pipe($.if(isProduction(), $.banner(banner)))
    .pipe(gulp.dest('src/css'))
    .pipe($.if(minify, $.cleanCss()))
    .pipe(gulp.dest(`${destDir()}/css`))
}

/**
 * Handle JS
 */
function scripts () {
  return gulp
    .src('src/js/**/*.js')
    .pipe($.plumber())
    .pipe($.changed(`${destDir()}/js`))
    .pipe($.babel())
    .pipe($.if(minify, $.uglify()))
    .pipe(gulp.dest(`${destDir()}/js`))
}

/**
 * Handle Images
 */
function images () {
  return gulp
    .src('src/img/**/*.{jpg,jpeg,png,gif,svg}')
    .pipe($.plumber())
    .pipe($.changed(`${destDir()}/img`))
    .pipe(
      $.if(
        minify,
        $.imagemin([
          $.imagemin.gifsicle({ interlaced: true }),
          $.imagemin.jpegtran({ progressive: true }),
          $.imagemin.optipng({ optimizationLevel: 7 }),
          $.imagemin.svgo(),
          imageminMozjpeg({ quality: 70 }),
          imageminPngquant({ quality: [0.65, 0.8] }),
        ])
      )
    )
    .pipe(gulp.dest(`${destDir()}/img`))
    .pipe($.size({ title: 'Images total size' }))
}

/**
 * Handle Fonts
 */
function fonts () {
  return gulp
    .src('src/fonts/**/*')
    .pipe($.plumber())
    .pipe($.changed(`${destDir()}/fonts`))
    .pipe(gulp.dest(`${destDir()}/fonts`))
}

/**
 * Handle Pug
 */
function views () {
  return gulp
    .src('src/views/*.pug')
    .pipe($.plumber())
    .pipe($.data(injectPugData))
    .pipe($.pug(pugConfig))
    .pipe($.rename({ extname: '.html' }))
    .pipe($.formatHtml())
    .pipe(gulp.dest(`${destDir()}`))
}

/**
 * Handle HTML
 */
function html () {
  return gulp
    .src('src/*.html')
    .pipe($.plumber())
    .pipe($.changed(`${destDir()}`))
    .pipe(gulp.dest(`${destDir()}`))
}

/**
 * Handle Static files
 */
function statics () {
  return gulp
    .src('src/static/**/*')
    .pipe($.plumber())
    .pipe($.changed(`${destDir()}/static`))
    .pipe(gulp.dest(`${destDir()}/static`))
}

/**
 * Create server when development and auto refresh
 */
function server () {
  browserSync.init({
    server: {
      baseDir: `./${devDir}`,
    },
  })

  gulp.watch('src/*.html', html)
  gulp.watch('src/views/**/*.{yml,pug}', views)
  gulp.watch('src/scss/**/*.scss', styles)
  gulp.watch('src/js/**/*.js', scripts)
  gulp.watch('src/img/**/*', images)
  gulp.watch('src/fonts/**/*', fonts)
  gulp.watch('src/static/**/*', statics)
  gulp.watch('src/**/*').on('change', browserSync.reload)
}

exports.dev = async () => {
  process.env.NODE_ENV = 'development'

  await gulp.series(
    clean,
    gulp.parallel(styles, scripts, images, statics, fonts, views, html),
    server
  )()
}

exports.build = async () => {
  process.env.NODE_ENV = 'production'

  await gulp.series(
    clean,
    gulp.parallel(scripts, styles, images, statics, fonts, views, html)
  )()
}
