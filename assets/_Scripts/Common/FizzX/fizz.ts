import { rect } from 'cc';
import Shapes from './shapes';

// Common functions

let tremove = (t, i) => t.slice(i, 1);
let sqrt = Math.sqrt;

// Partitioning

// Collisions

let screate = Shapes.creator;
let sarea = Shapes.area;
let sbounds = Shapes.bounds;
let stranslate = Shapes.translate;
let stest = Shapes.test;

const vy_min = -250;
const vy_max = 30;
const max_fixPosY = 8;

// Internal data

// list of shapes
let statics = [];
let dynamics = [];
let kinematics = [];

let bodyTypeToArray = [statics, dynamics, kinematics];

// global gravity
let gravityx = 0;
let gravityy = 0;
let gravity_normal = 0;
// positional correction
// treshold between 0.01&&0.1
//let  slop = 0.01
// correction between 0.2 to 0.8
//let  percentage = 0.2

// maximum velocity limit of moving shapes
let maxVelocity = 1000;
// broad phase partitioning
let partition = false;
// buffer reused in queries
let buffer = [];
// some stats
let nchecks = 0;

let quad = null;
//忽略贴墙的摩擦力
let ignore_up_drag = true;

// Internal functionality
export default class Fizz {
  static quad = null; //reference
  static shouldCollideCallback = null;
  static Shape: typeof Shapes = null;
  static init(shouldCollide, w, h) {
    this.shouldCollideCallback = shouldCollide;
    if (quad) {
      quad.clear();
    }
    if (w && h) quad = new Quadtree(rect(0, 0, w, h));
    Fizz.quad = quad;
    Fizz.Shape = Shapes;
  }

  static cleanup() {
    quad && quad.clear();
    statics.splice(0);
    dynamics.splice(0);
    kinematics.splice(0);
  }

  static set ignore_up_drag(b) {
    ignore_up_drag = b;
  }

  static statics = statics;
  static dynamics = dynamics;
  static kinematics = kinematics;
  // returns shape index&&its list
  static findShape(s) {
    let t = s.list;
    if (s.list == null) return -1;
    let idx = 0;
    let a = s.list.some((v, i) => {
      if (v == s) {
        idx = i;
        return true;
      }
      return false;
    });
    if (a) {
      return idx;
    }
    //------------------------------------------------------------------------------//
    // for( let  i  = 0 ;  i <t .length ;  i ++){
    //   if(t[i] == s){
    //     return i, t
    //   }
    // }
    //------------------------------------------------------------------------------//
  }

  // repartition moved||modified shapes
  static insertPartition(s) {
    if (partition) {
      // reinsert in the quadtree
      s.rect = sbounds(s);
      quad.insert(s);
    }
  }

  static addShapeType(proxy, bodyType, t, ...params) {
    let func = screate[t];
    if (func) {
      let s = func(proxy, ...params);
      s.list = bodyTypeToArray[bodyType];
      // list[#list + 1] = s
      s.list.push(s);
      this.insertPartition(s);
      return s;
    }
    // console.assert(func, "invalid shape type")
  }

  // changes the position of a shape
  static changePosition(a, dx, dy) {
    if (dx == 0 && dy == 0) return;
    if (quad) {
      if (a.rect) quad.removeObject(a);
    }
    stranslate(a, dx, dy);
    this.insertPartition(a);
  }

