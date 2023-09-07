// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const { webpackPlugin } = require("./src/plugins");

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

const baseGithub = "https://github.com/novorender";
const baseAPI = "https://data.novorender.com";

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
    presets: [
        [
            "classic",
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    sidebarPath: require.resolve("./sidebars.js"),
                    editUrl: `${baseGithub}/docs/edit/main`,
                    showLastUpdateTime: true,
                    docItemComponent: "@theme/ApiItem",
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
            metadata: [{ name: "keywords", content: "novorender, novorender docs, novorender documentation, novorender/webgl-api, novorender/data-js-api, novorender/measure-api, novorender rest api docs, api docs" }],
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
                items: [
                    {
                        to: "docs/category/documentation",
                        position: "left",
                        label: "Docs",
                    },
                    {
                        to: "docs/webgl-api",
                        position: "left",
                        label: "WebGL API",
                    },
                    {
                        to: "docs/data-js-api",
                        position: "left",
                        label: "Data JS API",
                    },
                    {
                        to: "docs/measure-api",
                        position: "left",
                        label: "Measure API",
                    },
                    {
                        to: "docs/category/data-rest-api-v1",
                        position: "left",
                        label: "Data Rest API",
                    },
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
                            { type: "html", value: `<a class="dropdown__link" href="#" onClick="window.location.href = window.location.origin + '/v2'">V2 🚧</a>` },
                        ],
                    },
                    {
                        href: baseGithub,
                        className: "header-github-link",
                        position: "right",
                        "aria-label": "GitHub repository",
                    },
                ],
            },
            footer: {
                style: "dark",
                links: [
                    {
                        title: "Docs",
                        items: [
                            {
                                label: "WebGL API",
                                to: "/docs/webgl-api",
                            },
                            {
                                label: "Data JS API",
                                to: "/docs/data-js-api",
                            },
                            {
                                label: "Measure API",
                                to: "/docs/measure-api/",
                            },
                            {
                                label: "Data Rest API",
                                to: "docs/category/data-rest-api-v1",
                            },
                        ],
                    },
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
            announcementBar: {
                id: "new_api_announcement_banner",
                content: `🎉 Exciting news! The all-new Web API is officially up and running. Dive into the <a target="_blank" rel="noopener noreferrer" href="/blog/webgl-web-api-v2">announcement post</a> to learn more about its incredible features. 🥳`,
                backgroundColor: "#303846",
                textColor: "#fff",
            },
        }),
    plugins: [
        webpackPlugin,
        [
            "docusaurus-plugin-typedoc",

            // Plugin / TypeDoc options
            {
                id: "webgl-api",
                entryPoints: ["type-definitions/webgl-api.ts"],
                logLevel: "Error",
                out: "webgl-api",
                tsconfig: "type-definitions/tsconfig.json",
                readme: require.resolve("@novorender/webgl-api/README.md"),
                disableSources: true,
                frontmatter: {
                    description: "A Web API for scalable 3D rendering in the cloud.",
                    title: "WebGL API",
                },
            },
        ],
        [
            "docusaurus-plugin-typedoc",
            {
                id: "data-js-api",
                entryPoints: ["type-definitions/data-js-api.ts"],
                logLevel: "Error",
                out: "data-js-api",
                tsconfig: "type-definitions/tsconfig.json",
                readme: require.resolve("@novorender/data-js-api/README.md"),
                disableSources: true,
                frontmatter: {
                    description: "A Data JS API for managing scalable Novorender 3D rendering in the cloud.",
                    title: "Data JS API",
                },
            },
        ],
        [
            "docusaurus-plugin-typedoc",
            {
                id: "measure-api",
                entryPoints: ["type-definitions/measure-api.ts"],
                logLevel: "Error",
                out: "measure-api",
                tsconfig: "type-definitions/tsconfig.json",
                readme: require.resolve("@novorender/measure-api/README.md"),
                disableSources: true,
                frontmatter: {
                    description: "for detailed measuring show distances, differences, elevations and more.",
                    title: "Measure API",
                },
            },
        ],
        [
            "docusaurus-plugin-openapi-docs",
            {
                id: "apiDocs",
                docsPluginId: "classic",
                config: {
                    rest_api_versioned: {
                        specPath: "https://data-v2.novorender.com/swagger/v1/swagger.json",
                        outputDir: "docs/rest-api",
                        sidebarOptions: {
                            groupPathsBy: "tag",
                            categoryLinkSource: "tag",
                        },
                        version: "1.0",
                        label: "V1",
                        baseUrl: "/docs/category/data-rest-api-v1",
                        versions: {
                            "2.0": {
                                specPath: "https://data-v2.novorender.com/swagger/v2/swagger.json",
                                outputDir: "docs/rest-api/2.0",
                                label: "V2",
                                baseUrl: "/docs/category/data-rest-api-v2",
                            },
                        },
                    },
                },
            },
        ],
        require.resolve("@cmfcmf/docusaurus-search-local"),
    ],
    themes: ["@docusaurus/theme-live-codeblock", "docusaurus-theme-openapi-docs"],
    customFields: {
        swaggerUI: `https://data-v2.novorender.com/swagger`,
        swaggerJSON_V1: `https://data-v2.novorender.com/swagger/v1/swagger.json`,
        swaggerJSON_V2: `https://data-v2.novorender.com/swagger/v2/swagger.json`,
    },
};

module.exports = config;
