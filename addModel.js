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
 * @param {{ extends: any[]; contents: any[]; }} rootJson
 * @returns {Array<string>}
 */
const getDependencies = (rootJson) => {
  const deps = []
  if (rootJson.extends) {
    if (Array.isArray(rootJson.extends)) {
      rootJson.extends.forEach(e => deps.push(e))
    } else {
      deps.push(rootJson.extends)
    }
  }
  const comps = rootJson.contents.filter(c => c['@type'] === 'Component')
  comps.forEach(c => {
    if (typeof c.schema !== 'object') {
      deps.push(c.schema)
    }
  })
  return deps
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

  const index = JSON.parse(fs.readFileSync('model-index.json', 'utf-8'))

  if (rootJson['@context'] && rootJson['@context'] === 'dtmi:dtdl:context;2') {
    const id = rootJson['@id']
    if (index[id]) {
      console.error(`ERROR: dtmi ${id} already exists in the model-index. Aborting.`)
      process.exit()
    }

    const deps = getDependencies(rootJson)
    deps.forEach(d => {
      if (index[d]) {
        console.log(`Dependency ${d} found in the index`)
      } else {
        console.error(`ERROR: Dependency ${d} NOT found in the index.Aborting`)
        process.exit()
      }
    })

    const folder = 'models/' + dtmi2folder(id)
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder)
    }

    index[id] = {
      path: folder + '/' + path.basename(file),
      deps: deps
    }

    fs.copyFileSync(file, folder + '/' + path.basename(file))

    fs.writeFileSync('model-index.json', JSON.stringify(index, null, 2))
    console.log(`Model ${id} added successfully.`)
  } else {
    console.error(`File ${file} is not a valid DTDL 2 interface`)
  }
}

const main = () => {
  const file = process.argv[2]
  console.log(`processing: ${file}`)
  addModel(file)
}
main()
