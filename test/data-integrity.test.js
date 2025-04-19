/* eslint-disable no-undef */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import _ from 'lodash-es';
import authorsData from '../data/author.json';

const authors = authorsData;

describe('data integrity', () => {
  describe('authors', () => {
    const requiredFields = ['id', 'bio', 'avatar', 'twitter', 'github'];
    for (const author of authors) {
      describe(`${author.id}`, () => {
        // Check required fields
        for (const field of requiredFields) {
          it(`should have ${field} field`, () => {
            expect(Object.keys(author).includes(field)).toBeTruthy();
          });
        }

        // Check if avatar image is in the repo
        it('should have avatar image in the repo', () => {
          const avatarPath = path.join('data/', author.avatar);
          expect(fs.existsSync(avatarPath)).toBeTruthy();
        });
      });
    }
  });
  describe('blog posts', () => {
    const posts = fs.readdirSync('data/posts');
    const validators = [
      {key: 'title', validator: _.isString},
      {key: 'createdDate', validator: value => _.isDate(new Date(value))},
      {key: 'updatedDate', validator: value => _.isDate(new Date(value))},
      {key: 'author', validator: value => _.map(authors, 'id').includes(value)},
      {key: 'tags', validator: _.isArray},
      {key: 'draft', validator: _.isBoolean},
    ];
    for (const post of posts) {
      describe(`${post}`, () => {
        const {data} = matter.read(`data/posts/${post}/index.md`);
        for (const field of validators) {
          it(`should have correct format for ${field.key}`, () => {
            expect(field.validator(data[field.key], post)).toBeTruthy();
          });
        }
      });
    }
  });
});
