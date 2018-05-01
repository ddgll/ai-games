const POPULATION = 200
const PIPE_APPAIRS = 120
const POINTS_VELOCITY = 2

// 200000 bestbrain : {"nodes":[{"bias":0.01677521926152363,"type":"input","squash":"LOGISTIC","mask":1,"index":0},{"bias":-0.05991491113230616,"type":"input","squash":"LOGISTIC","mask":1,"index":1},{"bias":-0.09845151740282093,"type":"input","squash":"LOGISTIC","mask":1,"index":2},{"bias":-0.038194591075069444,"type":"input","squash":"LOGISTIC","mask":1,"index":3},{"bias":0.05971884878600431,"type":"input","squash":"LOGISTIC","mask":1,"index":4},{"bias":-0.018711670609269065,"type":"input","squash":"LOGISTIC","mask":1,"index":5},{"bias":-0.04608897321841279,"type":"input","squash":"LOGISTIC","mask":1,"index":6},{"bias":0.020271533262150004,"type":"input","squash":"LOGISTIC","mask":1,"index":7},{"bias":0.05313713427071334,"type":"input","squash":"LOGISTIC","mask":1,"index":8},{"bias":0.052935545111771454,"type":"input","squash":"LOGISTIC","mask":1,"index":9},{"bias":-0.08736791450873582,"type":"input","squash":"LOGISTIC","mask":1,"index":10},{"bias":0.02117125984450459,"type":"input","squash":"LOGISTIC","mask":1,"index":11},{"bias":0.026756868742948914,"type":"input","squash":"LOGISTIC","mask":1,"index":12},{"bias":0.08780015965220675,"type":"hidden","squash":"LOGISTIC","mask":1,"index":13},{"bias":0.06718421753451764,"type":"hidden","squash":"LOGISTIC","mask":1,"index":14},{"bias":-0.04080649040729152,"type":"hidden","squash":"LOGISTIC","mask":1,"index":15},{"bias":0.08831923141121792,"type":"hidden","squash":"LOGISTIC","mask":1,"index":16},{"bias":0.021298999240836197,"type":"hidden","squash":"LOGISTIC","mask":1,"index":17},{"bias":0.010783660710960291,"type":"hidden","squash":"LOGISTIC","mask":1,"index":18},{"bias":-0.06540816306341365,"type":"hidden","squash":"LOGISTIC","mask":1,"index":19},{"bias":0.08839762450694155,"type":"hidden","squash":"LOGISTIC","mask":1,"index":20},{"bias":0.062086298071220514,"type":"output","squash":"LOGISTIC","mask":1,"index":21}],"connections":[{"weight":0.0024682859312882,"from":20,"to":21,"gater":null},{"weight":0.04154407420354467,"from":19,"to":21,"gater":null},{"weight":0.34400612370986217,"from":18,"to":21,"gater":null},{"weight":0.06951086021054934,"from":17,"to":21,"gater":null},{"weight":0.011864923749232176,"from":16,"to":21,"gater":null},{"weight":0.020991292500218778,"from":15,"to":21,"gater":null},{"weight":-0.6853157718628564,"from":14,"to":21,"gater":null},{"weight":0.07019909098833432,"from":13,"to":21,"gater":null},{"weight":0.03474079327604401,"from":12,"to":20,"gater":null},{"weight":-0.2922074616303052,"from":11,"to":20,"gater":null},{"weight":0.41953751191294697,"from":12,"to":19,"gater":null},{"weight":0.7995755928839574,"from":10,"to":20,"gater":null},{"weight":-0.19842327129819615,"from":11,"to":19,"gater":null},{"weight":-0.06034018749470027,"from":12,"to":18,"gater":null},{"weight":0.07406948910850608,"from":9,"to":20,"gater":null},{"weight":-0.6281893748085778,"from":10,"to":19,"gater":null},{"weight":-0.048993802551995286,"from":11,"to":18,"gater":null},{"weight":0.005601558269383133,"from":12,"to":17,"gater":null},{"weight":0.5168606635710851,"from":8,"to":20,"gater":null},{"weight":-0.08572786119052278,"from":9,"to":19,"gater":null},{"weight":0.18940844062518425,"from":10,"to":18,"gater":null},{"weight":0.5317985005615553,"from":11,"to":17,"gater":null},{"weight":0.5806983619709878,"from":12,"to":16,"gater":null},{"weight":0.5839578514002612,"from":7,"to":20,"gater":null},{"weight":-0.4260773790716869,"from":8,"to":19,"gater":null},{"weight":-0.30017741077149285,"from":9,"to":18,"gater":null},{"weight":0.194133756662471,"from":10,"to":17,"gater":null},{"weight":0.23259768967834804,"from":11,"to":16,"gater":null},{"weight":-0.2403068932898878,"from":12,"to":15,"gater":null},{"weight":0.7456983792982809,"from":6,"to":20,"gater":null},{"weight":-1.151081953783012,"from":7,"to":19,"gater":null},{"weight":-0.139654920799562,"from":8,"to":18,"gater":null},{"weight":-0.09180694239876407,"from":9,"to":17,"gater":null},{"weight":-1.842777028565032,"from":10,"to":16,"gater":null},{"weight":0.2846596240239707,"from":11,"to":15,"gater":null},{"weight":-0.002954844709272833,"from":12,"to":14,"gater":null},{"weight":-0.717868473275528,"from":5,"to":20,"gater":null},{"weight":0.133447610371373,"from":6,"to":19,"gater":null},{"weight":-0.1882217817374756,"from":7,"to":18,"gater":null},{"weight":-0.7563887034536986,"from":8,"to":17,"gater":null},{"weight":-0.09154247876550015,"from":9,"to":16,"gater":null},{"weight":-1.4235430380344405,"from":10,"to":15,"gater":null},{"weight":0.11935257498118657,"from":11,"to":14,"gater":null},{"weight":0.7338157032972678,"from":12,"to":13,"gater":null},{"weight":-1.1236741346035086,"from":4,"to":20,"gater":null},{"weight":0.03470954880450003,"from":5,"to":19,"gater":null},{"weight":0.11994516591036364,"from":6,"to":18,"gater":null},{"weight":-0.244754792781005,"from":7,"to":17,"gater":null},{"weight":-0.06908992874289899,"from":8,"to":16,"gater":null},{"weight":-0.093120878712541,"from":9,"to":15,"gater":null},{"weight":-0.6057753294379423,"from":10,"to":14,"gater":null},{"weight":-1.7636076763294568,"from":11,"to":13,"gater":null},{"weight":-0.17850349062018256,"from":3,"to":20,"gater":null},{"weight":-0.063663965521144,"from":4,"to":19,"gater":null},{"weight":0.05853249244874864,"from":5,"to":18,"gater":null},{"weight":-0.41951182758135175,"from":6,"to":17,"gater":null},{"weight":-1.3993350729780967,"from":7,"to":16,"gater":null},{"weight":0.16137961009479285,"from":8,"to":15,"gater":null},{"weight":-0.15603850508490233,"from":9,"to":14,"gater":null},{"weight":-0.4975856205674417,"from":10,"to":13,"gater":null},{"weight":-0.9585270349705681,"from":2,"to":20,"gater":null},{"weight":-0.39684600912790713,"from":3,"to":19,"gater":null},{"weight":-0.039562692014754666,"from":4,"to":18,"gater":null},{"weight":0.27370412237304553,"from":5,"to":17,"gater":null},{"weight":-0.4772604229206858,"from":6,"to":16,"gater":null},{"weight":-0.07485015776011324,"from":7,"to":15,"gater":null},{"weight":0.007947477407944034,"from":8,"to":14,"gater":null},{"weight":-0.8690414299435588,"from":9,"to":13,"gater":null},{"weight":-0.015473132093159508,"from":1,"to":20,"gater":null},{"weight":1.1549512710035847,"from":2,"to":19,"gater":null},{"weight":-0.028588190488088347,"from":3,"to":18,"gater":null},{"weight":0.04611509294115068,"from":4,"to":17,"gater":null},{"weight":-0.09604020006520471,"from":5,"to":16,"gater":null},{"weight":-0.9972944383060511,"from":6,"to":15,"gater":null},{"weight":0.3876974167600426,"from":7,"to":14,"gater":null},{"weight":-0.24429154404273054,"from":8,"to":13,"gater":null},{"weight":0.9089509767454137,"from":0,"to":20,"gater":null},{"weight":0.09359663410760768,"from":1,"to":19,"gater":null},{"weight":0.46284789134106574,"from":2,"to":18,"gater":null},{"weight":0.45681622679961453,"from":3,"to":17,"gater":null},{"weight":-0.9505541901910639,"from":4,"to":16,"gater":null},{"weight":0.6482531520508604,"from":5,"to":15,"gater":null},{"weight":-0.06763333893399795,"from":6,"to":14,"gater":null},{"weight":0.3050508634373327,"from":7,"to":13,"gater":null},{"weight":-0.17278981253753245,"from":0,"to":19,"gater":null},{"weight":-0.0557252837701982,"from":1,"to":18,"gater":null},{"weight":0.09348601902916773,"from":2,"to":17,"gater":null},{"weight":-0.2682342663801158,"from":3,"to":16,"gater":null},{"weight":-0.9115890708627387,"from":4,"to":15,"gater":null},{"weight":-0.06648736440620354,"from":5,"to":14,"gater":null},{"weight":0.039570795529244585,"from":6,"to":13,"gater":null},{"weight":1.0117314887896798,"from":0,"to":18,"gater":null},{"weight":-0.07844945998353198,"from":1,"to":17,"gater":null},{"weight":0.013503162899994953,"from":2,"to":16,"gater":null},{"weight":0.09220509854680681,"from":3,"to":15,"gater":null},{"weight":-0.0883888280360361,"from":4,"to":14,"gater":null},{"weight":0.9604191534990336,"from":5,"to":13,"gater":null},{"weight":-1.0444518419043605,"from":0,"to":17,"gater":null},{"weight":-0.4386575885299603,"from":1,"to":16,"gater":null},{"weight":-0.771137130857889,"from":2,"to":15,"gater":null},{"weight":0.9476346170982932,"from":3,"to":14,"gater":null},{"weight":-0.03609124600858703,"from":4,"to":13,"gater":null},{"weight":-0.48128260796976213,"from":0,"to":16,"gater":null},{"weight":-0.032664013833298006,"from":1,"to":15,"gater":null},{"weight":-0.7218439427419081,"from":2,"to":14,"gater":null},{"weight":-0.8653693545061195,"from":3,"to":13,"gater":null},{"weight":-0.17076906797739685,"from":0,"to":15,"gater":null},{"weight":-0.02653168547161347,"from":1,"to":14,"gater":null},{"weight":0.4075579426818686,"from":2,"to":13,"gater":null},{"weight":-1.5523883119161628,"from":0,"to":14,"gater":null},{"weight":0.045828949240993705,"from":1,"to":13,"gater":null},{"weight":-0.09276195714380553,"from":0,"to":13,"gater":null}],"input":13,"output":1,"dropout":0}
// 600000 bestbrain : {"nodes":[{"bias":0.01677521926152363,"type":"input","squash":"LOGISTIC","mask":1,"index":0},{"bias":-0.05991491113230616,"type":"input","squash":"LOGISTIC","mask":1,"index":1},{"bias":-0.09845151740282093,"type":"input","squash":"LOGISTIC","mask":1,"index":2},{"bias":-0.038194591075069444,"type":"input","squash":"LOGISTIC","mask":1,"index":3},{"bias":0.05971884878600431,"type":"input","squash":"LOGISTIC","mask":1,"index":4},{"bias":-0.018711670609269065,"type":"input","squash":"LOGISTIC","mask":1,"index":5},{"bias":-0.04608897321841279,"type":"input","squash":"LOGISTIC","mask":1,"index":6},{"bias":0.020271533262150004,"type":"input","squash":"LOGISTIC","mask":1,"index":7},{"bias":0.05313713427071334,"type":"input","squash":"LOGISTIC","mask":1,"index":8},{"bias":0.052935545111771454,"type":"input","squash":"LOGISTIC","mask":1,"index":9},{"bias":-0.08736791450873582,"type":"input","squash":"LOGISTIC","mask":1,"index":10},{"bias":0.02117125984450459,"type":"input","squash":"LOGISTIC","mask":1,"index":11},{"bias":0.026756868742948914,"type":"input","squash":"LOGISTIC","mask":1,"index":12},{"bias":0.08780015965220675,"type":"hidden","squash":"LOGISTIC","mask":1,"index":13},{"bias":0.06718421753451764,"type":"hidden","squash":"LOGISTIC","mask":1,"index":14},{"bias":-0.04080649040729152,"type":"hidden","squash":"LOGISTIC","mask":1,"index":15},{"bias":0.08831923141121792,"type":"hidden","squash":"LOGISTIC","mask":1,"index":16},{"bias":0.021298999240836197,"type":"hidden","squash":"LOGISTIC","mask":1,"index":17},{"bias":0.010783660710960291,"type":"hidden","squash":"LOGISTIC","mask":1,"index":18},{"bias":-0.06540816306341365,"type":"hidden","squash":"LOGISTIC","mask":1,"index":19},{"bias":0.08839762450694155,"type":"hidden","squash":"LOGISTIC","mask":1,"index":20},{"bias":0.062086298071220514,"type":"output","squash":"LOGISTIC","mask":1,"index":21}],"connections":[{"weight":0.0024682859312882,"from":20,"to":21,"gater":null},{"weight":0.04154407420354467,"from":19,"to":21,"gater":null},{"weight":0.34400612370986217,"from":18,"to":21,"gater":null},{"weight":0.06951086021054934,"from":17,"to":21,"gater":null},{"weight":0.011864923749232176,"from":16,"to":21,"gater":null},{"weight":0.020991292500218778,"from":15,"to":21,"gater":null},{"weight":-0.6853157718628564,"from":14,"to":21,"gater":null},{"weight":0.07019909098833432,"from":13,"to":21,"gater":null},{"weight":0.11094152908080562,"from":12,"to":20,"gater":null},{"weight":-0.2922074616303052,"from":11,"to":20,"gater":null},{"weight":0.41953751191294697,"from":12,"to":19,"gater":null},{"weight":1.2084566412785471,"from":10,"to":20,"gater":null},{"weight":-0.19842327129819615,"from":11,"to":19,"gater":null},{"weight":-0.06034018749470027,"from":12,"to":18,"gater":null},{"weight":0.8144179629192825,"from":9,"to":20,"gater":null},{"weight":-0.6281893748085778,"from":10,"to":19,"gater":null},{"weight":0.18777148733948676,"from":11,"to":18,"gater":null},{"weight":0.005601558269383133,"from":12,"to":17,"gater":null},{"weight":0.2682262139655083,"from":8,"to":20,"gater":null},{"weight":-0.08572786119052278,"from":9,"to":19,"gater":null},{"weight":0.18940844062518425,"from":10,"to":18,"gater":null},{"weight":0.4476786418328762,"from":11,"to":17,"gater":null},{"weight":0.5806983619709878,"from":12,"to":16,"gater":null},{"weight":-0.14036045814718756,"from":7,"to":20,"gater":null},{"weight":-0.4260773790716869,"from":8,"to":19,"gater":null},{"weight":-0.30017741077149285,"from":9,"to":18,"gater":null},{"weight":0.194133756662471,"from":10,"to":17,"gater":null},{"weight":-0.7132747887476952,"from":11,"to":16,"gater":null},{"weight":-0.2403068932898878,"from":12,"to":15,"gater":null},{"weight":1.4517147670910315,"from":6,"to":20,"gater":null},{"weight":-1.151081953783012,"from":7,"to":19,"gater":null},{"weight":-0.139654920799562,"from":8,"to":18,"gater":null},{"weight":-0.09180694239876407,"from":9,"to":17,"gater":null},{"weight":-1.842777028565032,"from":10,"to":16,"gater":null},{"weight":0.2846596240239707,"from":11,"to":15,"gater":null},{"weight":-0.002954844709272833,"from":12,"to":14,"gater":null},{"weight":-1.166740529198041,"from":5,"to":20,"gater":null},{"weight":0.17288730444403347,"from":6,"to":19,"gater":null},{"weight":-0.1882217817374756,"from":7,"to":18,"gater":null},{"weight":-0.7563887034536986,"from":8,"to":17,"gater":null},{"weight":-0.09154247876550015,"from":9,"to":16,"gater":null},{"weight":-1.4235430380344405,"from":10,"to":15,"gater":null},{"weight":0.11935257498118657,"from":11,"to":14,"gater":null},{"weight":0.7338157032972678,"from":12,"to":13,"gater":null},{"weight":-0.803135111595898,"from":4,"to":20,"gater":null},{"weight":0.03470954880450003,"from":5,"to":19,"gater":null},{"weight":0.11994516591036364,"from":6,"to":18,"gater":null},{"weight":-0.244754792781005,"from":7,"to":17,"gater":null},{"weight":-0.3362986783277928,"from":8,"to":16,"gater":null},{"weight":-0.093120878712541,"from":9,"to":15,"gater":null},{"weight":-0.6057753294379423,"from":10,"to":14,"gater":null},{"weight":-1.0838917710705873,"from":11,"to":13,"gater":null},{"weight":-0.17850349062018256,"from":3,"to":20,"gater":null},{"weight":-0.063663965521144,"from":4,"to":19,"gater":null},{"weight":0.05853249244874864,"from":5,"to":18,"gater":null},{"weight":-0.41951182758135175,"from":6,"to":17,"gater":null},{"weight":-1.8104632132920941,"from":7,"to":16,"gater":null},{"weight":-0.010786497117788008,"from":8,"to":15,"gater":null},{"weight":-0.15603850508490233,"from":9,"to":14,"gater":null},{"weight":-0.4975856205674417,"from":10,"to":13,"gater":null},{"weight":-0.9585270349705681,"from":2,"to":20,"gater":null},{"weight":-0.39684600912790713,"from":3,"to":19,"gater":null},{"weight":-0.039562692014754666,"from":4,"to":18,"gater":null},{"weight":0.27370412237304553,"from":5,"to":17,"gater":null},{"weight":-0.4772604229206858,"from":6,"to":16,"gater":null},{"weight":-0.055556815851418764,"from":7,"to":15,"gater":null},{"weight":0.007947477407944034,"from":8,"to":14,"gater":null},{"weight":-0.8690414299435588,"from":9,"to":13,"gater":null},{"weight":-0.015473132093159508,"from":1,"to":20,"gater":null},{"weight":1.1549512710035847,"from":2,"to":19,"gater":null},{"weight":-0.028588190488088347,"from":3,"to":18,"gater":null},{"weight":0.04611509294115068,"from":4,"to":17,"gater":null},{"weight":-0.09604020006520471,"from":5,"to":16,"gater":null},{"weight":-0.9972944383060511,"from":6,"to":15,"gater":null},{"weight":0.3876974167600426,"from":7,"to":14,"gater":null},{"weight":-0.24429154404273054,"from":8,"to":13,"gater":null},{"weight":0.9089509767454137,"from":0,"to":20,"gater":null},{"weight":0.15656939053327892,"from":1,"to":19,"gater":null},{"weight":0.46284789134106574,"from":2,"to":18,"gater":null},{"weight":0.42159656945373003,"from":3,"to":17,"gater":null},{"weight":-0.9505541901910639,"from":4,"to":16,"gater":null},{"weight":0.6482531520508604,"from":5,"to":15,"gater":null},{"weight":-0.06763333893399795,"from":6,"to":14,"gater":null},{"weight":0.3050508634373327,"from":7,"to":13,"gater":null},{"weight":-0.836085331243323,"from":0,"to":19,"gater":null},{"weight":-0.0557252837701982,"from":1,"to":18,"gater":null},{"weight":0.09348601902916773,"from":2,"to":17,"gater":null},{"weight":-0.5272460058822874,"from":3,"to":16,"gater":null},{"weight":-0.9115890708627387,"from":4,"to":15,"gater":null},{"weight":-0.06648736440620354,"from":5,"to":14,"gater":null},{"weight":0.039570795529244585,"from":6,"to":13,"gater":null},{"weight":1.0117314887896798,"from":0,"to":18,"gater":null},{"weight":-0.07844945998353198,"from":1,"to":17,"gater":null},{"weight":0.013503162899994953,"from":2,"to":16,"gater":null},{"weight":0.09220509854680681,"from":3,"to":15,"gater":null},{"weight":-0.0883888280360361,"from":4,"to":14,"gater":null},{"weight":0.9604191534990336,"from":5,"to":13,"gater":null},{"weight":-1.0444518419043605,"from":0,"to":17,"gater":null},{"weight":-0.4386575885299603,"from":1,"to":16,"gater":null},{"weight":-0.771137130857889,"from":2,"to":15,"gater":null},{"weight":0.9476346170982932,"from":3,"to":14,"gater":null},{"weight":-0.03609124600858703,"from":4,"to":13,"gater":null},{"weight":-1.6654774947712412,"from":0,"to":16,"gater":null},{"weight":-0.016573008339067302,"from":1,"to":15,"gater":null},{"weight":-0.7218439427419081,"from":2,"to":14,"gater":null},{"weight":-0.9113821239436289,"from":3,"to":13,"gater":null},{"weight":-1.0553850574858135,"from":0,"to":15,"gater":null},{"weight":-0.02653168547161347,"from":1,"to":14,"gater":null},{"weight":0.4075579426818686,"from":2,"to":13,"gater":null},{"weight":-1.5523883119161628,"from":0,"to":14,"gater":null},{"weight":0.045828949240993705,"from":1,"to":13,"gater":null},{"weight":-0.09276195714380553,"from":0,"to":13,"gater":null}],"input":13,"output":1,"dropout":0}
// 1000000 bestbrain : {"nodes":[{"bias":0.01677521926152363,"type":"input","squash":"LOGISTIC","mask":1,"index":0},{"bias":-0.05991491113230616,"type":"input","squash":"LOGISTIC","mask":1,"index":1},{"bias":-0.09845151740282093,"type":"input","squash":"LOGISTIC","mask":1,"index":2},{"bias":-0.038194591075069444,"type":"input","squash":"LOGISTIC","mask":1,"index":3},{"bias":0.05971884878600431,"type":"input","squash":"LOGISTIC","mask":1,"index":4},{"bias":-0.018711670609269065,"type":"input","squash":"LOGISTIC","mask":1,"index":5},{"bias":-0.04608897321841279,"type":"input","squash":"LOGISTIC","mask":1,"index":6},{"bias":0.020271533262150004,"type":"input","squash":"LOGISTIC","mask":1,"index":7},{"bias":0.05313713427071334,"type":"input","squash":"LOGISTIC","mask":1,"index":8},{"bias":0.052935545111771454,"type":"input","squash":"LOGISTIC","mask":1,"index":9},{"bias":-0.08736791450873582,"type":"input","squash":"LOGISTIC","mask":1,"index":10},{"bias":0.02117125984450459,"type":"input","squash":"LOGISTIC","mask":1,"index":11},{"bias":0.026756868742948914,"type":"input","squash":"LOGISTIC","mask":1,"index":12},{"bias":0.08780015965220675,"type":"hidden","squash":"LOGISTIC","mask":1,"index":13},{"bias":0.06718421753451764,"type":"hidden","squash":"LOGISTIC","mask":1,"index":14},{"bias":-0.04080649040729152,"type":"hidden","squash":"LOGISTIC","mask":1,"index":15},{"bias":0.08831923141121792,"type":"hidden","squash":"LOGISTIC","mask":1,"index":16},{"bias":0.021298999240836197,"type":"hidden","squash":"LOGISTIC","mask":1,"index":17},{"bias":0.010783660710960291,"type":"hidden","squash":"LOGISTIC","mask":1,"index":18},{"bias":-0.06540816306341365,"type":"hidden","squash":"LOGISTIC","mask":1,"index":19},{"bias":0.08839762450694155,"type":"hidden","squash":"LOGISTIC","mask":1,"index":20},{"bias":0.062086298071220514,"type":"output","squash":"LOGISTIC","mask":1,"index":21}],"connections":[{"weight":0.0024682859312882,"from":20,"to":21,"gater":null},{"weight":0.04154407420354467,"from":19,"to":21,"gater":null},{"weight":0.34400612370986217,"from":18,"to":21,"gater":null},{"weight":0.06951086021054934,"from":17,"to":21,"gater":null},{"weight":0.011864923749232176,"from":16,"to":21,"gater":null},{"weight":0.020991292500218778,"from":15,"to":21,"gater":null},{"weight":-0.6853157718628564,"from":14,"to":21,"gater":null},{"weight":0.07019909098833432,"from":13,"to":21,"gater":null},{"weight":-1.1793440919153928,"from":12,"to":20,"gater":null},{"weight":-0.8713336250097832,"from":11,"to":20,"gater":null},{"weight":0.41953751191294697,"from":12,"to":19,"gater":null},{"weight":2.5694079802516527,"from":10,"to":20,"gater":null},{"weight":-2.4760652232268243,"from":11,"to":19,"gater":null},{"weight":-0.06034018749470027,"from":12,"to":18,"gater":null},{"weight":0.27699211672534507,"from":9,"to":20,"gater":null},{"weight":-0.5277130015480926,"from":10,"to":19,"gater":null},{"weight":0.16873702366713028,"from":11,"to":18,"gater":null},{"weight":0.005601558269383133,"from":12,"to":17,"gater":null},{"weight":-1.5664867061640169,"from":8,"to":20,"gater":null},{"weight":-0.07560522845076179,"from":9,"to":19,"gater":null},{"weight":0.18940844062518425,"from":10,"to":18,"gater":null},{"weight":0.12765113950682383,"from":11,"to":17,"gater":null},{"weight":0.4748215896989012,"from":12,"to":16,"gater":null},{"weight":-0.6218138540647606,"from":7,"to":20,"gater":null},{"weight":-0.4260773790716869,"from":8,"to":19,"gater":null},{"weight":-0.30017741077149285,"from":9,"to":18,"gater":null},{"weight":0.23818593971591384,"from":10,"to":17,"gater":null},{"weight":0.1838663057895098,"from":11,"to":16,"gater":null},{"weight":-0.2403068932898878,"from":12,"to":15,"gater":null},{"weight":2.3671669891545184,"from":6,"to":20,"gater":null},{"weight":-1.1806765734341378,"from":7,"to":19,"gater":null},{"weight":-0.139654920799562,"from":8,"to":18,"gater":null},{"weight":-0.09180694239876407,"from":9,"to":17,"gater":null},{"weight":-2.053124051989457,"from":10,"to":16,"gater":null},{"weight":-0.8846966913245335,"from":11,"to":15,"gater":null},{"weight":-0.002954844709272833,"from":12,"to":14,"gater":null},{"weight":-0.9448127693245294,"from":5,"to":20,"gater":null},{"weight":0.17288730444403347,"from":6,"to":19,"gater":null},{"weight":-0.1882217817374756,"from":7,"to":18,"gater":null},{"weight":-0.7563887034536986,"from":8,"to":17,"gater":null},{"weight":-0.035342946794716834,"from":9,"to":16,"gater":null},{"weight":-1.6478179668195856,"from":10,"to":15,"gater":null},{"weight":0.006159524809263628,"from":11,"to":14,"gater":null},{"weight":0.7338157032972678,"from":12,"to":13,"gater":null},{"weight":-1.000010834009112,"from":4,"to":20,"gater":null},{"weight":0.00662517665838544,"from":5,"to":19,"gater":null},{"weight":0.11994516591036364,"from":6,"to":18,"gater":null},{"weight":-0.2815797450606612,"from":7,"to":17,"gater":null},{"weight":-0.36581538337089414,"from":8,"to":16,"gater":null},{"weight":-0.03703155325406611,"from":9,"to":15,"gater":null},{"weight":-0.6057753294379423,"from":10,"to":14,"gater":null},{"weight":-2.0912833913549638,"from":11,"to":13,"gater":null},{"weight":0.8964649608116779,"from":3,"to":20,"gater":null},{"weight":-0.063663965521144,"from":4,"to":19,"gater":null},{"weight":0.05853249244874864,"from":5,"to":18,"gater":null},{"weight":-0.41951182758135175,"from":6,"to":17,"gater":null},{"weight":-1.9964882914764286,"from":7,"to":16,"gater":null},{"weight":-0.06886566060756905,"from":8,"to":15,"gater":null},{"weight":-0.15603850508490233,"from":9,"to":14,"gater":null},{"weight":-0.4975856205674417,"from":10,"to":13,"gater":null},{"weight":-1.7802653502448573,"from":2,"to":20,"gater":null},{"weight":-0.39684600912790713,"from":3,"to":19,"gater":null},{"weight":-0.039562692014754666,"from":4,"to":18,"gater":null},{"weight":0.27370412237304553,"from":5,"to":17,"gater":null},{"weight":-0.03508044143292599,"from":6,"to":16,"gater":null},{"weight":0.13254417042591565,"from":7,"to":15,"gater":null},{"weight":0.007947477407944034,"from":8,"to":14,"gater":null},{"weight":-0.8690414299435588,"from":9,"to":13,"gater":null},{"weight":0.17428525069808753,"from":1,"to":20,"gater":null},{"weight":1.4120469560776339,"from":2,"to":19,"gater":null},{"weight":-0.028588190488088347,"from":3,"to":18,"gater":null},{"weight":0.04611509294115068,"from":4,"to":17,"gater":null},{"weight":-0.09604020006520471,"from":5,"to":16,"gater":null},{"weight":-0.8899563685939764,"from":6,"to":15,"gater":null},{"weight":0.3876974167600426,"from":7,"to":14,"gater":null},{"weight":-0.24429154404273054,"from":8,"to":13,"gater":null},{"weight":1.431300125883606,"from":0,"to":20,"gater":null},{"weight":0.15656939053327892,"from":1,"to":19,"gater":null},{"weight":0.46284789134106574,"from":2,"to":18,"gater":null},{"weight":0.42159656945373003,"from":3,"to":17,"gater":null},{"weight":-2.0940833183491563,"from":4,"to":16,"gater":null},{"weight":0.519392329705629,"from":5,"to":15,"gater":null},{"weight":-0.06763333893399795,"from":6,"to":14,"gater":null},{"weight":0.3050508634373327,"from":7,"to":13,"gater":null},{"weight":-0.7541367582859813,"from":0,"to":19,"gater":null},{"weight":-0.0557252837701982,"from":1,"to":18,"gater":null},{"weight":0.13584101604788065,"from":2,"to":17,"gater":null},{"weight":0.056266406752236264,"from":3,"to":16,"gater":null},{"weight":-0.9773733098923821,"from":4,"to":15,"gater":null},{"weight":-0.06648736440620354,"from":5,"to":14,"gater":null},{"weight":0.053505196490358564,"from":6,"to":13,"gater":null},{"weight":1.0117314887896798,"from":0,"to":18,"gater":null},{"weight":-0.07844945998353198,"from":1,"to":17,"gater":null},{"weight":0.07397853094940843,"from":2,"to":16,"gater":null},{"weight":-0.006201097948404621,"from":3,"to":15,"gater":null},{"weight":-0.0883888280360361,"from":4,"to":14,"gater":null},{"weight":0.9604191534990336,"from":5,"to":13,"gater":null},{"weight":0.023482215997266742,"from":0,"to":17,"gater":null},{"weight":-0.4453756789294995,"from":1,"to":16,"gater":null},{"weight":-0.11746349805915568,"from":2,"to":15,"gater":null},{"weight":0.945182456215746,"from":3,"to":14,"gater":null},{"weight":-0.009602056179215487,"from":4,"to":13,"gater":null},{"weight":0.728502232194504,"from":0,"to":16,"gater":null},{"weight":-0.016573008339067302,"from":1,"to":15,"gater":null},{"weight":-0.7218439427419081,"from":2,"to":14,"gater":null},{"weight":-0.9509666569055312,"from":3,"to":13,"gater":null},{"weight":-0.4474741055011864,"from":0,"to":15,"gater":null},{"weight":-0.02653168547161347,"from":1,"to":14,"gater":null},{"weight":0.4075579426818686,"from":2,"to":13,"gater":null},{"weight":-1.5523883119161628,"from":0,"to":14,"gater":null},{"weight":0.045828949240993705,"from":1,"to":13,"gater":null},{"weight":-0.5047096152903642,"from":0,"to":13,"gater":null}],"input":13,"output":1,"dropout":0}

