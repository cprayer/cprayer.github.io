import {unflatten} from 'flat';
import {pascalCase, sentenceCase} from 'change-case';
import {inputRequired, addWithCustomData} from './utils.js';

const MAX_PROPS = 10;

const propertiesPrompts = [];
for (const [i, _] of Array.from({length: MAX_PROPS}).entries()) {
  propertiesPrompts.push(
    {
      type: 'confirm',
      name: '_props',
      message: () => (i === 0 ? 'Do you have props?' : 'Other props?'),
      when: data => i === 0 || data._props,
    },
    {
      type: 'input',
      name: `props.${i}.name`,
      message: 'Props name?',
      validate: inputRequired('props name'),
      when: data => data._props,
    },
    {
      type: 'input',
      name: `props.${i}.type`,
      message: 'Props type?',
      validate: inputRequired('props type'),
      when: data => data._props,
    },
    {
      type: 'confirm',
      name: `props.${i}.required`,
      message: 'Props is required?',
      when: data => data._props,
    },
  );
}

const plop = plop => {
  plop.addHelper('propsHelper', text => `{${text}}`);
  plop.setGenerator('component', {
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name?',
        validate: inputRequired('name'),
      },
      {
        type: 'input',
        name: 'description',
        message: 'Component description?',
        default: data => `${sentenceCase(data.name)} component.`,
      },
      ...propertiesPrompts,
      {
        type: 'checkbox',
        name: 'files',
        message: 'Wish files do you generate?',
        choices: data => [
          {
            name: `${pascalCase(data.name)}.tsx`,
            value: 'component',
            checked: true,
          },
          {
            name: `${pascalCase(data.name)}.test.tsx`,
            value: 'test',
            checked: true,
          },
          {
            name: `${pascalCase(data.name)}.stories.tsx`,
            value: 'stories',
            checked: true,
          },
        ],
      },
    ],
    actions(data) {
      // Parse data for easy templating
      data = unflatten(data);
      data.props ||= [];
      data.haveRequiredProps = data.props.some(property => property.required);

      data.props = data.props.map(property =>
        Object.assign({}, property, {optional: !property.required}),
      );

      const basePath = data.files.length > 0
        ? '../src/components/{{pascalCase name}}/'
        : '../src/components/';

      const actions = [];

      for (const a of [
        {
          condition: 'component', actions: [
            {path: `${basePath}{{pascalCase name}}.tsx`, templateFile: 'templates/component-tsx.template'},
          ],
        },
        {
          condition: 'test', actions: [
            {path: `${basePath}{{pascalCase name}}.test.tsx`, templateFile: 'templates/component-test-tsx.template'},
          ],
        },
        {
          condition: 'stories', actions: [
            {path: `${basePath}{{pascalCase name}}.stories.tsx`, templateFile: 'templates/component-stories-tsx.template'},
            {path: `${basePath}README.md`, templateFile: 'templates/component-readme-md.template'},
          ],
        },
      ]) {
        if (data.files.includes(a.condition)) {
          for (const i of a.actions) {
            actions.push(addWithCustomData(plop, i, data));
          }
        }
      }

      return actions;
    },
  });
};

export default plop;
