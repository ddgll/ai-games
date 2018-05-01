// module aliases
const   Engine = Matter.Engine,
        Render = Matter.Render,
        World = Matter.World,
        Bodies = Matter.Bodies,
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

  const center = new Road(229, 218)

  // create two boxes and a ground
  const boxA = new Road(259, 2128)
  const boxB = Bodies.rectangle(450, 50, 80, 80);
  const ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

  // add all of the bodies to the world
  World.add(engine.world, [center.body, boxA.body, boxB, ground]);

  // run the engine
  Engine.run(engine);

  // run the renderer
  Render.run(render);

}
