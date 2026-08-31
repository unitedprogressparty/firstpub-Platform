// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const partyHome = 'https://unitedprogressparty.com/';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'United Progress Party',
  tagline: 'A public home for participation, policy, and practical progress.',
  favicon: 'img/favicon.ico',

  url: 'https://unitedprogressparty.github.io',
  baseUrl: '/firstpub-Platform/',

  organizationName: 'unitedprogressparty',
  projectName: 'firstpub-Platform',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/unitedprogressparty/firstpub-Platform/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'United Progress Party',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Platform',
          },
          {
            to: '/docs/Big Changes',
            label: 'Big Changes',
            position: 'left',
          },
          {
            to: '/docs/Foreign Policy/Philosophy, Vision',
            label: 'Vision',
            position: 'left',
          },
          {
            to: '/docs/Preface End facism/Priority is to win back congress/How to win',
            label: 'How to win',
            position: 'left',
          },
          {
            href: partyHome,
            label: 'Party home',
            position: 'right',
          },
          {
            href: 'https://github.com/unitedprogressparty/firstpub-Platform',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Start here',
            items: [
              {
                label: 'Big Changes',
                to: '/docs/Big Changes',
              },
              {
                label: 'Vision',
                to: '/docs/Foreign Policy/Philosophy, Vision',
              },
              {
                label: 'How to win',
                to: '/docs/Preface End facism/Priority is to win back congress/How to win',
              },
              {
                label: 'Full outline',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'The party',
            items: [
              {
                label: 'unitedprogressparty.com',
                href: partyHome,
              },
              {
                label: 'GitHub',
                href: 'https://github.com/unitedprogressparty/firstpub-Platform',
              },
            ],
          },
        ],
        copyright: `United Progress Party`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
