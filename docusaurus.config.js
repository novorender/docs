// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const baseGithub = 'https://github.com/novorender';

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
        ],
        [
            'redocusaurus',
            {
              // Plugin Options for loading OpenAPI files
              specs: [
                {
                  spec: 'https://data.novorender.com/swagger/v1/swagger.json',
                  route: '/rest-api/',
                },
              ],
              // Theme Options for modifying how redoc renders them
              theme: {
                // Change with your site colors
                primaryColor: '#d61e5c',
              },
            },
          ],
    ],

    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
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
                        to: '/rest-api/',
                        position: 'left',
                        label: 'Rest API',
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
                                label: 'Rest API',
                                to: '/rest-api/',
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
                        ],
                    },
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
              }
        }),
    plugins: [
        [
            'docusaurus-plugin-typedoc',

            // Plugin / TypeDoc options
            {
                entryPoints: ['webgl-api.ts'],
                out: 'webgl-api',
                readme: require.resolve("./temp-readme.md"),
                disableSources: true,
                sidebar: {
                    categoryLabel: 'WebGL API'
                }
            },
        ],
        require.resolve("@cmfcmf/docusaurus-search-local")
    ],
    scripts: [
        {
            src: 'https://novorenderapi.blob.core.windows.net/scripts/v0.3.81/index_umd.js',
            async: true
        }
    ]
};

module.exports = config;
