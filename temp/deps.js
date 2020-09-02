const fs = require('fs')
const file = 'models/com-example-temperaturecontroller/tc2.json'

const rootJson = JSON.parse(fs.readFileSync(file, 'utf-8'))
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

deps.forEach(d => console.log(d))
