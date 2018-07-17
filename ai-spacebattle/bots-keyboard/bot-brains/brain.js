module.exports = class Brain {
  constructor () {
  }
  forward () {
    throw new Error('Class must implement forward')
  }
  backward () {
    throw new Error('Class must implement backward')
  }
  console () {
    throw new Error('Class must implement console')
  }
  learn () {
    throw new Error('Class must implement learn')
  }
  onE () { }
  export () {
    console.log('TODO Export')
  }
}