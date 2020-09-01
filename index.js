(() => {
  /** @type {Array<modelInfo>} models */
  let models = []

  /**
   * @param {string} id - element id
   * @returns {HTMLElement}
   */
  const gbid = (id) => {
    const el = document.getElementById(id)
    if (el === null) {
      throw new Error('element not found: ' + id)
    }
    return el
  }

  /**
   * @returns {Promise<Array<modelInfo>>}
   */
  const loadModels = (path) => {
    return new Promise((resolve, reject) => {
      window.fetch(path)
        .then(r => r.json())
        .then(m => resolve(m))
        .catch(e => reject(e))
    })
  }

  /**
   * @param {string} template
   * @param {Array<modelInfo>} models
   * @param {string} target
   */
  const bindTemplate = (template, models, target) => {
    gbid(target).innerHTML = Mustache.render(gbid(template).innerHTML, models)
  }

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

  const init = () => {
    const button = gbid('seachDtmiButton')
    button.onclick = async () => {
      const searchText = gbid('dtmiSearchBox').value
      const folder = dtmi2folder(searchText)
      const path = `models/${folder}/model-manifest.json`
      try {
        models = await loadModels(path)
        models.forEach(m => {
          m.path = `models/${folder}/${m.path}`
        })
      } catch {
        models = []
      }
      bindTemplate('models-list-template', models, 'rendered')
    }
  }
  init()
})()
