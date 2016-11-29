var gulp = require('gulp');
   concat= require('gulp-concat')
   purify = require('gulp-purifycss');
   cleanCSS = require('gulp-clean-css');
   htmlreplace = require('gulp-html-replace');
   amphtmlValidator = require('amphtml-validator');
   merge = require('merge-stream');
   conn = require('gulp-connect');
   ngrok = require('ngrok');
   fs = require('fs');
   minify= require('minify')

const BUILD_PATH = './build';
const SOURCE = {
  'BOOTSTRAP_CSS': './html/css/bootstrap.min.css',
  'AMPHTML': './amphtml/index.html',
  'HTML' : './html/index.html',
  'CLEANED_CSS': './amphtml/css/bootstrap.min.css',
  'MI_ESTILO': './html/css/miestilo.css'
}

//Tarea Ambiente Dev
gulp.task('connectDev', function () {
  conn.server({    
    name: 'Dev App',
    port: 8000,
    root:'./html/',
    livereload: true
  });
 });

// Tarea Ambiente Prod
gulp.task('connectProd', function () {
  conn.server({
    name: 'Prod App',
    port: 9000,
    root:'./build/',
    livereload: true
  });
 });


// purify remueve clases CSS sin usar  
gulp.task('purify', function() {
  return gulp.src(SOURCE.BOOTSTRAP_CSS)
    .pipe(purify([SOURCE.AMPHTML]))
    .pipe(gulp.dest('./amphtml/css'));
});


//Concatenar css
gulp.task ('Concatenar', function() {
  return gulp.src(["./html/css/miestilo.css","./amphtml/css/bootstrap.min.css"])
        .pipe(concat('files.css'))
        .pipe(gulp.dest('./amphtml/css'));
        
});

// inline-css inserta  CSS limpio y minificado en el HTML del build
gulp.task('inline-css', function() {
  return gulp.src(SOURCE.AMPHTML)
    .pipe(htmlreplace({
      'cssInline': {
        'src': gulp.src(['./amphtml/css/files.css']).pipe(cleanCSS()),
        'tpl': '<style amp-custom>%s</style>'
      }
    }))
    .pipe(gulp.dest(BUILD_PATH));
});




// validate ensures the AMP HTML is valid
gulp.task('validate', function() {
  amphtmlValidator.getInstance().then(function (validator) {
    var input = fs.readFileSync(BUILD_PATH + '/index.html', 'utf8');
    var result = validator.validateString(input);
    ((result.status === 'PASS') ? console.log : console.error)(result.status);
    for (var ii = 0; ii < result.errors.length; ii++) {
      var error = result.errors[ii];
      var msg = 'line ' + error.line + ', col ' + error.col + ': ' + error.message;
      if (error.specUrl !== null) {
        msg += ' (see ' + error.specUrl + ')';
      }
      ((error.severity === 'ERROR') ? console.error : console.warn)(msg);
    }
  });
});



gulp.task('default', ['connectDev','connectProd','purify','Concatenar','inline-css']);
