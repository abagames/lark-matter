lark-matter
======================
Pixel art style [matter.js](http://brm.io/matter-js/) renderer plugin.

![screenshot](https://abagames.github.io/lark-matter/screenshot.gif)

### Demos

[wrecking](https://abagames.github.io/lark-matter/wrecking/index.html)

[newton](https://abagames.github.io/lark-matter/newton/index.html)

### Usage

See [the sample code](https://github.com/abagames/lark-matter/blob/master/docs/index.html) of [the car demo](https://abagames.github.io/lark-matter/index.html).

```javascript
    Matter.use('lark-matter');
    // Pixel size of a dot
    LarkMatter.options.dotSize = 5;
    // Number of pixel art rotation patterns
    LarkMatter.options.rotationNum = 16;
    // Enable sound effects
    LarkMatter.options.enableSes = false;
    // Enable a bgm
    LarkMatter.options.enableBgm = false;
    // Set a random seed for generating pixels, particles and audios
    // (null: Set a seed randomly each time)
    LarkMatter.options.seed = null;
    // OnRender callback function
    LarkMatter.options.onRender = null;
```

### Libraries

[pixel-art-gen](https://github.com/abagames/pixel-art-gen) /
[particle-pattern-emitter](https://github.com/abagames/particle-pattern-emitter) /
[sounds-some-sounds](https://github.com/abagames/sounds-some-sounds) /
[gif-capture-canvas](https://github.com/abagames/gif-capture-canvas)
