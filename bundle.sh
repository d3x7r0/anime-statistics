#!/bin/sh
cleancss css/pure.css css/grids-responsive.css css/main.css > css/bundle.min.css
uglifyjs js/lib/* js/polyfill.js js/common.js js/main.js js/year.js > js/bundle.min.js