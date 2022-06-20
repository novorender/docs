// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const { webpackPlugin } = require('./src/plugins');

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const baseGithub = 'https://github.com/novorender';
const baseAPI = 'https://data.novorender.com';

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'Novorender',
    tagline: 'Novorender API Docs',
    url: 'https://novorender.com/',
    baseUrl: '/',
    onBrokenLinks: 'warn',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    organizationName: 'novorender', // Usually your GitHub org/user name.
    projectName: 'novorender-api-docs', // Usually your repo name.
    themes: ['@docusaurus/theme-live-codeblock'],
    presets: [
        [
            'classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                    editUrl: `${baseGithub}/docs/edit/main`,
                    showLastUpdateTime: true,
                },
                blog: {
                    showReadingTime: true,
                    editUrl: `${baseGithub}/docs`,
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            }),
        ]
    ],

    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            docs: {
                sidebar: {
                    hideable: true,
                },
            },
            navbar: {
                title: '',
                logo: {
                    alt: 'novorender logo',
                    src: 'img/novorender_logo_RGB_2021.png',
                    srcDark: 'img/novorender_logo_RGB_2021_white.png'
                },
                items: [
                    {
                        to: 'docs/intro',
                        position: 'left',
                        label: 'Docs',
                    },
                    {
                        to: 'docs/webgl-api',
                        position: 'left',
                        label: 'WebGL API',
                    },
                    {
                        to: 'docs/data-js-api',
                        position: 'left',
                        label: 'Data JS API',
                    },
                    {
                        to: '/data-rest-api/',
                        position: 'left',
                        label: 'Data Rest API',
                    },
                    {
                        to: '/playground/',
                        position: 'left',
                        label: 'Playground',
                    },
                    // { to: '/blog', label: 'Blog', position: 'left' },
                    {
                        href: baseGithub,
                        label: 'GitHub',
                        position: 'right',
                    },
                ],
            },
            footer: {
                style: 'dark',
                links: [
                    {
                        title: 'Docs',
                        items: [
                            {
                                label: 'WebGL API',
                                to: '/docs/webgl-api',
                            },
                            {
                                label: 'Data JS API',
                                to: '/docs/data-js-api',
                            },
                            {
                                label: 'Data Rest API',
                                to: '/data-rest-api/',
                            },
                        ],
                    },
                    {
                        title: 'Community',
                        items: [
                            {
                                label: 'Stack Overflow',
                                href: 'https://stackoverflow.com/questions/tagged/novorender',
                            },
                            //         {
                            //             label: 'Discord',
                            //             href: 'https://discordapp.com/invite/docusaurus',
                            //         },
                            {
                                label: 'Twitter',
                                href: 'https://twitter.com/novorender',
                            },
                        ],
                    },
                    {
                        title: 'More',
                        items: [
                            // {
                            //     label: 'Blog',
                            //     to: '/blog',
                            // },
                            {
                                label: 'GitHub',
                                href: baseGithub,
                            },
                            {
                                label: 'Resources',
                                href: 'https://novorender.com/resources/'
                            }
                        ],
                    },
                    {
                        title: 'Legal',
                        items: [
                            {
                                label: 'Privacy Policy',
                                href: 'https://novorender.com/privacy-policy/',
                            },
                            {
                                label: 'Cookie Policy',
                                href: 'https://novorender.com/cookie-policy/',
                            },
                        ],
                    }
                ],
                copyright: `Copyright © ${new Date().getFullYear()} Novorender.`,
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
            },
            colorMode: {
                defaultMode: 'dark',
                disableSwitch: false,
                respectPrefersColorScheme: false,
            },
            announcementBar: {
                id: 'wip_info',
                content: 'ℹ️ The Novorender documentation site is in active development, so expect frequent updates and new content!',
                backgroundColor: '#303846',
                textColor: '#fff',
            },
        }),
    plugins: [
        webpackPlugin,
        [
            'docusaurus-plugin-typedoc',

            // Plugin / TypeDoc options
            {
                id: 'webgl-api',
                entryPoints: ['type-definitions/webgl-api.ts'],
                out: 'webgl-api',
                tsconfig: 'type-definitions/tsconfig.json',
                readme: require.resolve("./temp-readme.md"),
                disableSources: true,
                sidebar: {
                    categoryLabel: 'WebGL API',
                    position: 1
                }
            },
        ],
        /** @todo: uncomment when issues are fixed within data-js-api package */
        // [
        //     'docusaurus-plugin-typedoc',
        //     {
        //         id: 'data-js-api',
        //         entryPoints: ['type-definitions/data-js-api.ts'],
        //         out: 'data-js-api',
        //         tsconfig: 'type-definitions/tsconfig.json',
        //         readme: require.resolve("@novorender/data-js-api/README.md"),
        //         disableSources: true,
        //         sidebar: {
        //             categoryLabel: 'Data JS API'
        //             position: 2
        //         }
        //     },
        // ],
        require.resolve("@cmfcmf/docusaurus-search-local")
    ],
    customFields: {
        swaggerUI: `${baseAPI}/swagger`,
        swaggerJSON: `${baseAPI}/swagger/v1/swagger.json`
    }
};

module.exports = config;
