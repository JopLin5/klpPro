var gulp = require('gulp');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
const javascriptObfuscator = require('gulp-javascript-obfuscator');
var babel=require('gulp-babel');
// uncss = require('gulp-uncss');
// gulp.task('uncss',  async()=>{   
//   gulp.src('pages/goods/list/*.wxss')   
//   .pipe(uncss({  
//          html: ['pages/goods/list/*.wxml']
//          })) 
//         .pipe(gulp.dest('./pages/uncss')); 
//  });
gulp.task('script', async () =>{
  gulp.src('./*.js')
    .pipe(babel({
                presets: ['es2015'] // es5检查机制
            }))
    .pipe(javascriptObfuscator({
        compact: true
    }))
	 .on('error', function(err) {
                gutil.log(gutil.colors.red('[Error]'), err.toString());
            })
    .pipe(gulp.dest('./pages/uncss')); 
 
})
