import * as Matter from 'matter-js';
import * as LarkMatter from '../lark-matter/index';

window.onload = () => {
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
  var cradle = (<any>Matter.Composites).newtonsCradle(280, 100, 5, 30, 200);
  Matter.World.add(world, cradle);
  Matter.Body.translate(cradle.bodies[0], { x: -180, y: -100 });
  cradle = (<any>Matter.Composites).newtonsCradle(280, 380, 7, 20, 140);
  Matter.World.add(world, cradle);
  Matter.Body.translate(cradle.bodies[0], { x: -140, y: -100 });
}
