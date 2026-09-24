/* eslint-disable quotes */
import path from 'path';
import {cwd} from 'process';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  siteMetadata: {
    title: `cprayer`,
    siteUrl: `https://cprayer.github.io`,
    defaultOgImage: `/og-default-v4.png`,
    googleVerification: null,
  },
  mapping: {
    'MarkdownRemark.frontmatter.author': `AuthorJson.jsonId`,
  },
  plugins: [
    // Expose `/data` to graphQL layer
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: path.join(cwd(), `data`),
      },
    },

    {
      resolve: `gatsby-plugin-gtag`,
      options: {
        trackingId: 'G-378CRE70WW',
        // Puts tracking script in the head instead of the body
        head: true,
        // Setting this parameter is optional
        anonymize: true,
      },
    },

    // Parse all markdown files (each plugin add/parse some data into graphQL layer)
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 690,
              backgroundColor: `#f7f0eb`,
              linkImagesToOriginal: false,
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-autolink-headers`,
        ],
      },
    },

    // Parse all images files
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,

    // Parse JSON files
    `gatsby-transformer-json`,

    // Add typescript stack into webpack
    `gatsby-plugin-typescript`,

    // This plugin takes your configuration and generates a
    // web manifest file so your website can be added to your
    // homescreen on Android.
    /* eslint-disable camelcase */
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `cprayer`,
        short_name: `cprayer`,
        start_url: `/`,
        background_color: `#f7f7f7`,
        theme_color: `#191919`,
        display: `minimal-ui`,
        icon: `data/icons/favicon.png`,
      },
    },
    /* eslint-enable camelcase */

    // Remove service workers installed by earlier offline builds.
    `gatsby-plugin-remove-serviceworker`,
  ],
};
