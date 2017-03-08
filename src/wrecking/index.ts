import * as Matter from 'matter-js';
import * as lm from '../lark-matter/index';
//import * as gcc from 'gcc';

window.onload = () => {
  lm.LarkMatter.options.enableBgm = true;
  lm.LarkMatter.options.enableSes = true;
  /*lm.LarkMatter.options.onRender = () => {
    gcc.capture(lm.canvas);
  };
  gcc.setOptions({
    scale: 1
  });*/
  (<any>Matter).use('lark-matter');
  init();
}

function init() {
  var engine = Matter.Engine.create(),
    world = engine.world;
  var render = Matter.Render.create({
    element: document.body,
    engine: engine,
    options: {
      width: Math.min(document.documentElement.clientWidth, 800),
      height: Math.min(document.documentElement.clientHeight, 600),
    }
  });
  Matter.Render.run(render);
  var runner = (<any>Matter.Runner).create();
  Matter.Runner.run(runner, engine);
  var rows = 10,
    yy = 600 - 21 - 40 * rows;
  var stack = Matter.Composites.stack(400, yy, 5, rows, 0, 0, function (x, y) {
    return Matter.Bodies.rectangle(x, y, 40, 40);
  });
  (<any>Matter.World.add)(world, [
    stack,
    Matter.Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
    Matter.Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
    Matter.Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
    Matter.Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
  ]);
  var ball = Matter.Bodies.circle(100, 400, 50, { density: 0.04, frictionAir: 0.005 });
  Matter.World.add(world, ball);
  Matter.World.add(world, Matter.Constraint.create({
    pointA: { x: 300, y: 100 },
    bodyB: ball
  }));
}