  // resolves collisions
  static solveCollision(a, b, nx, ny, pen) {
    // shape a must be dynamic
    //assert(a.list == dynamics, "collision pair error")
    // relative velocity
    let avx = a.xv;
    let avy = a.yv;
    let bvx = b.xv || 0;
    let bvy = b.yv || 0;
    let vx = avx - bvx;
    let vy = avy - bvy;

    /////----------------------------add by rw for non-slip slope--------------------------------------------------//
    if (!b.slip && b.shape == 'l' && Math.abs(nx) != 1) {
      //--standing on the slope
      nx = 0;
      ny = ny > 0 ? 1 : -1;
    }
    /////------------------------------------------------------------------------------//

    // penetration component
    // dot product of the velocity&&collision normal
    let ps = vx * nx + vy * ny;
    // objects moving apart?
    if (ps > 0) {
      return;
    }

    let sx = nx * pen,
      sy = ny * pen;
    //向上跳落到oneWay Platform 如果位移过大，则不要落地
    if (gravityy != 0) {
      if (sy > max_fixPosY && vy < vy_max && vy > vy_min) return;
      //解决被2个方块卡在中间的问题
      if (nx != 0 && vx != 0 && (vy == 0 || vy == gravity_normal)) {
        let offset = a.y - a.hh - (b.y + b.hh);
        if (offset > -1 && offset < 1) {
          avy = 1;
          vy = 1;
          sy = Math.abs(offset);
          sx = -Math.sign(sx);
        }
      }
    }
    if (a.response && b.response) {
      // restitution [1-2]
      // r = max(r1, r2)
      let r = a.bounce;
      let r2 = b.bounce;
      if (r2 != null && r2 > r) {
        r = r2;
      }
      ps = ps * (r + 1);

      // tangent component
      let ts = vx * ny - vy * nx;
      // friction [0-1]
      // r = r/(1/mass1 + 1/mass2)
      let f = a.friction;
      let f2 = b.friction;
      if (f2 != null && f2 < f) {
        f = f2;
      }
      ts = ts * f;

      // coulomb's law (optional)
      // clamps the tangent component so that
      // it doesn't exceed the separation component
      if (ts < 0) {
        if (ts < ps) {
          ts = ps;
        }
      } else if (-ts < ps) {
        ts = -ps;
      }

      // integration
      let jx = nx * ps + ny * ts;
      let jy = ny * ps - nx * ts;
      // impulse
      let ma = a.imass;
      let mb = b.imass || 0;
      let mc = ma + mb;
      jx = jx / mc;
      jy = jy / mc;

      // adjust the velocity of shape a
      a.xv = avx - jx * ma;
      if (ignore_up_drag) {
        if (jy < 0) a.yv = avy - jy * ma;
        else if (nx == 0 && ny == -1) a.yv = avy - jy * ma * 0.3;
      } else {
        a.yv = avy - jy * ma;
      }
      if (b.list == dynamics) {
        // adjust the velocity of shape b
        b.xv = bvx + jx * mb;
        b.yv = bvy + jy * mb;
        /**[[
                    // positional correction (wip)
                    if(pen > slop){
                      let  pc = (pen - slop)/mc*percentage
                      let  pcA = pc*ma
                      let  pcB = pc*mb
                      let  sx, sy = -nx*pcB, -ny*pcB
                      // store the separation for shape b
                      b.sx = b.sx + sx
                      b.sy = b.sy + sy
                      changePosition(b, sx, sy)
                      //pen = pen*pcA
                      pen = pcA
                    }
                    //]] **/
      }
      // separation
    }
    // store the separation for shape a
    a.sx = a.sx + sx;
    a.sy = a.sy + sy;
    // separate the pair by moving shape a
    this.changePosition(a, sx, sy);
  }

  static checkKinematicCollision(a, b, dt) {
    let [nx, ny, pen] = stest(a, b, dt);
    if (!pen) {
      return [];
    }
    if (a.onCollide) {
      a.onCollide(b, nx, ny, pen);
    }
    if (b.onCollide) {
      b.onCollide(a, -nx, -ny, pen);
    }
  }

  // check&&report collisions
  static collision(a, b, dt) {
    // track the number of collision checks (optional)
    nchecks = nchecks + 1;
    let [nx, ny, pen] = stest(a, b, dt);
    if (!pen) {
      return [];
    }
    //assert(pen > 0, "collision depth error")
    // collision callbacks
    let ra = true;
    let rb = true;
    if (a.onCollide) {
      ra = a.onCollide(b, nx, ny, pen);
    }
    if (b.onCollide) {
      rb = b.onCollide(a, -nx, -ny, pen);
    }

    if (gravityy != 0 && ny == 1 && !b.isTrigger) {
      a.fall_y = a.y;
      a.isLand = true;
      a.isFalling = false;
    }
    // ignore collision if either callback returned false
    if (ra == true && rb == true) {
      this.solveCollision(a, b, nx, ny, pen);
    }
  }

  // Public functionality

