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
        this.log.innerHTML = msg
      } else {
        this.log.innerHTML = msg + this.log.innerHTML
      }
    }
  }

  update (context) {
    this.context = context
    this.debug('UPDATE ELEMENT' + id)
  }
}