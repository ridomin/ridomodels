const fs = require('fs')
const file = 'jsonmap.json'

const map = JSON.parse(fs.readFileSync(file, 'utf-8'))
console.log(map)

map['dtmi:from:code;1'] = {
  path: '/vasdva',
  depends: [
    'aa'
  ]
}

Object.keys(map).forEach(e => console.log(e))

if (map['dtmi:from:code;1']) {
    console.log('id found')
}

// fs.writeFileSync(file, JSON.stringify(map, null, 2))
