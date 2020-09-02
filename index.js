(async () => {
  let models = []

  const gbid = (id) => {
    const el = document.getElementById(id)
    if (el === null) {
      throw new Error('element not found: ' + id)
    }
    return el
  }

  const loadModels = (path) => {
    return new Promise((resolve, reject) => {
      window.fetch(path)
        .then(r => r.json())
        .then(m => resolve(m))
        .catch(e => reject(e))
    })
  }

  const bindTemplate = (template, models, target) => {
    gbid(target).innerHTML = Mustache.render(gbid(template).innerHTML, models)
  }

  const init = async () => {
    const path = 'model-index.json'
    models = await loadModels(path)

    const modelArray = Object.keys(models).map(k => {
      return {
        dtmi: k,
        path: models[k].path,
        depends: models[k].depends
      }
    })

    bindTemplate('models-list-template', modelArray, 'rendered')
  }
  await init()
})()
