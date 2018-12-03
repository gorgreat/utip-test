var
  gulp = require('gulp'), //Подключаем gulp
  less = require('gulp-less'), //Подключаем less пакет
  browserSync = require('browser-sync'), // Подключаем Browser Sync
  concat = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
  uglify = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
  cssnano = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
  rename = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
  del = require('del'), // Подключаем библиотеку для удаления файлов и папок    
  imagemin = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
  pngquant = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
  cache = require('gulp-cache'), // Подключаем библиотеку кеширования
  autoprefixer = require('gulp-autoprefixer'), // Подключаем библиотеку для автоматического добавления префиксов
  babel = require('gulp-babel'), // babel нужен для перевода в ES5
  useref = require('gulp-useref');

gulp.task('less', function () { // Создаем таск "less"
  return gulp.src('app/less/style.less') // Берем источник
    .pipe(less()) // Преобразуем Sass в CSS посредством gulp-sass
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
      cascade: true
    })) // Создаем префиксы    
    .pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
    .pipe(browserSync.reload({
      stream: true
    })) // Обновляем CSS на странице при изменении    
});

gulp.task('browser-sync', function () { // Создаем таск browser-sync
  browserSync({ // Выполняем browser Sync
    proxy: 'utip-test',
    notify: false // Отключаем уведомления
  });
});



gulp.task('babel', function () {
  return gulp.src('app/js/ready/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('app/js/es2015'));
});

gulp.task('scriptsMinify', function () {
  return gulp.src([
    'app/js/es2015/*.*'
    ])
    .pipe(concat('scripts.min.js')) // Собираем их в кучу в новом файле libs.min.js
    .pipe(uglify()) // Сжимаем JS файл
    .pipe(gulp.dest('dist/js/')); // Выгружаем в папку app/js
});



gulp.task('scripts', function () {
  gulp.src('app/js/*.js')
    .pipe(concat('main.js'))
    /*        .pipe(uglify())*/
    .pipe(gulp.dest('app/js/ready'));
});



gulp.task('css-libs', ['less'], function () {
  return gulp.src('app/css/style.css') // Выбираем файл для минификации
    .pipe(cssnano()) // Сжимаем
    .pipe(rename({
      suffix: '.min'
    })) // Добавляем суффикс .min
    .pipe(gulp.dest('app/css')); // Выгружаем в папку app/css
});

gulp.task('img', function () {
  return gulp.src('app/img/**/*') // Берем все изображения из app
    .pipe(cache(imagemin({ // Сжимаем их с наилучшими настройками с учетом кеширования
      interlaced: true,
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      use: [pngquant()]
    })))
    .pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'], function () {
  gulp.watch('app/less/**/*.less', ['less']); // Наблюдение за less файломи
  gulp.watch('app/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
  gulp.watch('app/**/*.php', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
  gulp.watch('app/js/*.js', browserSync.reload); // Наблюдение за JS файлами в папке js

});

gulp.task('clean', function () {
  return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('build', ['clean', 'img', 'less', 'scripts', 'babel', 'scriptsMinify'], function () {
  var buildCss = gulp.src([ // Переносим CSS стили в продакшен
    'app/css/style.css',
    'app/css/style.min.css'
    ])
    .pipe(gulp.dest('dist/css'))
  var php = gulp.src([
    'app/feedback/*.*',
  ])
    .pipe(gulp.dest('dist/feedback'))
  var phptpl = gulp.src([
    'app/feedback/tpl/*.*',
  ])
    .pipe(gulp.dest('dist/feedback/tpl'))
  var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
    .pipe(gulp.dest('dist/fonts'))
  var buildJs = gulp.src('app/js/es2015/*.*') // Переносим скрипты в продакшен
    .pipe(gulp.dest('dist/js'))
  var buildHtml = gulp.src('app/*.*') // Переносим HTML в продакшен
    .pipe(gulp.dest('dist'));
});

gulp.task('clear', function () { // автономный таск для очистки кеша Gulp
  return cache.clearAll();
})

gulp.task('default', ['watch']); //Делаем таск watch по умолчанию
