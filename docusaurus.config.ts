import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { webpackPlugin } from "./webpack.plugin";
import { execSync } from "child_process";
import npm2yarn from '@docusaurus/remark-plugin-npm2yarn';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const baseGithub = "https://github.com/novorender";

const config: Config = {
  title: 'Novorender',
  tagline: 'Novorender API Docs',
  favicon: 'img/favicon.ico',
  url: 'https://docs.novorender.com',
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'novorender',
  projectName: 'docs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  markdown: {
    mermaid: true
  },
  themes: ["@docusaurus/theme-live-codeblock", "@docusaurus/theme-mermaid"],
  presets: [
    [
      'classic',
      {
        debug: true,
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: `${baseGithub}/docs/edit/main`,
          showLastUpdateTime: true,
          remarkPlugins: [
            [npm2yarn, { sync: true, converters: ["yarn", "pnpm"] }],
            remarkMath
          ],
          rehypePlugins: [rehypeKatex],
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: `${baseGithub}/docs/`,
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ]
  ],
  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity:
        'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
  ],
  themeConfig: {
    metadata: [{ name: "keywords", content: "novorender, novorender docs, novorender documentation, novorender/api, novorender web api, webgl, webgl 2, novorender rest api docs, api docs" }],
    // image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: '',
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
        { to: '/blog', label: 'Blog', position: 'left' },
        // {
        //   type: "dropdown",
        //   position: "right",
        //   label: "Stable",
        //   items: [
        //     { to: "/", label: "Stable (current)" },
        //     { type: "html", value: `<a class="dropdown__link" href="#" onClick="window.location.href = window.location.origin + '/legacy'">Legacy</a>` },
        //   ],
        // },
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
            {
              label: 'Blog',
              to: '/blog',
            },
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
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    colorMode: {
      disableSwitch: false,
      defaultMode: "dark",
    }
  } satisfies Preset.ThemeConfig,
  plugins: [
    webpackPlugin,
    [
      "docusaurus-plugin-typedoc",
      /** @type {import('docusaurus-plugin-typedoc').PluginOptions} */
      {
        id: "web_api",
        frontmatterGlobals: {
          description: "A Web API for scalable 3D rendering in the cloud.",
          custom_edit_url: "",
        },
        /** TypeDoc Options */
        entryPoints: ["@novorender/web_app/index.ts"],
        out: "docs/web_api/api_reference",
        logLevel: "Error",
        tsconfig: "@novorender/tsconfig.json",
        readme: "none",
        disableSources: false,
        excludeInternal: true,
        excludePrivate: true,
        hideBreadcrumbs: false,
        groupOrder: ["Classes", "Interfaces", "Enums"],
        hideGenerator: true,
        indexFormat: "table",
        sidebar: { pretty: true },
        parametersFormat: "table",
        enumMembersFormat: "table",
        useCodeBlocks: true,
        navigation: {
          includeCategories: true,
          includeGroups: true,
        },
        gitRevision: (() => {
          return execSync("cd @novorender && git rev-parse HEAD").toString().trim();
        })(),
        plugin: ["typedoc-plugin-frontmatter"]
      },
    ],
    [require.resolve("@cmfcmf/docusaurus-search-local"), {}],
    ["drawio", {}]
  ]
};

export default config;
