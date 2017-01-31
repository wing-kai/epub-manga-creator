const path = require('path');
const webpack = require('webpack');

const node_modules = path.resolve(__dirname, 'node_modules');

const config = {
    entry: {
        commons: [
            'redux',
            'react',
            'react-dom',
            'react-redux',
            'redux-thunk',
            'jszip'
        ],
        index: [
            './src/index.js'
        ]
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            loader: 'babel',
            query: {
                presets: ['es2015', 'react'],
                plugins: ["transform-object-rest-spread"]
            }
        }]
    }
}

module.exports = config;