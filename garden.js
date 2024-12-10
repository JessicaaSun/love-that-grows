function Vector(a, b) {
  this.x = a;
  this.y = b;
}
Vector.prototype = {
  rotate: function (b) {
    var a = this.x;
    var c = this.y;
    this.x = Math.cos(b) * a - Math.sin(b) * c;
    this.y = Math.sin(b) * a + Math.cos(b) * c;
    return this;
  },
  mult: function (a) {
    this.x *= a;
    this.y *= a;
    return this;
  },
  clone: function () {
    return new Vector(this.x, this.y);
  },
  length: function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  },
  subtract: function (a) {
    this.x -= a.x;
    this.y -= a.y;
    return this;
  },
  set: function (a, b) {
    this.x = a;
    this.y = b;
    return this;
  },
};
function Petal(a, f, b, e, c, d) {
  this.stretchA = a;
  this.stretchB = f;
  this.startAngle = b;
  this.angle = e;
  this.bloom = d;
  this.growFactor = c;
  this.r = 1;
  this.isfinished = false;
}
Petal.prototype = {
  draw: function () {
    var ctx = this.bloom.garden.ctx;
    var v1, v2, v3, v4;
    v1 = new Vector(0, this.r).rotate(Garden.degrad(this.startAngle));
    v2 = v1.clone().rotate(Garden.degrad(this.angle));
    v3 = v1.clone().mult(this.stretchA); // Stretch along X-axis
    v4 = v2.clone().mult(this.stretchB); // Stretch along Y-axis
    ctx.strokeStyle = this.bloom.c;
    ctx.beginPath();
    ctx.moveTo(v1.x, v1.y);
    ctx.bezierCurveTo(v3.x, v3.y, v4.x, v4.y, v2.x, v2.y); // Petal shape control
    ctx.stroke();
  },
  render: function () {
    if (this.r <= this.bloom.r) {
      this.r += this.growFactor;
      this.draw();
    } else {
      this.isfinished = true;
    }
  },
};
function Bloom(e, d, f, a, b) {
  this.p = e; // Position of the bloom (Vector)
  this.r = d; // Radius of the bloom
  this.c = f; // Color of the bloom
  this.pc = a; // Petal count
  this.petals = [];
  this.garden = b; // The garden (canvas context)
  this.init();
  this.garden.addBloom(this);
}

Bloom.prototype = {
  draw: function () {
    var c,
      b = true;
    this.garden.ctx.save();
    this.garden.ctx.translate(this.p.x, this.p.y);

    // Boundary check before drawing
    if (
      this.p.x - this.r < 0 ||
      this.p.x + this.r > this.garden.element.width ||
      this.p.y - this.r < 0 ||
      this.p.y + this.r > this.garden.element.height
    ) {
      // If out of bounds, keep the bloom inside the canvas
      this.p.x = Math.min(
        Math.max(this.p.x, this.r),
        this.garden.element.width - this.r
      );
      this.p.y = Math.min(
        Math.max(this.p.y, this.r),
        this.garden.element.height - this.r
      );
    }

    // Render each petal
    for (var a = 0; a < this.petals.length; a++) {
      c = this.petals[a];
      c.render();
      b *= c.isfinished;
    }

    this.garden.ctx.restore();

    // If all petals are finished, remove the bloom
    if (b == true) {
      this.garden.removeBloom(this);
    }
  },

  init: function () {
    var c = 360 / this.pc;
    var b = Garden.randomInt(0, 90);
    for (var a = 0; a < this.pc; a++) {
      this.petals.push(
        new Petal(
          Garden.random(
            Garden.options.petalStretch.min,
            Garden.options.petalStretch.max
          ),
          Garden.random(
            Garden.options.petalStretch.min,
            Garden.options.petalStretch.max
          ),
          b + a * c,
          c,
          Garden.random(
            Garden.options.growFactor.min,
            Garden.options.growFactor.max
          ),
          this
        )
      );
    }
  },
};

function Garden(a, b) {
  this.blooms = [];
  this.element = b;
  this.ctx = a;
}
Garden.prototype = {
  render: function () {
    for (var a = 0; a < this.blooms.length; a++) {
      this.blooms[a].draw();
    }
  },
  addBloom: function (a) {
    this.blooms.push(a);
  },
  removeBloom: function (a) {
    var d;
    for (var c = 0; c < this.blooms.length; c++) {
      d = this.blooms[c];
      if (d === a) {
        this.blooms.splice(c, 1);
        return this;
      }
    }
  },
  createRandomBloom: function (a, b) {
    this.createBloom(
      a,
      b,
      Garden.randomInt(
        Garden.options.bloomRadius.min,
        Garden.options.bloomRadius.max
      ),
      Garden.randomrgba(
        Garden.options.color.rmin,
        Garden.options.color.rmax,
        Garden.options.color.gmin,
        Garden.options.color.gmax,
        Garden.options.color.bmin,
        Garden.options.color.bmax,
        Garden.options.color.opacity
      ),
      Garden.randomInt(
        Garden.options.petalCount.min,
        Garden.options.petalCount.max
      )
    );
  },
  createBloom: function (a, f, d, e, b) {
    new Bloom(new Vector(a, f), d, e, b, this);
  },
  clear: function () {
    this.blooms = [];
    this.ctx.clearRect(0, 0, this.element.width, this.element.height);
  },
};
Garden.options = {
  petalCount: { min: 8, max: 15 },
  petalStretch: { min: 0.1, max: 5 },
  growFactor: { min: 0.1, max: 2 },
  bloomRadius: { min: 8, max: 10 },
  density: 10,
  growSpeed: 1000 / 60,
  color: {
    rmin: 255, // Red min
    rmax: 255, // Red max
    gmin: 0, // Green min
    gmax: 128, // Green max
    bmin: 0, // Blue min
    bmax: 128, // Blue max
    opacity: 0.5, // Opacity of the petals
  },
  tanAngle: 60,
};
Garden.random = function (b, a) {
  return Math.random() * (a - b) + b;
};
Garden.randomInt = function (b, a) {
  return Math.floor(Math.random() * (a - b + 1)) + b;
};
Garden.circle = 2 * Math.PI;
Garden.degrad = function (a) {
  return (Garden.circle / 360) * a;
};
Garden.raddeg = function (a) {
  return (a / Garden.circle) * 360;
};
Garden.rgba = function (f, e, c, d) {
  return "rgba(" + f + "," + e + "," + c + "," + d + ")";
};
Garden.randomrgba = function (i, n, h, m, l, d, k) {
  var c = Math.round(Garden.random(i, n));
  var f = Math.round(Garden.random(h, m));
  var j = Math.round(Garden.random(l, d));
  var e = 5;
  if (Math.abs(c - f) <= e && Math.abs(f - j) <= e && Math.abs(j - c) <= e) {
    return Garden.rgba(i, n, h, m, l, d, k);
  } else {
    return Garden.rgba(c, f, j, k);
  }
};
