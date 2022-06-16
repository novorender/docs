const { ProvidePlugin, DefinePlugin } = require('webpack');

const webpackPlugin = (context, options) => {
    return {
        name: 'webpack-plugin',
        configureWebpack(config) {
            return {
                plugins: [
                    new DefinePlugin({
                        "process.env.DEBUG": "runtime_process_env.DEBUG"
                      }),
                    new ProvidePlugin({
                        process: require.resolve('process/browser'),
                    })
                ],
                resolve: {
                    fallback: {
                        stream: require.resolve('stream-browserify'),
                        path: require.resolve('path-browserify'),
                        buffer: require.resolve('buffer/'),
                        util: require.resolve('util/'),
                        url: require.resolve('url/'),
                    },
                    alias: {
                        process: 'process/browser.js',
                    },
                },
            };
        },
    };
};

module.exports = { webpackPlugin };

