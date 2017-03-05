declare module 'ppe' {
  function emit(patternName: string,
    x: number, y: number, angle?: number,
    emitOptions?: EmitOptions,
    pool?: ParticlePool);
  function update();
  function getParticles();
  function setSeed(seed?: number);
  function reset();
  function clear();
  function clearPools();
  function setOptions(_options: Options);

  let options: Options;

  interface Particle {
    pos: Vector;
    size: number;
    color: Color;
  }

  class ParticlePool {
    constructor(canvas?: HTMLCanvasElement);
    getParticles(): Particle[];
    clear(): void;
  }

  interface Vector {
    x: number;
    y: number;
  }

  interface Color {
    r: number;
    g: number;
    b: number;
    getStyle(): string;
  }

  interface Options {
    scaleRatio?: number;
    canvas?: HTMLCanvasElement;
    isLimitingColors?: boolean;
  }

  interface EmitOptions {
    sizeScale?: number;
    countScale?: number;
    hue?: number;
    velX?: number;
    velY?: number;
    speed?: number;
    slowdownRatio?: number;
  }
}
