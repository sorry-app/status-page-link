/*jshint multistr: true */
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Default package configuration.
    pkg: grunt.file.readJSON('package.json'),
    aws: grunt.file.exists('aws.json') ? grunt.file.readJSON('aws.json') : {}, // Optional file required for deployment.

    // Define a banner to added to the compiled assets.
    banner: "/* <%= pkg.name %> v<%= pkg.version %> | " +
            "(c) <%= grunt.template.today('yyyy') %> <%= pkg.author %>. | " +
            "http://www.apache.org/licenses/LICENSE-2.0.html */",

    // Javascript validation.
    jshint: {
      all: ['Gruntfile.js', 'src/javascripts/*.js']
    },

    // Release & Deployment Tasks.
    release: {
      options: {
        npm: false, // Don't deploy to NPM as we don't want to release like that.
        tagName: 'status-page-link-<%= version %>', // TODO: We can't use a variable for the package name.
        afterBump: ['default'] // Rebuild the libs after version number bumped.
      }
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

    // Bundle dependancies into a single package.
    browserify: {
      build: {
        src: 'src/javascripts/<%= pkg.name %>.js', // Take temporary pre-compiled asset.
        dest: 'dist/<%= pkg.name %>.js', // Plop it in the distribution folder.
        options: {
          alias: {
            'sorry-api': './src/javascripts/lib/sorry-api' // Not available as its own NPM yet.
          }
        }
      }
    },

    // Minify Javascript Assets.
    uglify: {
      build: {
        src: 'dist/<%= pkg.name %>.js', // Take temporary pre-compiled asset.
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

    // Deployment.
    aws_s3: {
      options: {
        accessKeyId: '<%= aws.key %>', // Use the variables
        secretAccessKey: '<%= aws.secret %>', // You can also use env variables
        region: 'eu-west-1',
        bucket: 'sorry-assets-production',
        access: 'public-read'
      },
      dev: {
        files: [
          // Upload this version of the plugin.
          {expand: true, cwd: 'dist/', src: ['**'], dest: '<%= pkg.name %>/<%= pkg.version %>/', params: { CacheControl: 'public, max-age=31536000' }},
          // Also deploy a bleeding edge version on the major number.
          {expand: true, cwd: 'dist/', src: ['**'], dest: '<%= pkg.name %>/<%= pkg.version.split(".")[0] %>.latest/', params: { CacheControl: 'public, max-age=3600' }},
          // And also a bleeding edge minor release.
          {expand: true, cwd: 'dist/', src: ['**'], dest: '<%= pkg.name %>/<%= pkg.version.split(".")[0] %>.<%= pkg.version.split(".")[1] %>.latest/', params: { CacheControl: 'public, max-age=3600' }}
        ]
      }
    }    
  });

  // Load the plugin that validates the JS markup.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  // Connect to the test / demo page.
  grunt.loadNpmTasks('grunt-contrib-connect');
  // Bundle dependany modules together for distribution.
  grunt.loadNpmTasks('grunt-browserify');
  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  // Load the plugin for minifys CSS.
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  // Release tasks to manage version number bump, tag etc.
  grunt.loadNpmTasks('grunt-release');
  // AWS/S3 deployment tools.
  grunt.loadNpmTasks('grunt-aws-s3');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'browserify', 'uglify', 'cssmin']);
  
};
