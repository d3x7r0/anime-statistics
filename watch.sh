#!/bin/sh
echo "## Removing old files";
rm -vrf web/js/*;

echo "## Babel Helpers";
./node_modules/.bin/babel-external-helpers > web/js/helpers.js;

echo "## Babel";
./node_modules/.bin/babel web/es6/ --out-dir web/js/ -s -w;

echo "## Done";