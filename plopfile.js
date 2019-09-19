// Docs at https://github.com/amwmedia/plop#case-modifiers
const generators = ['view']

module.exports = plop => {
  generators.map(v =>
    plop.setGenerator(v, require(`./plop-templates/${v}/prompt`))
  )
}
