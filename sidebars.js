/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
    // By default, Docusaurus generates a sidebar from the docs folder structure
    mainSidebar: [
        {
            type: 'category',
            label: 'Documentation',
            link: {
                type: 'generated-index',
                title: 'Docs',
                description: 'Learn more about the Novorender\'s open source APIs',
            },
            collapsed: false,
            items: [
                {
                    type: 'category',
                    label: 'WebGL API',
                    link: {
                        type: 'doc',
                        id: 'webgl-api/index',
                    },
                    items: [{ type: 'autogenerated', dirName: 'webgl-api' }]
                },
                {
                    type: 'category',
                    label: 'Tutorials',
                    link: {
                        type: 'generated-index',
                        title: 'Tutorials',
                        description: 'Learn more about the different features and techniques.',
                    },
                    items: [{ type: 'autogenerated', dirName: 'tutorials' }]
                },
                {
                    type: 'category',
                    label: 'Data JS API',
                    link: {
                        type: 'doc',
                        id: 'data-js-api/index',
                    },
                    items: [{ type: 'autogenerated', dirName: 'data-js-api' }]
                },
                {
                    type: 'category',
                    label: 'Measure API',
                    link: {
                        type: 'doc',
                        id: 'measure-api/index',
                    },
                    items: [{ type: 'autogenerated', dirName: 'measure-api' }]
                },
                { type: 'link', label: 'Data Rest API', href: '/data-rest-api' },
            ],
        }
    ],
};

module.exports = sidebars;
