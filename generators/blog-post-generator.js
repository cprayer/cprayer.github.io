import fs from 'node:fs';
import {inputRequired} from './utils.js';

const authors = JSON.parse(fs.readFileSync('./data/author.json'));

const plop = plop => {
  plop.setGenerator('blog post', {
    prompts: [
      {
        type: 'input',
        name: 'title',
        message: 'Blog post title?',
        validate: inputRequired('title'),
      },
      {
        type: 'list',
        name: 'author',
        message: 'The author of blog post?',
        choices: authors.map(author => ({name: author.id, value: author.id})),
      },
      {
        type: 'input',
        name: 'tags',
        message: 'tags? (separate with coma)',
      },
      {
        type: 'confirm',
        name: 'draft',
        message: 'It\'s a draft?',
      },
    ],
    actions(data) {
      // Get current date
      data.createdDate = new Date().toISOString().split('T')[0];

      // Parse tags as yaml array
      data.tags &&= `\ntags:\n  - ${data.tags.split(',').join('\n  - ')}`;

      return [
        {
          type: 'add',
          path: '../data/{{createdDate}}--{{dashCase title}}/index.md',
          templateFile: 'templates/blog-post-md.template',
        },
      ];
    },
  });
};

export default plop;
