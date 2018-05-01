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
          background: '#fafafa',
          wireframeBackground: '#222',
          hasBounds: false,
          enabled: true,
          wireframes: true,
          showSleeping: true,
          showDebug: false,
          showBroadphase: false,
          showBounds: false,
          showVelocity: false,
          showCollisions: false,
          showSeparations: false,
          showAxes: false,
          showPositions: false,
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
  const boxA = Bodies.rectangle(400, 200, 80, 80, {
    fillStyle: 'red',
    strokeStyle: 'blue',
    lineWidth: 4
  });
  const boxB = Bodies.rectangle(450, 50, 80, 80);
  const ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

  // add all of the bodies to the world
  World.add(engine.world, [center.body, boxA, boxB, ground]);

  // run the engine
  Engine.run(engine);

  // run the renderer
  Render.run(render);

}
