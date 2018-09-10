const path = require('path');
const fs = require('fs');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: 'development',
    target: 'node',
    entry: './server.js',
    output: {
        filename: 'server-bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: JSON.parse(fs.readFileSync(path.resolve(__dirname, '.babelrc')))
                }
            }
        ]
    },
    externals: [
        nodeExternals({
            modulesFromFile: true
        })
    ]
};