const { resolve } = require('path')
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
    const name = data.name
    const kebabName = `{{kebabCase name}}`
    const actions = [
      { path: `src/views/${kebabName}.pug`, template: `index` },
      { path: `src/scss/${kebabName}.scss`, template: `style` },
      { path: `src/js/${kebabName}.js`, template: `script` },
      { path: `src/views/data/${kebabName}.yml`, template: `config` },
    ].map(({ path, template }) => ({
      type: 'add',
      path,
      templateFile: resolve(__dirname, `${template}.hbs`),
      data: { name },
    }))

    return actions
  },
}
