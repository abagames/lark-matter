import * as _ from 'lodash';
import * as Matter from 'matter-js';
import * as pag from 'pag';
import * as ppe from 'ppe';
import * as sss from 'sss';

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
  background: white;
  `;
  context = canvas.getContext('2d');
  document.body.appendChild(canvas);
  pag.setDefaultOptions({
    isLimitingColors: true,
    rotationNum: options.rotationNum,
    colorLighting: 0.5,
    colorNoise: 0.01
  });
  ppe.setOptions({
    canvas: canvas,
    isLimitingColors: true
  });
  sss.init();
  sss.setVolume(0.2)
  sss.setQuantize(0.25);
  const seed = Math.random() * 9999999;
  pag.setSeed(seed);
  ppe.setSeed(seed);
  sss.setSeed(seed);
  sss.playBgm('0', 0.25, [sss.Preset.Laser, sss.Preset.Hit], 8, 0.3);
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
  let px = 0;
  let py = 0;
  let pvx = 0;
  let pvy = 0;
  let pw = tw;
  let ph = th;
  let pc: number;
  if (tw > th) {
    pc = Math.floor(tw / th / 2);
    if (pc < 1) {
      pc = 1;
    }
    pw = Math.ceil(tw / pc);
    pvx = tw / pc;
  } else {
    pc = Math.floor(th / tw / 2);
    if (pc < 1) {
      pc = 1;
    }
    ph = Math.ceil(th / pc);
    pvy = th / pc;
  }
  (<any>body).pixels = _.times(pc, () => {
    const pixel = {
      pattern: pag.generate
        (getPatternStrings(patterns, Math.floor(px), Math.floor(py), pw, ph)),
      x: px + pw / 2 - tw / 2,
      y: py + ph / 2 - th / 2
    };
    px += pvx;
    py += pvy;
    return pixel;
  });
  (<any>body).ppeTypeId = `m_${tw}_${th}`;
  const seTypes = ['h', 'l', 's'];
  (<any>body).sssTypeId = `${seTypes[(tw + th) % 3]}_${tw}_${th}`;
}

function getPatternStrings
  (patterns: string[][], px: number, py: number, w: number, h: number) {
  let strs = [];
  for (let y = py; y < py + h; y++) {
    let str = '';
    for (let x = px; x < px + w; x++) {
      str += patterns[y][x];
    }
    strs.push(str);
  }
  return strs;
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
  Matter.Render.stop(render);
  renderLm(render);
}

function renderLm(render: Matter.Render) {
  requestAnimationFrame(() => { renderLm(render); });
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  ppe.update();
  sss.update();
  const bodies = Matter.Composite.allBodies((<any>render).engine.world);
  _.forEach(bodies, body => {
    if (!body.render.visible) {
      return;
    }
    const angle = body.angle;
    const ri = wrap(
      Math.round(angle * options.rotationNum / (Math.PI * 2)),
      0, options.rotationNum);
    const x = body.position.x * options.scale;
    const y = body.position.y * options.scale;
    let o = Matter.Vector.create();
    _.forEach((<any>body).pixels, p => {
      o.x = p.x;
      o.y = p.y;
      o = Matter.Vector.rotate(o, angle);
      pag.draw(context, p.pattern, x + o.x, y + o.y, ri);
    });
  });
}

function initEngine() {
  const engine: Matter.Engine = this;
  Matter.Events.on(engine, 'collisionStart', e => {
    _.forEach(e.pairs, p => {
      _.forEach(p.activeContacts, ac => {
        const b = ac.vertex.body;
        const v = b.velocity;
        let ratio = (<any>p).collision.depth * Matter.Vector.magnitude(v) * 0.1;
        if (ratio > 2) {
          ratio = 2;
        }
        if (ratio > 0.3) {
          ppe.emit(b.ppeTypeId,
            ac.vertex.x * options.scale, ac.vertex.y * options.scale,
            Math.atan2(-v.y, -v.x),
            { countScale: ratio, speed: 0.7 * ratio });
          sss.play(b.sssTypeId, 2, null, ratio > 1 ? 1 : ratio);
        }
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
  /*var cradle = (<any>Matter.Composites).newtonsCradle(280, 100, 5, 30, 200);
  Matter.World.add(world, cradle);
  Matter.Body.translate(cradle.bodies[0], { x: -180, y: -100 });
  cradle = (<any>Matter.Composites).newtonsCradle(280, 380, 7, 20, 140);
  Matter.World.add(world, cradle);
  Matter.Body.translate(cradle.bodies[0], { x: -140, y: -100 });*/
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
