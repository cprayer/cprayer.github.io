/* eslint-disable no-undef */
const path = jest.genMockFromModule('path');

path.resolve = (...pathSegment) =>
  ['base-path', ...pathSegment].join('/');

export default path;
