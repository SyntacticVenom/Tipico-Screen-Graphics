const { task, src, dest, watch, series } = require('gulp')
const cssnano = require('gulp-cssnano')
const autoprefixer = require('gulp-autoprefixer')
const rename = require('gulp-rename')
const plumber = require('gulp-plumber')
const sourcemaps = require('gulp-sourcemaps')
const del = require('del')
const sass = require('gulp-sass')
const pug = require('gulp-pug');
const postcss = require('gulp-postcss')
const postcssEnvFunction = require('postcss-env-function')
const imagemin = require('gulp-imagemin')

//* Style files *//
const scssAllFiles = './assets/src/scss/**/*.scss'
const distCss = './assets/dist/css'

//* Images *//
const img = './assets/src/images/**/*'
const distImg = './assets/dist/images'

//* Fonts *//
const fonts = './assets/src/fonts/**/*'
const distFonts = './assets/dist/fonts'

//* PUG *//
const pugFiles = './assets/src/*.pug'
// const distMinHTML = './assets/dist/'
const distHTML = './'

//* Task for images minification *//
task('image-min', () => {
  return src(img)
      .pipe(imagemin())
      .pipe(dest(distImg))
})

//* Task for compile SCSS in CSS *//
task('scss-compile', () => {
  const plugins = [postcssEnvFunction({
    importFrom: [{
      // Breakpoints | Example: @media (min-width: env(--md)) {}
      environmentVariables: {
        '--xs': '480px',
        '--sm': '768px',
        '--md': '1024px',
        '--lg': '1200px',
        '--xl': '1300px',
        '--xxl': '1400px',
      }
    }]
  })]
  return src([scssAllFiles])
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(autoprefixer({
        overrideBrowserslist: ['last 4 versions'],
        cascade: false
      }))
      .pipe(rename({suffix: '.min'}))
      .pipe(postcss(plugins))
      .pipe(sourcemaps.write('.'))
      .pipe(dest(distCss))
})

//* Task for minification and removing map links for all styles *//
task('dist-styles', () => {
  const plugins = [postcssEnvFunction({
    importFrom: [{
      // Breakpoints | Example: @media (min-width: env(--md)) {}
      environmentVariables: {
        '--xs': '480px',
        '--sm': '768px',
        '--md': '1024px',
        '--lg': '1200px',
        '--xl': '1300px',
        '--xxl': '1400px',
      }
    }]
  })]
  return src([scssAllFiles])
      .pipe(plumber())
      .pipe(sass().on('error', sass.logError))
      .pipe(autoprefixer({
        overrideBrowserslist: ['last 4 versions'],
        cascade: false
      }))
      .pipe(cssnano({
        discardComments: {removeAll: true}
      }))
      .pipe(rename({suffix: '.min'}))
      .pipe(postcss(plugins))
      .pipe(dest(distCss))
})

//* Task for compile PUG files *//
task('pug-compile', () => {
  return src(pugFiles)
      .pipe(pug())
      // .pipe(rename({suffix: '.min'}))
      .pipe(dest(distHTML))
})

//* Task for coping fonts to assets folder *//
task('dist-fonts', () => {
  // const s = size();
  if(fonts) {
    return src(fonts)
        .pipe(dest(distFonts))
  }
})

//* Task for removing plugins temp styles and *.map files for debugging *//
task('clean', () => {
  return del([
    `${distCss}/**/*.map`
  ])
})

//* Task for cleaning dist folder *//
task('clean-dist', () => {
  return del('./assets/dist/**', { force: true })
})

//* Task for watching changes in SCSS files *//
task('watch', () => {
  watch(scssAllFiles, series('scss-compile'))
  watch(pugFiles, series('pug-compile'))
  watch(img, series('image-min'))
})

//* Task for running default GULP, run as "gulp" *//
task('default', series('scss-compile', 'pug-compile', 'image-min', 'dist-fonts', 'watch'))

//* Task for cleaning styles, JS and removing temp files, run as "gulp dist" *//
task('dist', series('clean-dist', 'scss-compile', 'pug-compile', 'image-min', 'dist-styles', 'dist-fonts', 'clean'))
