module.exports = function (grunt) {

    // These plugins provide necessary tasks.
    require("load-grunt-tasks")(grunt);

    grunt.initConfig({
        // Metadata.
        project: {
            pkg: grunt.file.readJSON('package.json'),
            banner: "/*! <%= project.pkg.title || project.pkg.name %> - v<%= project.pkg.version %> - " +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            "<%= project.pkg.homepage ? \"* \" + project.pkg.homepage + \"\\n\" : \"\" %>" +
            "* Copyright (c) <%= grunt.template.today(\"yyyy\") %> <%= project.pkg.author %>;\n" +
            " Licensed <%= project.pkg.license %> */\n",
        },

        clean: {
            dist: [
                ".tmp",
                "target"
            ]
        },

        cssmin: {
            dist: {
                src: [
                    "node_modules/purecss/build/pure.css",
                    "node_modules/purecss/build/grids-responsive.css",
                    "web/css/main.css"
                ],
                dest: "target/css/bundle.min.css"
            }
        },

        exec: {
            folder: "mkdir -p target/js",
            babel: "./node_modules/.bin/babel web/es6/ --out-dir .tmp/js/ -s",
            helpers: "./node_modules/.bin/babel-external-helpers -t umd > .tmp/js/helpers.js"
        },

        concat: {
            dist: {
                options: {
                    sourceMap: true,
                    mangle: {
                        except: ["global"]
                    }
                },
                files: [{
                    src: [
                        "node_modules/whatwg-fetch/fetch.js",
                        "node_modules/chart.js/dist/Chart.bundle.js",
                        "node_modules/bluebird/js/browser/bluebird.js",
                        "node_modules/randomcolor/randomColor.js",
                        ".tmp/js/helpers.js",
                        ".tmp/js/files.js",
                        ".tmp/js/db.js",
                        ".tmp/js/common.js",
                        ".tmp/js/**.js",
                        "!.tmp/js/**.min.js"
                    ],
                    dest: ".tmp/js/bundle.js"
                }]
            }
        },

        uglify: {
            dist: {
                options: {
                    sourceMap: true,
                    sourceMapIn: ".tmp/js/bundle.js.map"
                },
                src: ".tmp/js/bundle.js",
                dest: "target/js/bundle.min.js"
            }
        },

        copy: {
            dist: {
                files: [{
                    cwd: "web",
                    expand: true,
                    src: [
                        "**.html",
                        "data/**.json"
                    ],
                    dest: "target/"
                }]
            }
        }
    });

    // Build tasks
    grunt.registerTask("build", ["styles", "scripts", "copy"]);

    grunt.registerTask("default", ["clean", "build"]);

    // Internal tasks
    grunt.registerTask("styles", function () {
        grunt.task.run(["cssmin"]);
    });

    grunt.registerTask("scripts", function () {
        grunt.task.run(["exec:folder", "exec:babel", "exec:helpers", "concat", "uglify"]);
    });

};