/* eslint-env node */

const pkg = require('./package.json')

const {resolve} = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {BannerPlugin, DefinePlugin} = require('webpack');

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
                test: /\.(png|jpg|gif)$/,
                loader: 'file-loader'
            },
            {
                test: /\.(svg)$/,
                loader: 'raw-loader'
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader'
                    }
                ]
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    devtool: "source-map",
    devServer: {
        contentBase: resolve(__dirname, "target"),
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    plugins: [
        new DefinePlugin({
            'process.env': {
                'BROWSER': JSON.stringify(true),
                'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }
        }),
        new BannerPlugin({
            entryOnly: true,
            banner: buildBanner()
        }),
        new MiniCssExtractPlugin({
            filename: "css/[name]-[hash].css",
        }),
        ... entries.map(entry => new HtmlWebpackPlugin({
            filename: `${entry}.html`,
            template: resolve(__dirname, BASE_DIR, `${entry}.html`),
            chunks: [entry],
            hash: true
        }))
    ]
};
