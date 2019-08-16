const { notEmpty } = require('../utils')

module.exports = {
  description: 'Generate a new page',

  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'Page name please',
      validate: notEmpty('name'),
    },
  ],

  actions: data => {
    const name = '{{kebabCase name}}'
    const actions = [
      { path: `src/views/${name}.pug`, template: `index` },
      { path: `src/scss/${name}.scss`, template: `style` },
      { path: `src/js/${name}.js`, template: `script` },
      { path: `src/views/data/${name}.yml`, template: `config` },
    ].map(({ path, template }) => ({
      type: 'add',
      path,
      templateFile: `${__dirname}/${template}.hbs`,
      data: { name },
    }))

    return actions
  },
}
