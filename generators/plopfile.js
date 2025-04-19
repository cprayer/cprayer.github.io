/**
 * Plopfile generator
 *
 * https://github.com/amwmedia/plop
 */

export default plop => {
  plop.load('./component-generator.js');
  plop.load('./page-generator.js');
  plop.load('./blog-post-generator.js');
};
