import * as _ from 'lodash';
import { Engine, Render, World, Bodies, Events, Composite, Composites, Constraint } from 'matter-js';
import * as Matter from 'matter-js';
import * as pag from 'pag';

window.onload = init;
let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
let options = {
  scale: 0.2,
  rotationNum: 16
};

function init() {
  (<any>Matter).after('Render.create', initRender);
  (<any>Matter).after('Render.run', runRender);
  (<any>Matter).after('Engine.create', initEngine);
  (<any>Matter).after('Body.create', createBody);
  start();
}

function initRender() {
  const render: Matter.Render = this;
  render.element.removeChild(render.canvas);
  pag.setDefaultOptions({
    isLimitingColors: true,
    rotationNum: options.rotationNum,
    colorLighting: 0.5,
    colorNoise: 0.01
  });
  pag.setSeed(80);
}

function createBody() {
  const body: Matter.Body = this;
  let bMinX = (<any>body.bounds).min.x;
  let bMinY = (<any>body.bounds).min.y;
  let bMaxX = (<any>body.bounds).max.x;
  let bMaxY = (<any>body.bounds).max.y;
  let w = Math.max(body.position.x - bMinX, bMaxX - body.position.x);
  let h = Math.max(body.position.y - bMinY, bMaxY - body.position.y);
  bMinX = body.position.x - w;
  bMaxX = body.position.x + w;
  bMinY = body.position.y - h;
  bMaxY = body.position.y + h;
  const tw = Math.ceil((bMaxX - bMinX) * options.scale) + 1;
  const th = Math.ceil((bMaxY - bMinY) * options.scale) + 1;
  let lines: { min: number, max: number }[] = _.times(th, () => null);
  const patterns: string[][] = _.times(th, () => _.times(tw, () => ' '));
  for (let k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
    const verticies = body.parts[k].vertices;
    let fv: Matter.Vector;
    let pv: Matter.Vector;
    _.forEach(verticies, (vert: any) => {
      if (vert.isInternal) {
        pv = null;
        fillLines(patterns, lines);
        lines = _.times(th, () => null);
        return;
      }
      const v = Matter.Vector.create
        ((vert.x - bMinX) * options.scale, (vert.y - bMinY) * options.scale);
      if (pv != null) {
        drawLine(lines, tw, th, pv, v);
      } else {
        fv = v;
      }
      pv = v;
    });
    if (pv != null && fv != null) {
      drawLine(lines, tw, th, pv, fv);
    }
  }
  fillLines(patterns, lines);
  (<any>body).pixels = pag.generate(_.map(patterns, p => p.join('')));
}

function drawLine
  (lines: { min: number, max: number }[], pw: number, ph: number,
  p1: Matter.Vector, p2: Matter.Vector) {
  let vx: number;
  let vy: number;
  let c: number;
  if (Math.abs(p1.x - p2.x) < Math.abs(p1.y - p2.y)) {
    c = Math.abs(p2.y - p1.y) + 1;
    vx = (p2.x - p1.x) / c;
    vy = p1.y > p2.y ? -1 : 1;
  } else {
    c = Math.abs(p2.x - p1.x) + 1;
    vy = (p2.y - p1.y) / c;
    vx = p1.x > p2.x ? -1 : 1;
  }
  let px = p1.x;
  let py = Math.floor(p1.y);
  _.times(c, () => {
    if (px >= 0 && px < pw && py >= 0 && py < ph) {
      let l = lines[py];
      if (l == null) {
        lines[py] = { min: px, max: px };
      } else {
        if (px < l.min) {
          lines[py].min = px;
        }
        if (px > l.max) {
          lines[py].max = px;
        }
      }
    }
    px += vx;
    py += vy;
  });
}

function fillLines(patterns: string[][], lines: { min: number, max: number }[]) {
  _.forEach(lines, (l, y) => {
    if (l == null) {
      return;
    }
    for (let x = Math.floor(l.min); x <= Math.floor(l.max); x++) {
      patterns[y][x] = '*';
    }
  });
}

function runRender(render: Matter.Render) {
  Render.stop(render);
  canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  canvas.style.cssText = `
  width: 512px;
  height: 512px;
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: -o-crisp-edges;
  image-rendering: pixelated;
  background: black;
  `;
  context = canvas.getContext('2d');
  document.body.appendChild(canvas);
  renderLm(render);
}

function renderLm(render: Matter.Render) {
  requestAnimationFrame(() => { renderLm(render); });
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  const bodies = Composite.allBodies((<any>render).engine.world);
  _.forEach(bodies, body => {
    if (!body.render.visible) {
      return;
    }
    const ri = wrap(
      Math.round(body.angle * options.rotationNum / (Math.PI * 2)),
      0, options.rotationNum);
    pag.draw(context, (<any>body).pixels,
      body.position.x * options.scale, body.position.y * options.scale, ri);
  });
}

function initEngine() {
  const engine: Engine = this;
  Events.on(engine, 'collisionStart', e => {
    _.forEach(e.pairs, p => {
      //console.log((<any>p).collision.depth);
      _.forEach(p.activeContacts, ac => {
        //console.log(ac.vertex);
      });
    });
  });
}

function wrap(v: number, low: number, high: number) {
  const w = high - low;
  const o = v - low;
  if (o >= 0) {
    return o % w + low;
  } else {
    let v = w + o % w + low;
    if (v >= high) {
      v -= w;
    }
    return v;
  }
}

function start() {
  /*
  const engine = Engine.create();
  const render = Render.create({
    element: document.body,
    engine: engine
  });
  var boxA = Bodies.rectangle(400, 200, 50, 100);
  //var boxB = Bodies.rectangle(450, 50, 120, 30);
  var boxB = Bodies.circle(450, 50, 60);
  var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
  World.add(engine.world, [boxA, boxB, ground]);
  Engine.run(engine);
  Render.run(render);
  /*/
  // create engine
  var engine = Engine.create(),
    world = engine.world;

  // create renderer
  var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      width: Math.min(document.documentElement.clientWidth, 800),
      height: Math.min(document.documentElement.clientHeight, 600),
      //showAngleIndicator: true
    }
  });

  Render.run(render);

  // create runner
  //var runner = Runner.create();
  //Runner.run(runner, engine);
  Engine.run(engine);

  // add bodies
  var rows = 10,
    yy = 600 - 21 - 40 * rows;

  var stack = Composites.stack(400, yy, 5, rows, 0, 0, function (x, y) {
    return Bodies.rectangle(x, y, 40, 40);
  });

  (<any>World.add)(world, [
    stack,
    // walls
    Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
    Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
    Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
    Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
  ]);

  var ball = Bodies.circle(100, 400, 50, { density: 0.04, frictionAir: 0.005 });

  World.add(world, ball);
  World.add(world, Constraint.create({
    pointA: { x: 300, y: 100 },
    bodyB: ball
  }));
  //*/
}
