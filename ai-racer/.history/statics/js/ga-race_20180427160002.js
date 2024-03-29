import { POINT_CONVERSION_COMPRESSED } from "constants";

function initNeat () {
  neat = new neataptic.Neat(
    11,
    2,
    {
      mutation: neataptic.methods.mutation.ALL,
      popsize: POPULATION,
      mutationRate: MUTATION_RATE,
      elitism: Math.round(ELITISM_PERCENT * POPULATION),
      network: new neataptic.architect.Random(11, 11, 2)
    }
  )
}