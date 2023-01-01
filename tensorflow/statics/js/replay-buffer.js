const Maths = require('./maths')
module.exports = class ReplayBuffer {
  constructor (bufferSize) {
    this.bufferSize = bufferSize
    this.buffer = []
  }

  add (s, a, r, s2, d) {
    const exprience = { s, a, r, s2, d }
    if (this.buffer.length < this.bufferSize) {
      this.buffer.push(exprience)
    } else {
      this.buffer = this.buffer.slice(1)
      this.buffer.push(exprience)
    }
  }

  size () {
    return this.buffer.length
  }

  sampleBatch (batchSize) {
    const length = this.buffer.length
    if (length < batchSize) {
      return Maths.sample(this.buffer, length)
    } else {
      return Maths.sample(this.buffer, batchSize)
    }
  }

  clear () {
    this.buffer = []
  }
}
