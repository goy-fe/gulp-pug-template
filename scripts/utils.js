const fs = require('fs-extra')
const jsYaml = require('js-yaml')

/**
 * 读取 YAML 文件内容 无内容出错则返回空对象
 * @param {string} filePath YAML文件路径
 */
function readYamlFile (filePath) {
  let result = {}

  if (!fs.existsSync(filePath)) return result

  try {
    result = jsYaml.safeLoad(fs.readFileSync(filePath, 'utf8'))
  } catch (err) {
    console.log(err)
  }

  return result
}

const banner = `/*!
=================================================================

                  本文件由SCSS编译生成，禁止直接修改

  THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

=================================================================
*/
`

const config = readYamlFile('./config.yml')

module.exports = {
  readYamlFile,
  banner,
  config,
}
