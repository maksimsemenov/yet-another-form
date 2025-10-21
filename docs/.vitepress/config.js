import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/yet-another-form/',
  title: 'Yet Another Form',
  description: 'Minimal and performant form state management library for React',

  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/use-form' },
      { text: 'Examples', link: '/examples/basic' },
      {
        text: 'GitHub',
        link: 'https://github.com/maksimsemenov/yet-another-form',
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is Yet Another Form?', link: '/guide/introduction' },
            { text: 'Getting Started', link: '/guide/getting-started' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Form Management', link: '/guide/form-management' },
            { text: 'Validation', link: '/guide/validation' },
            { text: 'Submission', link: '/guide/submission' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'useForm', link: '/api/use-form' },
            { text: 'useFormField', link: '/api/use-form-field' },
            { text: 'useFormState', link: '/api/use-form-state' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Basic Form', link: '/examples/basic' },
            { text: 'Validation', link: '/examples/validation' },
            { text: 'Async Validation', link: '/examples/async-validation' },
            {
              text: 'Field-Level Validation',
              link: '/examples/field-validation',
            },
          ],
        },
      ],
    },

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/maksimsemenov/yet-another-form',
      },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Maksim Semenov',
    },
  },
})
