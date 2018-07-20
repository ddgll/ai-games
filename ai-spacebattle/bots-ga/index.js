const BotSocket = require('./bot-socket')
const GaBrain = require('./ga-brain')
const CONSTANTS = require('../statics/js/constants')
const ACTIONS_STRING = require('../bots-keyboard/bot-brains/actions')
const fs = require('fs')
const path = require('path')

const inputs = (CONSTANTS.VISION.TOP + CONSTANTS.VISION.BOTTOM) * (CONSTANTS.VISION.SIDE * 2) + 2
const actions = ACTIONS_STRING.length

const GeneticAlgorithm = require('./ga')

const NB_POPULATION = 100
const NB_SIMULATIONS = 50

let bots = []
let dead = []
let start = false
var bestScore = 0

const options = {
  inputs,
  actions,
  hidden: inputs,
  nbPopulation: NB_POPULATION
}

const d = new Date()
const session = d.toISOString().replace(/[T:\.]{1}/g, '-').replace(/\-[0-9]+\-[0-9]+\-[0-9]+Z$/, '')
const sessionDir = path.resolve(`./brains/${session}`)
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir)


console.log('Start GA width', options)
const genetic = new GeneticAlgorithm(options)

const createBot = (brain) => {
  if (!brain || !brain.brain) throw new Error(`Brain is empty: ${JSON.stringify(brain)}`)
  // console.log(`Initialization of bot ${brain.index}`)
  const gaBrain = new GaBrain(brain.brain)
  const bot = new BotSocket(gaBrain, brain.index, botDie, 'http://localhost:7770')
  bots.push(bot)
}

const getNbAlive = () => {
  let nb = 0
  bots.forEach(b => {
    if (dead.indexOf(b.id) < 0) nb++
  })
  return nb
}

const botDie = (id, index, score) => {
  const idx = bots.findIndex(b => b.id === id)
  if (dead.indexOf(id) < 0) dead.push(id)
  if (idx < 0) return
  // console.log(`Bot ${index} is dead: ${score}`, id, idx, genetic.neat.population.length, bots.length, dead.length)
  genetic.setBrainScore(index, !isNaN(score) ? score : 0)
  if (bots.length === NB_POPULATION) {
    const alives = getNbAlive()
    if (alives) {
      // console.log(`Wait for all bots to die... remaining: ${NB_POPULATION - alives}`)
    } else {
      // console.log('All bots are dead, start Evolution...')
      start = false
      genetic.endEvaluation().then(launchNextBots)
    }
  } else {
    brain = genetic.getNextBrain()
    if (brain) {
      createBot(brain)
    } else {
      throw new Error('Not enough brains...')
    }
  }
  // console.log(`Bot ${index} is dead: ${score}`, genetic.neat.population.length, bots.length)
  // brain = genetic.getNextBrain()
  // if (brain) {
  //   createBot(brain)
  // } else if (bots.length === NB_POPULATION && start) {
  //   console.log('All bots are dead, start Evolution...')
  //   start = false
  //   genetic.endEvaluation().then(launchNextBots)
  // } else if (bots.length !== 0) {
  //   console.log(`Wait for all bots to die... remaining: ${bots.length}`, genetic.neat.population.length, bots.length, bots)
  // }
}

const launchNextBots = (fittest) => {
  if (start) return
  start = true
  bots = []
  dead = []
  if (fittest && fittest.score) {
    if (bestScore < fittest.score) {
      bestScore = fittest.score
      const json = fittest.toJSON()
      const now = Date.now()
      const name = `${sessionDir}/brain-${now}-${Math.round(bestScore)}-${Math.round(genetic.neat.generation)}.json`
      fs.writeFileSync(path.resolve(name), JSON.stringify(json, null, 2), 'utf8')
      console.log('NEW BEST Score !!', bestScore)
    } else {
      console.log('Generation best score !!', fittest.score)
    }
  }
  console.log(`Start generation ${genetic.neat.generation}`, bestScore, NB_POPULATION)
  for (let i = 0, brain; i < NB_SIMULATIONS; i++) {
    brain = genetic.getNextBrain()
    createBot(brain)
  }
}

launchNextBots()
