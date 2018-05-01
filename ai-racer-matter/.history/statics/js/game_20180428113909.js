// module aliases
const Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint,
    Bodies = Matter.Bodies,
    Events = Matter.Events,
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

    const circuit = new Circuit(35, 35)

    // add mouse control
    const mouse = Mouse.create(render.canvas)
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: true
            }
        }
    })

    World.add(engine.world, mouseConstraint)

    Events.on(mouseConstraint, 'mouseup', function(event) {
        var mousePosition = event.mouse.position;
        console.log('mouseup at ' + mousePosition.x + ' ' + mousePosition.y, event.source);
    })

    // keep the mouse in sync with rendering
    render.mouse = mouse

    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: CANVAS_WIDTH, y: CANVAS_HEIGHT }
    })

    // add all of the bodies to the world
    World.add(engine.world, circuit.body);

    // run the engine
    Engine.run(engine);

    // run the renderer
    Render.run(render);

}