var best = null
var bestScore = 0
var birds = []
var dead = []
var pipes = []
var counter = 0
var slider
var sliderm
var pipe_appairs
var log
var showb = true
var showclones = false
var hard = false
var shard = false
var log

function sqr(a) {
  return a*a;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(sqr(y2 - y1) + sqr(x2 - x1));
}

function setup () {
  const bshard = localStorage.getItem('bestbhard')
  const bsshard = localStorage.getItem('bestbshard')
  if (bshard === 'true') hard = true
  if (bsshard === 'true') shard = true

  frameRate(30)
  createCanvas(600, 600)
  log = createDiv('')
  const box = createCheckbox('hard', hard)
  const sbox = createCheckbox('Super Hard', shard)
  box.changed(() => {
    hard = box.checked()
    localStorage.setItem('bestbhard', hard)
    if (shard) {
      pipes = []
      counter = 0
    }
  })
  sbox.changed(() => {
    shard = sbox.checked()
    localStorage.setItem('bestbshard', shard)
    if (shard) {
      pipes = []
      counter = 0
    }
  })

  slider = createSlider(1, 100, 1)
  sliderm = createSlider(1, 100, 1)
  const saved = localStorage.getItem('bestbrain')
  const bsaved = localStorage.getItem('bestscore')
  let brain
  try {
    brain = saved ? neataptic.Network.fromJSON(JSON.parse(saved)) : null
    if (brain) best = new Bird(brain, null, true)
  } catch(e) {
    console.error('FAILED TO Load best', e)
  }
  for(let i = 0; i < POPULATION; i++) birds.push(new Bird(brain))
  log = createDiv('LOG')
  var buttons = createButton('START')
  buttons.position(650, 9);
  buttons.mousePressed(() => {
    loop();
  })
  button = createButton('STOP')
  button.position(650, 49);
  button.mousePressed(() => {
    noLoop();
  })
  button = createButton('SHOW BEST')
  button.position(650, 89);
  button.mousePressed(() => {
    best.killed = false
    showb = !showb
  })
  button = createButton('SHOW CLONES')
  button.position(650, 129);
  button.mousePressed(() => {
    showclones = !showclones
  })
}

