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
const loadModels = () => {
  return new Promise((resolve, reject) => {
    window.fetch('/model-index.json')
      .then(r => r.json())
      .then(m => resolve(m.models))
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

const init = async () => {
  models = await loadModels()
  bindTemplate('models-list-template', models, 'rendered')
}

(async () => {
  await init()
})()
