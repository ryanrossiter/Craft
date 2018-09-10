const path = require('path');
const fs = require('fs');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
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
    }
};