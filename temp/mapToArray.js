const myMap = {
  key1: {
    val: 'value1',
    pos: 1
  },
  key2: {
    val: 'value2',
    pos: 2
  }
}

// console.log(myMap)

const arr = Object.keys(myMap).map(k => {
  return {
    id: k,
    path: myMap[k].val,
    deps: myMap[k].pos
  }
})

console.log(arr)
