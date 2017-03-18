const path = require('path');
const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');

const node_modules = path.resolve(__dirname, 'node_modules');
const baseConfig = require('./webpack.config');

const config = {
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: 'dist/',
        filename: '[name].[hash].bundle.js'
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin('commons', '[name].[hash].bundle.js'),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            comments: false,
            pathinfo: false,
            output: {
                comments: false,
            },
            sourceMap: true,
        }),
        new AssetsPlugin({
            filename: 'dist/assets.js',
            processOutput: assets => 'window.env="production";window.WEBPACK_ASSETS=' + JSON.stringify(assets)
        }),
        new webpack.DefinePlugin({
            __DEBUG__: false,
            'process.env': {
                'NODE_ENV': JSON.stringify('production'),
            }
        })
    ]
}

module.exports = Object.assign(baseConfig, config);