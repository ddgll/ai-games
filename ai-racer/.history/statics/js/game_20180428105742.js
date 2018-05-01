// module aliases
const   Engine = Matter.Engine,
        Render = Matter.Render,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        CANVAS_WIDTH = 600
        CANVAS_HEIGHT = 400

const loadMatter = () => {
  // create an engine
  const engine = Engine.create();

  // create a renderer
  const render = Render.create({
      element: document.getElementById('render'),
      engine: engine,
      options: {
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          pixelRatio: 1,
          background: '#222',
          wireframeBackground: '#222',
          hasBounds: false,
          enabled: true,
          wireframes: false,
          showSleeping: true,
          showDebug: false,
          showBroadphase: false,
          showBounds: false,
          showVelocity: false,
          showCollisions: false,
          showSeparations: false,
          showAxes: false,
          showPositions: true,
          showAngleIndicator: false,
          showIds: false,
          showShadows: false,
          showVertexNumbers: false,
          showConvexHulls: false,
          showInternalEdges: false,
          showMousePosition: false
      }
  });

  const circuit = new Circuit(10, 10)

  console.log(circuit)

  // add all of the bodies to the world
  World.add(engine.world, circuit.body);

  // run the engine
  Engine.run(engine);

  // run the renderer
  Render.run(render);

}
