class Element {
  constructor (id, context, renderer, log) {
    this.log = log
    this.id = id
    this.context = context
    this.renderer = renderer
  }

  debug (msg, flush) {
    if (this.log) {
      const str = `- ${msg} <br>`
      if (flush) {
        this.log.innerHTML = str
      } else {
        this.log.innerHTML = str + this.log.innerHTML
      }
    }
  }

  update (context) {
    this.context = Object.assign({}, this.context, context)
  }
}

if (typeof window === 'undefined') module.exports = Element
