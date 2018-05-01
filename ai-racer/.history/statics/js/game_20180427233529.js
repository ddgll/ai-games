// module aliases
const Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies;

const loadMatter = () => {
  // create an engine
  const engine = Engine.create();

  // create a renderer
  const render = Render.create({
      element: document.getElementById('render'),
      engine: engine,
      options: {
          width: 800,
          height: 600,
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

  const road1 = new Road(200, 200)
  const road2 = new Road(229, 218)

  // create two boxes and a ground
  const boxA = Bodies.rectangle(400, 200, 80, 80);
  const boxB = Bodies.rectangle(450, 50, 80, 80);
  const ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

  // add all of the bodies to the world
  World.add(engine.world, [road1.body, road2.body, boxA, boxB, ground]);

  // run the engine
  Engine.run(engine);

  // run the renderer
  Render.run(render);

}
