/**
 * Plopfile generator
 *
 * https://github.com/amwmedia/plop
 */

const plop = plop => {
  plop.load('./component-generator.js');
  plop.load('./page-generator.js');
  plop.load('./blog-post-generator.js');
};

export default plop;
