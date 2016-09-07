/*jshint multistr: true */
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Default package configuration.
    pkg: grunt.file.readJSON('package.json'),

    // Define a banner to added to the compiled assets.
    banner: "/* <%= pkg.name %> v<%= pkg.version %> | " +
            "(c) <%= grunt.template.today('yyyy') %> <%= pkg.author %>. | " +
            "http://www.apache.org/licenses/LICENSE-2.0.html */",

    // Javascript validation.
    jshint: {
      all: ['Gruntfile.js', 'src/javascripts/*.js']
    },

    // Minify Stylesheet Assets.
    cssmin: {
      minify: {
        src: 'src/stylesheets/<%= pkg.name %>.css',
        dest: 'dist/<%= pkg.name %>.min.css',
      },
      options: {
        sourceMap: true // Help with debugging errors.
      }
    },

    // Minify Javascript Assets.
    uglify: {
      build: {
        src: 'src/javascripts/<%= pkg.name %>.js', // Take temporary pre-compiled asset.
        dest: 'dist/<%= pkg.name %>.min.js' // Plop it in the distribution folder.
      },
      options: {
        banner: '<%= banner %>',
        sourceMap: true // Help with debugging errors.
      }
    },

    // Local demo / development site.
    connect: {
      server: {
        options: {
          port: 9001,
          keepalive: true
        }
      }
    },
  });

  // Load the plugin that validates the JS markup.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  // Connect to the test / demo page.
  grunt.loadNpmTasks('grunt-contrib-connect');
  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  // Load the plugin for minifys CSS.
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'uglify', 'cssmin']);
  
};