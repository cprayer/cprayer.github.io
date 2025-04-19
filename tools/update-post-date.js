#!/usr/bin/env node

import fs from 'node:fs';
import {argv} from 'node:process';
import slash from 'slash';
import matter from 'gray-matter';

// Get files given by lint-staged (*.md files into staged)
for (const dirtyPath of argv.slice(3)) {
  // Make sure it will works on windows
  const path = slash(dirtyPath);

  // Only parse blog posts
  if (!path.includes('/data')) {
    continue;
  }

  // Get file from file system and parse it with gray-matter
  const orig = fs.readFileSync(path, 'utf8');
  const parsedFile = matter(orig);

  // Get current date and update `updatedDate` data
  const updatedDate = new Date().toISOString().split('T')[0];
  const updatedData = Object.assign({}, parsedFile.data, {updatedDate});

  // Recompose content and updated data
  const updatedContent = matter.stringify(parsedFile.content, updatedData);

  // Update file
  fs.writeFileSync(path, updatedContent, {encoding: 'utf8'});
}
