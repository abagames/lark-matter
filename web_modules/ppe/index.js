(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ppe"] = factory();
	else
		root["ppe"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	exports.options = {
	    scaleRatio: 1,
	    canvas: null,
	    isLimitingColors: false
	};
	var emitters = {};
	var seed = 0;
	var pools = [];
	var defaultPool;
	// emit the particle.
	// specify the type with the first character of the patternName
	// (e: explosion, m: muzzle, s: spark, t: trail, j: jet)
	function emit(patternName, x, y, angle, emitOptions, pool) {
	    if (angle === void 0) { angle = 0; }
	    if (emitOptions === void 0) { emitOptions = {}; }
	    if (pool === void 0) { pool = defaultPool; }
	    if (pool == null && defaultPool == null) {
	        pool = defaultPool = new ParticlePool();
	    }
	    if (emitters[patternName] == null) {
	        var random_1 = new Random();
	        random_1.setSeed(seed + getHashFromString(patternName));
	        emitters[patternName] = new Emitter(patternName[0], emitOptions, random_1);
	    }
	    var velX = emitOptions.velX == null ? 0 : emitOptions.velX;
	    var velY = emitOptions.velY == null ? 0 : emitOptions.velY;
	    emitters[patternName].emit(x, y, angle, velX, velY, pool);
	}
	exports.emit = emit;
	function update() {
	    for (var i = 0; i < pools.length; i++) {
	        var pool = pools[i];
	        pool.update();
	    }
	}
	exports.update = update;
	function getParticles() {
	    return defaultPool.particles;
	}
	exports.getParticles = getParticles;
	function setSeed(_seed) {
	    if (_seed === void 0) { _seed = 0; }
	    seed = _seed;
	}
	exports.setSeed = setSeed;
	function reset() {
	    emitters = {};
	    clear();
	}
	exports.reset = reset;
	function clear() {
	    for (var i = 0; i < pools.length; i++) {
	        var pool = pools[i];
	        pool.clear();
	    }
	}
	exports.clear = clear;
	function clearPools() {
	    pools = [];
	    defaultPool = new ParticlePool();
	}
	exports.clearPools = clearPools;
	function setOptions(_options) {
	    for (var attr in _options) {
	        exports.options[attr] = _options[attr];
	    }
	}
	exports.setOptions = setOptions;
	var Emitter = (function () {
	    function Emitter(patternType, emitOptions, random) {
	        this.base = new Particle();
	        this.angleDeflection = 0;
	        this.speedDeflection = 0.5;
	        this.sizeDeflection = 0.5;
	        this.ticksDeflection = 0.3;
	        this.count = 1;
	        var hue = emitOptions.hue == null ? random.get01() : emitOptions.hue;
	        var sizeScale = emitOptions.sizeScale == null ? 1 : emitOptions.sizeScale;
	        var countScale = emitOptions.countScale == null ? 1 : emitOptions.countScale;
	        switch (patternType) {
	            case 'e':
	                this.base.speed = 0.7;
	                this.base.slowdownRatio = 0.05;
	                this.base.targetSize = 10;
	                this.base.beginColor = new Color(hue, 1, 0.5, 0.3);
	                this.base.middleColor = new Color(hue, 0.2, 0.9, 0.1);
	                this.base.endColor = new Color(hue, 0, 0, 0);
	                this.base.middleTicks = 20;
	                this.base.endTicks = 30;
	                this.angleDeflection = Math.PI * 2;
	                this.count = 15;
	                break;
	            case 'm':
	            case 's':
	                this.base.speed = patternType === 'm' ? 1.5 : 0.5;
	                this.base.slowdownRatio = 0.025;
	                this.base.targetSize = 5;
	                this.base.beginColor = new Color(hue, 0.5, 0.5, 0.3);
	                this.base.middleColor = new Color(hue, 1, 0.9, 0.3);
	                this.base.endColor = new Color(hue, 0.75, 0.75, 0.2);
	                this.base.middleTicks = 10;
	                this.base.endTicks = 20;
	                this.angleDeflection = patternType === 'm' ?
	                    0.3 * random.getForParam() : Math.PI * 2;
	                this.count = 10;
	                break;
	            case 't':
	            case 'j':
	                this.base.speed = patternType === 't' ? 0.1 : 1;
	                this.base.slowdownRatio = 0.03;
	                this.base.targetSize = patternType === 't' ? 3 : 7;
	                this.base.beginColor = new Color(hue, 0.7, 0.7, 0.4);
	                this.base.middleColor = new Color(hue, 1, 0.9, 0.2);
	                this.base.endColor = new Color(hue, 0.7, 0.7, 0.1);
	                this.base.middleTicks = patternType === 't' ? 30 : 15;
	                this.base.endTicks = patternType === 't' ? 40 : 20;
	                this.angleDeflection = 0.5 * random.getForParam();
	                this.speedDeflection = 0.1;
	                this.sizeDeflection = 0.1;
	                this.ticksDeflection = 0.1;
	                this.count = 0.5;
	                break;
	        }
	        if (emitOptions.speed != null) {
	            this.base.speed = emitOptions.speed;
	        }
	        if (emitOptions.slowdownRatio != null) {
	            this.base.slowdownRatio = emitOptions.slowdownRatio;
	        }
	        this.base.speed *= sizeScale * exports.options.scaleRatio;
	        this.base.targetSize *= sizeScale * exports.options.scaleRatio;
	        this.count *= countScale;
	        this.base.speed *= random.getForParam();
	        this.base.slowdownRatio *= random.getForParam();
	        this.base.targetSize *= random.getForParam();
	        var em = this.base.endTicks - this.base.middleTicks;
	        this.base.middleTicks *= random.getForParam();
	        this.base.endTicks = this.base.middleTicks + em * random.getForParam();
	        this.speedDeflection *= random.getForParam();
	        this.sizeDeflection *= random.getForParam();
	        this.ticksDeflection *= random.getForParam();
	        this.count *= random.getForParam();
	    }
	    Emitter.prototype.emit = function (x, y, angle, velX, velY, pool) {
	        if (angle === void 0) { angle = 0; }
	        if (velX === void 0) { velX = 0; }
	        if (velY === void 0) { velY = 0; }
	        if (this.count < 1 && this.count < Math.random()) {
	            return;
	        }
	        for (var i = 0; i < this.count; i++) {
	            var p = new Particle();
	            p.pos.x = x;
	            p.pos.y = y;
	            p.vel.x = velX;
	            p.vel.y = velY;
	            p.angle = angle + (Math.random() - 0.5) * this.angleDeflection;
	            p.speed = this.base.speed *
	                ((Math.random() * 2 - 1) * this.speedDeflection + 1);
	            p.slowdownRatio = this.base.slowdownRatio;
	            p.targetSize = this.base.targetSize *
	                ((Math.random() * 2 - 1) * this.sizeDeflection + 1);
	            p.middleTicks = this.base.middleTicks *
	                ((Math.random() * 2 - 1) * this.ticksDeflection + 1);
	            p.endTicks = this.base.endTicks *
	                ((Math.random() * 2 - 1) * this.ticksDeflection + 1);
	            p.beginColor = this.base.beginColor;
	            p.middleColor = this.base.middleColor;
	            p.endColor = this.base.endColor;
	            pool.particles.push(p);
	        }
	    };
	    return Emitter;
	}());
	exports.Emitter = Emitter;
	var Particle = (function () {
	    function Particle() {
	        this.pos = new Vector();
	        this.vel = new Vector();
	        this.size = 0;
	        this.angle = 0;
	        this.speed = 1;
	        this.slowdownRatio = 0.01;
	        this.targetSize = 10;
	        this.middleTicks = 20;
	        this.endTicks = 60;
	        this.ticks = 0;
	    }
	    Particle.prototype.update = function (context) {
	        this.pos.x += Math.cos(this.angle) * this.speed + this.vel.x;
	        this.pos.y += Math.sin(this.angle) * this.speed + this.vel.y;
	        this.speed *= (1 - this.slowdownRatio);
	        this.vel.x *= 0.99;
	        this.vel.y *= 0.99;
	        if (this.ticks >= this.endTicks) {
	            return false;
	        }
	        if (this.ticks < this.middleTicks) {
	            this.color = this.beginColor.getLerped(this.middleColor, this.ticks / this.middleTicks);
	            this.size += (this.targetSize - this.size) * 0.1;
	        }
	        else {
	            this.color = this.middleColor.getLerped(this.endColor, (this.ticks - this.middleTicks) / (this.endTicks - this.middleTicks));
	            this.size *= 0.95;
	        }
	        this.color = this.color.getSparkled();
	        if (context != null) {
	            context.fillStyle = this.color.getStyle();
	            context.fillRect(this.pos.x - this.size / 2, this.pos.y - this.size / 2, this.size, this.size);
	        }
	        this.ticks++;
	    };
	    return Particle;
	}());
	exports.Particle = Particle;
	var ParticlePool = (function () {
	    function ParticlePool(canvas) {
	        if (canvas === void 0) { canvas = exports.options.canvas; }
	        this.canvas = canvas;
	        this.particles = [];
	        pools.push(this);
	    }
	    ParticlePool.prototype.update = function () {
	        if (this.context == null && this.canvas != null) {
	            this.context = this.canvas.getContext('2d');
	        }
	        for (var i = 0; i < this.particles.length;) {
	            if (this.particles[i].update(this.context) === false) {
	                this.particles.splice(i, 1);
	            }
	            else {
	                i++;
	            }
	        }
	    };
	    ParticlePool.prototype.getParticles = function () {
	        return this.particles;
	    };
	    ParticlePool.prototype.clear = function () {
	        this.particles = [];
	    };
	    return ParticlePool;
	}());
	exports.ParticlePool = ParticlePool;
	var Vector = (function () {
	    function Vector(x, y) {
	        if (x === void 0) { x = 0; }
	        if (y === void 0) { y = 0; }
	        this.x = x;
	        this.y = y;
	    }
	    return Vector;
	}());
	exports.Vector = Vector;
	var Color = (function () {
	    function Color(hue, saturation, value, sparkleRatio) {
	        if (hue === void 0) { hue = 0; }
	        if (saturation === void 0) { saturation = 1; }
	        if (value === void 0) { value = 1; }
	        if (sparkleRatio === void 0) { sparkleRatio = 0; }
	        this.hue = hue;
	        this.saturation = saturation;
	        this.value = value;
	        this.sparkleRatio = sparkleRatio;
	        this.r = 0;
	        this.g = 0;
	        this.b = 0;
	        this.r = value;
	        this.g = value;
	        this.b = value;
	        var h = hue * 6;
	        var i = Math.floor(h);
	        var f = h - i;
	        switch (i) {
	            case 0:
	                this.g *= 1 - saturation * (1 - f);
	                this.b *= 1 - saturation;
	                break;
	            case 1:
	                this.b *= 1 - saturation;
	                this.r *= 1 - saturation * f;
	                break;
	            case 2:
	                this.b *= 1 - saturation * (1 - f);
	                this.r *= 1 - saturation;
	                break;
	            case 3:
	                this.r *= 1 - saturation;
	                this.g *= 1 - saturation * f;
	                break;
	            case 4:
	                this.r *= 1 - saturation * (1 - f);
	                this.g *= 1 - saturation;
	                break;
	            case 5:
	                this.g *= 1 - saturation;
	                this.b *= 1 - saturation * f;
	                break;
	        }
	        if (exports.options.isLimitingColors === true) {
	            this.limitRgb();
	        }
	    }
	    Color.prototype.getStyle = function () {
	        var r = Math.floor(this.r * 255);
	        var g = Math.floor(this.g * 255);
	        var b = Math.floor(this.b * 255);
	        return "rgb(" + r + "," + g + "," + b + ")";
	    };
	    Color.prototype.getSparkled = function () {
	        if (this.sparkled == null) {
	            this.sparkled = new Color();
	        }
	        this.sparkled.r = clamp(this.r + this.sparkleRatio * (Math.random() * 2 - 1));
	        this.sparkled.g = clamp(this.g + this.sparkleRatio * (Math.random() * 2 - 1));
	        this.sparkled.b = clamp(this.b + this.sparkleRatio * (Math.random() * 2 - 1));
	        if (exports.options.isLimitingColors === true) {
	            this.sparkled.limitRgb();
	        }
	        return this.sparkled;
	    };
	    Color.prototype.getLerped = function (other, ratio) {
	        if (this.lerped == null) {
	            this.lerped = new Color();
	        }
	        this.lerped.r = this.r * (1 - ratio) + other.r * ratio;
	        this.lerped.g = this.g * (1 - ratio) + other.g * ratio;
	        this.lerped.b = this.b * (1 - ratio) + other.b * ratio;
	        this.lerped.sparkleRatio =
	            this.sparkleRatio * (1 - ratio) + other.sparkleRatio * ratio;
	        if (exports.options.isLimitingColors === true) {
	            this.lerped.limitRgb();
	        }
	        return this.lerped;
	    };
	    Color.prototype.limitRgb = function () {
	        this.r = this.limitColor(this.r);
	        this.g = this.limitColor(this.g);
	        this.b = this.limitColor(this.b);
	    };
	    Color.prototype.limitColor = function (v) {
	        return v < 0.25 ? 0 : v < 0.75 ? 0.5 : 1;
	    };
	    return Color;
	}());
	exports.Color = Color;
	function getHashFromString(str) {
	    var hash = 0;
	    var len = str.length;
	    for (var i = 0; i < len; i++) {
	        var chr = str.charCodeAt(i);
	        hash = ((hash << 5) - hash) + chr;
	        hash |= 0;
	    }
	    return hash;
	}
	function clamp(v) {
	    if (v <= 0) {
	        return 0;
	    }
	    else if (v >= 1) {
	        return 1;
	    }
	    else {
	        return v;
	    }
	}
	var Random = (function () {
	    function Random() {
	        this.setSeed();
	        this.get01 = this.get01.bind(this);
	    }
	    Random.prototype.setSeed = function (v) {
	        if (v === void 0) { v = -0x7fffffff; }
	        if (v === -0x7fffffff) {
	            v = Math.floor(Math.random() * 0x7fffffff);
	        }
	        this.x = v = 1812433253 * (v ^ (v >> 30));
	        this.y = v = 1812433253 * (v ^ (v >> 30)) + 1;
	        this.z = v = 1812433253 * (v ^ (v >> 30)) + 2;
	        this.w = v = 1812433253 * (v ^ (v >> 30)) + 3;
	        return this;
	    };
	    Random.prototype.getInt = function () {
	        var t = this.x ^ (this.x << 11);
	        this.x = this.y;
	        this.y = this.z;
	        this.z = this.w;
	        this.w = (this.w ^ (this.w >> 19)) ^ (t ^ (t >> 8));
	        return this.w;
	    };
	    Random.prototype.get01 = function () {
	        return this.getInt() / 0x7fffffff;
	    };
	    Random.prototype.getForParam = function () {
	        return this.get01() + 0.5;
	    };
	    return Random;
	}());


/***/ }
/******/ ])
});
;