  // updates the simulation
  static update(dt, it?) {
    // for debug
    it = it || 1;
    // track the number of collision checks (optional)
    nchecks = 0;

    // update velocity vectors
    let xg = gravityx * dt;
    let yg = gravityy * dt;
    let mv2 = maxVelocity * maxVelocity;
    for (let i = 0; i < dynamics.length; i++) {
      let d = dynamics[i];
      // damping
      let c = 1 + d.damping * dt;
      let xv = d.xv / c;
      let yv = d.yv / c;
      // gravity
      let g = d.gravity;
      xv = xv + xg * g;
      yv = yv + yg * g;
      // xv = xv + d.xa * dt;
      // yv = yv + d.ya * dt;
      // threshold
      let v2 = xv * xv + yv * yv;
      if (v2 > mv2) {
        let n = maxVelocity / sqrt(v2);
        xv = xv * n;
        yv = yv * n;
      }
      d.xv = xv;
      d.yv = yv;
      // reset separation
      d.sx = 0;
      d.sy = 0;

      if (d.lastyv > 0 && yv <= 0) {
        d.fall_y = d.y;
        d.isFalling = true;
      } else if (d.lastyv < 0 && yv > 0) {
        d.isLand = false;
      }
      if (!d.isFalling && yv < yg) {
        d.isFalling = true;
      }
      d.lastyv = yv;
      // d.xa = 0
      // d.ya = 0;
    }

    // iterations
    dt = dt / it;
    for (let j = 0; j < it; j++) {
      // move kinematic shapes
      for (let i = 0; i < kinematics.length; i++) {
        let k = kinematics[i];
        if (k.active == false) continue;
        Fizz.changePosition(k, k.xv * dt, k.yv * dt);
        // let items = quad.retrieve(k.rect)
        // items.forEach(v => {
        //     if (this.shouldCollideCallback == null || this.shouldCollideCallback(k, v)) {
        //         if (v != k) {
        //             Fizz.checkKinematicCollision(k, v, dt)
        //         }
        //     }
        // })
      }
      // move dynamic shapes
      if (partition) {
        // quadtree partitioning
        for (let i = 0; i < dynamics.length; i++) {
          let d = dynamics[i];
          if (d.active == false) continue;

          // move to new position
          Fizz.changePosition(d, d.xv * dt, d.yv * dt);
          // check&&resolve collisions
          // query for potentially colliding shapes
          // let bounds = sbounds(d)
          let items = quad.retrieve(d.rect);

          for (let i = 0; i < items.length; i++) {
            let v = items[i];
            if (
              this.shouldCollideCallback == null ||
              this.shouldCollideCallback(d, v)
            ) {
              if (v != d) {
                Fizz.collision(d, v, dt);
              }
            }
          }
        }
      } else {
        // brute force
        for (let i = 0; i < dynamics.length; i++) {
          let d = dynamics[i];
          // move to new position
          Fizz.changePosition(d, d.xv * dt, d.yv * dt);
          // check&&resolve collisions
          for (let j = 0; j < statics.length; j++) {
            Fizz.collision(d, statics[j], dt);
          }
          for (let j = 0; j < kinematics.length; j++) {
            Fizz.collision(d, kinematics[j], dt);
          }
          // note: we check each collision pair only once
          for (let j = i + 1; j < dynamics.length; j++) {
            let d2 = dynamics[j];
            if (d == d2) continue;
            if (
              this.shouldCollideCallback == null ||
              this.shouldCollideCallback(d, d2)
            ) {
              Fizz.collision(d, d2, dt);
            }
          }
        }
      }
    }
  }

  // gets the global gravity
  static getGravity() {
    return { x: gravityx, y: gravityy };
  }

  // sets the global gravity
  static setGravity(x, y) {
    gravityx = x;
    gravityy = y;
    gravity_normal = y * 0.016;
  }

  // static shapes do not move||respond to collisions
  static addStatic(proxy, shape, ...params) {
    return Fizz.addShapeType(proxy, 0, shape, ...params);
  }

  // kinematic shapes move only when assigned a velocity
  static addKinematic(proxy, shape, ...params) {
    let s = Fizz.addShapeType(proxy, 1, shape, ...params);
    (s.xv = 0), (s.yv = 0);
    return s;
  }

  // dynamic shapes are affected by gravity&&collisions
  static addDynamic(proxy, shape, ...params) {
    let s = Fizz.addShapeType(proxy, 2, shape, ...params);
    s.friction = 1;
    s.bounce = 0;
    s.damping = 0;
    s.gravity = 1;
    (s.xv = 0), (s.yv = 0);
    (s.sx = 0), (s.sy = 0);
    this.setMass(s, 1);
    return s;
  }

  // adjusts mass
  static setDensity(s, d) {
    let m = sarea(s) * d;
    this.setMass(s, m);
  }

  static setMass(s, m) {
    s.mass = m;
    let im = 0;
    if (m > 0) {
      im = 1 / m;
    }
    s.imass = im;
  }

  // removes shape from its list
  static removeShape(s) {
    let i = Fizz.findShape(s);
    if (i >= 0) {
      // tremove(t, i-1)
      s.list.splice(i, 1);
      s.list = null;
      if (partition) {
        quad.removeObject(s);
      }
    }
  }

  // gets the position of a shape (starting point for line shapes)
  static getPosition(a) {
    return a.x, a.y;
  }

  // sets the position of a shape
  static setPosition(a, x, y) {
    Fizz.changePosition(a, x - a.x, y - a.y);
  }

  static syncPosition(a) {
    this.setPosition(a, a.x, a.y);
  }

  // gets the velocity of a shape
  static getVelocity(a) {
    return a.xv || 0, a.yv || 0;
  }

  // sets the velocity of a shape
  static setVelocity(a, xv, yv) {
    a.xv = xv;
    a.yv = yv;
  }

  // gets the separation of a shape for the last frame
  static getDisplacement(a) {
    return a.sx || 0, a.sy || 0;
  }

  // sets the partitioning method
  static setPartition(p) {
    // console.assert(p == true || p == false, "invalid partitioning method")
    partition = p;
  }

  // gets the partitioning method
  static getPartition() {
    return partition;
  }

  // estimate the number of collision checks
  static getCollisionCount() {
    return nchecks;
  }

  // Public access to some tables
}

// fizz.repartition = repartition
// fizz.statics = statics
// fizz.dynamics = dynamics
// fizz.kinematics = kinematics
