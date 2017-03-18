const path = require('path');
const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');

const node_modules = path.resolve(__dirname, 'node_modules');
const baseConfig = require('./webpack.config');

const config = {
    devtool: 'source-map',
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/dist/',
        filename: '[name].[hash].bundle.js'
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin('commons', '[name].[hash].bundle.js'),
        new webpack.optimize.OccurenceOrderPlugin(),
        new AssetsPlugin({
            filename: 'dist/assets.js',
            processOutput: assets => 'window.env="development";window.WEBPACK_ASSETS=' + JSON.stringify(assets)
        }),
        new webpack.DefinePlugin({
            __DEBUG__: true,
            'process.env': {
                'NODE_ENV': "\"development\"",
            }
        })
    ]
}

module.exports = Object.assign(baseConfig, config);