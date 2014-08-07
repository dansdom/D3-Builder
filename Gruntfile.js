module.exports = function(grunt){

    // loads all the tasks
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
          src: [
            'js/buildChart.js', 
            'js/config.js', 
            'js/formData.js', 
            'js/interface.js', 
            'js/plugins.js', 
            'js/showChart.js',
            'js/d3/area.js',
            'js/d3/bar.js',
            'js/d3/chord.js',
            'js/d3/force.js',
            'js/d3/pack.js',
            'js/d3/pie.js',
            'js/d3/scatterplot.js',
            'js/d3/sunburst.js',
            'js/plugins/extend.js'
          ],
          options: {
            curly: true,
            eqeqeq: true,
            immed: true,
            latedef: true,
            newcap: true,
            noarg: true,
            sub: true,
            undef: true,
            devel : true,
            boss: true,
            eqnull: true,
            browser: true,
            globals: {
              jQuery: true,
              $: true,
              d3: true,
              extend: true,
              D3Builder : true
            }
          }
        },
        concat: {
            options: {
                separator: '',
                process: function(src, filepath) {
                    return '/* ' + filepath + ' */\n' + src + '\n';
                }
            },
            basic_and_extras: {
                files: {
                }
            }
        },
        watch: {
            js: {
                files: ['js/*.js'],
                tasks: ['jshint', 'uglify']
            },
            html: {
                files: ['index.html'],
                tasks: ['htmlhint']
            }
        }
    
    });

    // default tasks
    grunt.registerTask('default', ['jshint']);

};

