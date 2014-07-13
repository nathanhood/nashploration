'use strict';

module.exports = function(grunt){
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // ---------------------------------------------------------------------- //
    watch: {
      code: {
        files: ['Gruntfile.js', 'test/**/*.js', 'app/**/*.js', '!app/static/js/vendor/**/*.js', '!app/static/js/es6/compiled/**/*.js'],
        tasks: ['jshint:all', 'traceur']
      }
    },
    // ---------------------------------------------------------------------- //
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        'test/**/*.js',
        'app/**/*.js',
        '!app/static/js/vendor/**/*.js',
        '!app/static/js/es6/compiled/**/*.js'
      ]
    },
    // ---------------------------------------------------------------------- //
    traceur: {
      build: {
        files: [{
          cwd: 'app/static/js/es6',
          src: '**/*.es6.js',
          dest: 'app/static/js/es6/compiled',
          ext: '.js',
          expand: true
        }]
      }
    }
    // ---------------------------------------------------------------------- //
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', ['jshint:all', 'traceur']);
  grunt.registerTask('default', ['build', 'watch']);

  grunt.registerMultiTask('traceur', 'ES6 to ES5', function(){
    var exec  = require('child_process').exec;
    var cmd;

    this.files.forEach(function(f){
      cmd = './tools/traceur-compiler/traceur --sourcemap --experimental --out '+f.dest+' --script ' + f.src[0];
      console.log(cmd);

      exec(cmd, function(error, stdout, stderr){
        console.log(error);
        console.log(stdout);
        console.log(stderr);
      });
    });
  });
};
