const fs = require('fs')
const path = require('path')

/**
 * @description "removes the dtmi prefix and the version, and replaces : with -"
 * @param {string} dtmi
 * @returns {string}
 */
const dtmi2folder = (dtmi) => {
  const parts = dtmi.toLowerCase().split(';')[0].split(':')
  parts.shift()
  return parts.join('-')
}

/**
 * @param {string} file
 */
const addModel = (file) => {
  if (!fs.existsSync(file)) {
    console.error('file not found:' + file)
    process.exit()
  }
  const rootJson = JSON.parse(fs.readFileSync(file, 'utf-8'))

  /**
   * @type {modelIndex} index
   */
  const index = JSON.parse(fs.readFileSync('model-index.json', 'utf-8'))

  if (rootJson['@context'] && rootJson['@context'] === 'dtmi:dtdl:context;2') {
    const id = rootJson['@id']
    if (index.models.filter(m => m.dtmi === id).length > 0) {
      console.error(`dtmi ${id} already exists in the index.`)
      process.exit()
    }

    const folder = 'models/' + dtmi2folder(id)
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder)
    }

    fs.copyFileSync(file, folder + '/' + path.basename(file))
    index.models.push({
      dtmi: id,
      path: folder + '/' + path.basename(file),
      owner: 'ridomin',
      depends: []
    })

    fs.writeFileSync('model-index.json', JSON.stringify(index))
    console.log(`model ${id} added successfully.`)
  } else {
    console.error('File is not DTDL 2 interface')
  }
}

const main = () => {
  const op = process.argv[2]
  const file = process.argv[3]
  console.log(`op: ${op} path: ${file}`)
  addModel(file)
}
main()
