/* eslint-env node */
const {resolve} = require("path");
const pkg = require("./package.json");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const BASE_DIR = "app/client";

const entries = [
    "index",
    "types",
    "year",
];

function buildBanner() {
    return `${ pkg.title || pkg.name } - v${ pkg.version } - ${ getDate() }\n` +
        (pkg.homepage ? `${pkg.homepage}\\n` : "") +
        `Copyright (c) ${ getYear() } ${ pkg.author.name || pkg.author }\n` +
        `Licensed ${ pkg.license }\n`;
}

function getDate(date = new Date()) {
    return `${date.getFullYear()}-${leftPad(date.getMonth(), 0, 2)}-${leftPad(date.getDate(), 0, 2)}`;
}

function getYear(date = new Date()) {
    return `${date.getFullYear()}`;
}

function leftPad(text, value, count = 0) {
    let res = "" + text;

    for (let i = res.length; i < count; i++) {
        res = value + res;
    }

    return res;
}

module.exports = {
    entry: entries.reduce((memo, entry) => {
        memo[entry] = resolve(__dirname, BASE_DIR, `js/${entry}.js`);
        return memo;
    }, {}),
    output: {
        path: resolve(__dirname, 'target'),
        filename: 'js/[name].js',
        library: {
            root: `[name]`,
            amd: "[name]",
            commonjs: "[name]"
        },
        libraryTarget: 'umd',
        devtoolModuleFilenameTemplate: `package://${pkg.name}/[resource]`
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            }
        ]
    },
    resolve: {
        extensions: ['.js']
    },
    devtool: "source-map",
    devServer: {
        contentBase: resolve(__dirname, "target"),
    },
    plugins: [
        new webpack.BannerPlugin({
            entryOnly: true,
            banner: buildBanner()
        }),
        new ExtractTextPlugin({
            ignoreOrder: true,
            filename: "css/styles.css"
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: "commons",
            filename: "js/commons.js",
        }),
        ... entries.map(entry => new HtmlWebpackPlugin({
            filename: `${entry}.html`,
            template: resolve(__dirname, BASE_DIR, `${entry}.html`),
            chunks: ["css/styles.css", "commons", entry],
            hash: true
        }))
    ]
};
