import * as Matter from 'matter-js';
import * as pag from 'pag';
import * as ppe from 'ppe';
import * as sss from 'sss';

let matter: any;

export const LarkMatter = {
  name: 'lark-matter',
  version: '0.1.0',
  for: 'matter-js@^0.12.0',
  options: {
    dotSize: 5,
    rotationNum: 16,
    enableSes: false,
    enableBgm: false,
    seed: null,
    onRender: null
  },
  install: function (base) {
    matter = base;
    init();
  }
};
export const options = LarkMatter.options;

(<any>Matter).Plugin.register(LarkMatter);

export let canvas: HTMLCanvasElement;
export let context: CanvasRenderingContext2D;

function init() {
  matter.after('Render.create', initRender);
  matter.after('Render.run', runRender);
  matter.after('Engine.create', initEngine);
  matter.after('Body.create', createBody);
}

function initRender() {
  const render: Matter.Render = this;
  render.element.removeChild(render.canvas);
  canvas = document.createElement('canvas');
  canvas.width = render.options.width / LarkMatter.options.dotSize;
  canvas.height = render.options.height / LarkMatter.options.dotSize;
  canvas.style.cssText = `
  width: ${render.options.width}px;
  height: ${render.options.height}px;
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
    rotationNum: LarkMatter.options.rotationNum,
    colorLighting: 0.5,
    colorNoise: 0.01
  });
  ppe.setOptions({
    canvas: canvas,
    isLimitingColors: true
  });
  const seed = LarkMatter.options.seed != null ?
    LarkMatter.options.seed : Math.random() * 0x7fffffff;
  pag.setSeed(seed);
  ppe.setSeed(seed);
  if (LarkMatter.options.enableBgm || LarkMatter.options.enableSes) {
    sss.init();
    sss.setVolume(0.2)
    sss.setQuantize(0.25);
    sss.setSeed(seed);
    if (LarkMatter.options.enableBgm) {
      sss.playBgm('0', 0.25, [sss.Preset.Laser, sss.Preset.Hit], 8, 0.3);
    }
  }
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
  const tw = Math.ceil((bMaxX - bMinX) / LarkMatter.options.dotSize) + 1;
  const th = Math.ceil((bMaxY - bMinY) / LarkMatter.options.dotSize) + 1;
  let lines: { min: number, max: number }[] = nArray(th, null);
  const patterns: string[][] = timesArray(th, () => timesArray(tw, () => ' '));
  for (let k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
    const verticies = body.parts[k].vertices;
    let fv: Matter.Vector;
    let pv: Matter.Vector;
    verticies.forEach((vert: any) => {
      const v = matter.Vector.create(
        (vert.x - bMinX) / LarkMatter.options.dotSize,
        (vert.y - bMinY) / LarkMatter.options.dotSize);
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
  (<any>body).pixels = timesArray(pc, () => {
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
  let py = p1.y;
  times(c, () => {
    const fpy = Math.round(py)
    if (px >= 0 && px < pw && fpy >= 0 && fpy < ph) {
      let l = lines[fpy];
      if (l == null) {
        lines[fpy] = { min: px, max: px };
      } else {
        if (px < l.min) {
          lines[fpy].min = px;
        }
        if (px > l.max) {
          lines[fpy].max = px;
        }
      }
    }
    px += vx;
    py += vy;
  });
}

function fillLines(patterns: string[][], lines: { min: number, max: number }[]) {
  lines.forEach((l, y) => {
    if (l == null) {
      return;
    }
    for (let x = Math.floor(l.min); x <= Math.floor(l.max); x++) {
      patterns[y][x] = '*';
    }
  });
}

function runRender(render: Matter.Render) {
  matter.Render.stop(render);
  renderLm(render);
}

function renderLm(render: Matter.Render) {
  requestAnimationFrame(() => { renderLm(render); });
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  ppe.update();
  if (LarkMatter.options.enableBgm || LarkMatter.options.enableSes) {
    sss.update();
  }
  const bodies = matter.Composite.allBodies((<any>render).engine.world);
  bodies.forEach(body => {
    if (!body.render.visible) {
      return;
    }
    const angle = body.angle;
    const ri = wrap(
      Math.round(angle * LarkMatter.options.rotationNum / (Math.PI * 2)),
      0, LarkMatter.options.rotationNum);
    const x = body.position.x / LarkMatter.options.dotSize;
    const y = body.position.y / LarkMatter.options.dotSize;
    let o = matter.Vector.create();
    (<any>body).pixels.forEach(p => {
      o.x = p.x;
      o.y = p.y;
      o = matter.Vector.rotate(o, angle);
      pag.draw(context, p.pattern, x + o.x, y + o.y, ri);
    });
  });
  if (LarkMatter.options.onRender != null) {
    LarkMatter.options.onRender();
  }
}

function initEngine() {
  const engine: Matter.Engine = this;
  matter.Events.on(engine, 'collisionStart', e => {
    e.pairs.forEach(p => {
      p.activeContacts.forEach(ac => {
        const b = ac.vertex.body;
        const v = b.velocity;
        let ratio = (<any>p).collision.depth * matter.Vector.magnitude(v) * 0.1;
        if (ratio > 2) {
          ratio = 2;
        }
        if (ratio > 0.3) {
          ppe.emit(b.ppeTypeId,
            ac.vertex.x / LarkMatter.options.dotSize,
            ac.vertex.y / LarkMatter.options.dotSize,
            Math.atan2(-v.y, -v.x),
            { countScale: ratio, speed: 0.7 * ratio });
          if (LarkMatter.options.enableSes) {
            sss.play(b.sssTypeId, 2, null, ratio > 1 ? 1 : ratio);
          }
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

function nArray(n: number, v: any) {
  let result = [];
  for (let i = 0; i < n; i++) {
    result.push(v);
  }
  return result;
}

function times(n: number, func: Function) {
  for (let i = 0; i < n; i++) {
    func();
  }
}

function timesArray(n: number, func: Function) {
  let result = [];
  for (let i = 0; i < n; i++) {
    result.push(func());
  }
  return result;
}
