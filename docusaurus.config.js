// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const { execSync } = require("child_process");
const { webpackPlugin } = require("./webpack.plugin");

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

const baseGithub = "https://github.com/novorender";
// const baseAPI = "https://data.novorender.com";

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: "Novorender",
    tagline: "Novorender API Docs",
    url: "https://novorender.com/",
    baseUrl: "/",
    onBrokenLinks: "warn",
    onBrokenMarkdownLinks: "warn",
    favicon: "img/favicon.ico",
    organizationName: "novorender",
    projectName: "novorender-api-docs",
    markdown: { mermaid: true },
    themes: ["@docusaurus/theme-live-codeblock", "@docusaurus/theme-mermaid"],
    presets: [
        [
            "classic",
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    sidebarPath: require.resolve("./sidebars.js"),
                    editUrl: `${baseGithub}/docs/edit/main`,
                    showLastUpdateTime: true,
                    remarkPlugins: [
                        [require("@docusaurus/remark-plugin-npm2yarn"), { sync: true, converters: ["yarn", "pnpm"] }],
                    ],
                },
                blog: {
                    showReadingTime: true,
                    editUrl: `${baseGithub}/docs`,
                },
                theme: {
                    customCss: require.resolve("./src/css/custom.css"),
                },
            }),
        ],
    ],

    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            metadata: [{ name: "keywords", content: "novorender, novorender docs, novorender documentation, novorender/api, novorender web api, webgl, webgl 2, novorender rest api docs, api docs" }],
            docs: {
                sidebar: {
                    hideable: true,
                },
            },
            navbar: {
                title: "",
                logo: {
                    alt: "novorender logo",
                    src: "img/novorender_logo_RGB_2021.png",
                    srcDark: "img/novorender_logo_RGB_2021_white.png",
                },
                hideOnScroll: true,
                items: [
                    {
                        to: "docs/web_api/",
                        position: "left",
                        label: "Docs",
                        activeBasePath: "/docs"
                    },
                    // {
                    //   to: "/data-rest-api/",
                    //   position: "left",
                    //   label: "Data Rest API",
                    // },
                    {
                        to: "/playground/",
                        position: "left",
                        label: "Playground",
                    },
                    // { to: '/blog', label: 'Blog', position: 'left' },
                    {
                        type: "dropdown",
                        position: "right",
                        label: "Stable",
                        items: [
                            { to: "/", label: "Stable (current)" },
                            { type: "html", value: `<a class="dropdown__link" href="#" onClick="window.location.href = window.location.origin + '/legacy'">Legacy</a>` },
                        ],
                    },
                    {
                        href: `${baseGithub}/ts`,
                        className: "header-github-link",
                        position: "right",
                        "aria-label": "GitHub repository",
                    },
                ],
            },
            footer: {
                style: "dark",
                links: [
                    // {
                    //   title: "Docs",
                    //   items: [
                    //     {
                    //       label: "Data Rest API",
                    //       to: "/data-rest-api/",
                    //     },
                    //   ],
                    // },
                    {
                        title: "Community",
                        items: [
                            {
                                label: "Stack Overflow",
                                href: "https://stackoverflow.com/questions/tagged/novorender",
                            },
                            //         {
                            //             label: 'Discord',
                            //             href: 'https://discordapp.com/invite/docusaurus',
                            //         },
                            {
                                label: "Twitter",
                                href: "https://twitter.com/novorender",
                            },
                        ],
                    },
                    {
                        title: "More",
                        items: [
                            // {
                            //     label: 'Blog',
                            //     to: '/blog',
                            // },
                            {
                                label: "GitHub",
                                href: baseGithub,
                            },
                            {
                                label: "Resources",
                                href: "https://novorender.com/resources/",
                            },
                        ],
                    },
                    {
                        title: "Legal",
                        items: [
                            {
                                label: "Privacy Policy",
                                href: "https://novorender.com/privacy-policy/",
                            },
                            {
                                label: "Cookie Policy",
                                href: "https://novorender.com/cookie-policy/",
                            },
                        ],
                    },
                    {
                        title: "Get in touch",
                        items: [
                            {
                                label: "LinkedIn",
                                href: "https://www.linkedin.com/company/novorender/",
                            },
                            {
                                label: "info@novorender.com",
                                href: "mailto:info@novorender.com",
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
                disableSwitch: false,
                defaultMode: "dark",
            },
        }),
    plugins: [
        webpackPlugin,
        [
            "docusaurus-plugin-typedoc",
            /** @type {import('docusaurus-plugin-typedoc').PluginOptions} */
            {
                id: "web_api",
                sidebar: {
                    readmeLabel: "Introduction",
                    readmeTitle: "",
                    indexLabel: "Index",
                    autoConfiguration: true,
                },
                frontmatterGlobals: {
                    description: "A Web API for scalable 3D rendering in the cloud.",
                    custom_edit_url: "",
                },
                /** TypeDoc Options */
                entryPoints: ["@novorender/web_app/index.ts"],
                out: "web_api",
                logLevel: "Error",
                tsconfig: "@novorender/tsconfig.json",
                readme: "./docs/index.mdx",
                disableSources: false,
                excludeInternal: true,
                excludePrivate: true,
                hideBreadcrumbs: false,
                hideGenerator: true,
                navigation: {
                    includeCategories: true,
                    includeGroups: true,
                },
                gitRevision: (() => {
                    return execSync("cd @novorender && git rev-parse HEAD").toString().trim();
                })(),
            },
        ],
        require.resolve("@cmfcmf/docusaurus-search-local"),
        ["drawio", {}]
    ],
    // customFields: {
    //   swaggerUI: `https://data-v2.novorender.com/swagger`,
    //   swaggerJSON_V1: `https://data-v2.novorender.com/swagger/v1/swagger.json`,
    //   swaggerJSON_V2: `https://data-v2.novorender.com/swagger/v2/swagger.json`,
    // },
};

module.exports = config;
