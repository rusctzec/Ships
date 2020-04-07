const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

module.exports = function(env) {
    let appTarget = (env && env.APP_TARGET) || 'CLIENT';
    return {
        entry: './src/client/clientEntryPoint.js',
        output: {
            path: path.join(__dirname, 'dist'),
            filename: 'bundle.js'
        },
        devtool: 'source-map',
        module: {
            rules: [
                { test: /\.css$/, loader: 'style!css' },
                {
                    test: /\.scss$/,
                    loaders: ['style-loader', 'raw-loader', 'sass-loader']
                },
                {
                    test: /\.js$/,
                    include: [
                        path.resolve(__dirname, 'src'),
                        path.resolve(__dirname, 'node_modules/lance-gg/'),
                        fs.realpathSync('./node_modules/lance-gg/')
                    ],
                    loader: 'babel-loader',
                    query: {
                        presets: ['@babel/preset-env'].map(require.resolve)
                    }
                }
            ]
        },
        plugins: [
            new webpack.NormalModuleReplacementPlugin(/(.*)-APP_TARGET(\.*)/, function(resource) {
                resource.request = resource.request.replace(/-APP_TARGET/, `-${appTarget}`);
            })
        ]
    };
};
