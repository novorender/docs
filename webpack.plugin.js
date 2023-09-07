const path = require("path");
const { ProvidePlugin, DefinePlugin } = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

const webpackPlugin = (context, options) => {
    return {
        name: "webpack-plugin",
        configureWebpack(config) {
            config.module.rules.forEach((rule) => {
                rule.resourceQuery = { not: [/raw/] };
            });
            config.module.rules.push({
                resourceQuery: /raw/,
                type: "asset/source",
            });

            return {
                plugins: [
                    new DefinePlugin({
                        "process.env.DEBUG": "runtime_process_env.DEBUG",
                    }),
                    new ProvidePlugin({
                        process: require.resolve("process/browser"),
                    }),
                    new CopyPlugin({
                        patterns: [
                            {
                                from: "node_modules/@novorender/api/public/*",
                                to: "[name][ext]",
                            },
                        ],
                    }),
                ],
                resolve: {
                    fallback: {
                        stream: require.resolve("stream-browserify"),
                        path: require.resolve("path-browserify"),
                        buffer: require.resolve("buffer/"),
                        util: require.resolve("util/"),
                        url: require.resolve("url/"),
                    },
                    alias: {
                        process: "process/browser.js",
                    },
                },
                module: {},
                devServer: {
                    headers: {
                        "Cross-Origin-Opener-Policy": "same-origin",
                        "Cross-Origin-Embedder-Policy": "require-corp",
                    },
                    client: {
                        overlay: {
                            runtimeErrors: false,
                        },
                    },
                },
            };
        },
    };
};

module.exports = { webpackPlugin };