function draw () {
  pipe_appairs = PIPE_APPAIRS
  const maxc = slider.value() * sliderm.value()
  if (!hard) pipe_appairs += 100
  if (shard) pipe_appairs -= 50
  for (let i = 0; i < maxc; i++) {
    if (counter > 10000) hard = true
    log.elt.innerHTML = counter + ' h(' + hard + ') : ' + ' sh(' + shard + ') : ' + birds.length + '<br>' + 
    '<h1>BEST: ' + Math.round(bestScore) + ' <small>FPS multiplieur: ' + maxc + '</small><h1>'

    if (counter++ % pipe_appairs === 0) {
      pipes.push(new Pipe())
    }

    pipes.forEach((p) => {
      p.update()
      birds.forEach(bird => {
        if (p.hits(bird)) bird.killed = true
      })
      if (p.hits(best)) best.killed = true
    })
    
    if (best) {
      best.think(pipes)
      best.update()
    }

    let bmax, max = 0
    birds.forEach((bird) => {
      bird.first = false
      if (bird.score > max) {
        bmax = bird
        max = bird.score
      }
      bird.think(pipes)
      bird.update()
    })
    if (bmax) bmax.first = true

    if (birds.length < POPULATION*0.1 && bestScore > 2000000) {
      birds.forEach(bird => {
        bird.killed = true
      })
      best.killed = true
    }

    if (best && best.killed && showb && !showclones) {
      showclones = true
    }

    pipes = pipes.filter(p => !p.offscreen())
    dead = dead.concat(birds.filter(b => b.killed))
    birds = birds.filter(b => !b.killed)

    if (birds.length === 0) {
      counter = 0
      pipes = []
      if (bestScore < 10000) {
        hard = false
        shard = false
      }
      nextGeneration()
    }
  }

  background(0)
  pipes.forEach(p => p.show())
  if (best && !best.killed && showb) {
    best.show(true)
  }
  if (showclones) {
    birds.forEach(b => b.show())
  }
}
