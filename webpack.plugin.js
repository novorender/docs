/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line no-undef
const { ProvidePlugin, DefinePlugin } = require("webpack");
// eslint-disable-next-line no-undef
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
                        // eslint-disable-next-line no-undef
                        WEB_API_VERSION: JSON.stringify(require("./@novorender/package.json").version),
                        // eslint-disable-next-line no-undef
                        WEB_API_TYPESCRIPT_VERSION: JSON.stringify(require("./@novorender/package.json").devDependencies["typescript"])
                    }),
                    new ProvidePlugin({
                        // eslint-disable-next-line no-undef
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
                // resolve: {
                //     fallback: {
                //         // eslint-disable-next-line no-undef
                //         stream: require.resolve("stream-browserify"),
                //         // eslint-disable-next-line no-undef
                //         path: require.resolve("path-browserify"),
                //         // eslint-disable-next-line no-undef
                //         buffer: require.resolve("buffer/"),
                //         // eslint-disable-next-line no-undef
                //         util: require.resolve("util/"),
                //         // eslint-disable-next-line no-undef
                //         url: require.resolve("url/"),
                //     },
                //     alias: {
                //         process: "process/browser.js",
                //     },
                // },
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

// eslint-disable-next-line no-undef
module.exports = { webpackPlugin };
