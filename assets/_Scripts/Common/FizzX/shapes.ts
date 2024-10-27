// Common functions

let abs = Math.abs;
let sqrt = Math.sqrt;
let pi = Math.PI;
let _ret0_ = [];
let _ret3_ = [];
let _ret4_ = [];

let _id = 0;

class ShapeCreator {
  static rect(proxy, x, y, hw, hh) {
    // return { shape: "rect", x: x, y: y, hw: hw, hh: hh }
    proxy = proxy || {};
    proxy.shape = 'r'; //rect
    proxy.x = x;
    proxy.y = y;
    proxy.hw = hw;
    proxy.hh = hh;
    proxy.width = hw * 2;
    proxy.height = hh * 2;
    proxy._sid_ = _id++;
    return proxy;
  }

  // circles have a center position&&radius
  static circle(proxy, x, y, r) {
    proxy = proxy || {};
    proxy.x = x;
    proxy.y = y;
    proxy.r = r;
    proxy.shape = 'c'; // circle
    proxy._sid_ = _id++;
    return proxy;
  }

  // line shapes have a starting&&an ending point
  static line(proxy, x, y, x2, y2) {
    proxy = proxy || {};
    proxy.shape = 'l'; // line
    proxy.x = x;
    proxy.y = y;
    proxy.x2 = x2;
    proxy.y2 = y2;
    proxy._sid_ = _id++;
    return proxy;
  }
}

class r {
  static fastRect(r1, r2) {
    // vector between the centers of the rects
    let dx = r1[0] - r2[0],
      dy = r1[1] - r2[1];
    // absolute distance between the centers of the rects
    let adx = abs(dx),
      ady = abs(dy);
    // sum of the half-width extents
    let shw = r1[2] + r2[2],
      shh = r1[3] + r2[3];
    // no intersection if the distance between the rects
    // is greater than the sum of the half-width extents
    if (adx > shw || ady > shh) {
      return false;
    }
    return true;
  }

  static r(a, b, dt, fast) {
    // vector between the centers of the rects
    let dx = a.x - b.x,
      dy = a.y - b.y;
    // absolute distance between the centers of the rects
    let adx = abs(dx),
      ady = abs(dy);
    // sum of the half-width extents
    let shw = a.hw + b.hw,
      shh = a.hh + b.hh;
    // no intersection if the distance between the rects
    // is greater than the sum of the half-width extents
    if (adx >= shw || ady >= shh) {
      return _ret3_;
    }
    // shortest separation for both the x&&y axis
    let sx = shw - adx,
      sy = shh - ady;
    if (dx < 0) {
      sx = -sx;
    }
    if (dy < 0) {
      sy = -sy;
    }
    // /**
    // ignore separation for explicitly defined edges
    if (sx > 0) {
      if (a.left || b.right) {
        sx = 0;
      }
    } else if (sx < 0) {
      if (a.right || b.left) {
        sx = 0;
      }
    }
    if (sy > 0) {
      if (a.bottom || b.top) {
        sy = 0;
      }
    } else if (sy < 0) {
      if (a.top || b.bottom) {
        sy = 0;
      }
    }
    // **/

    // ignore the longer separation axis
    // when both sx&&sy are non-zero
    if (abs(sx) < abs(sy)) {
      if (sx != 0) sy = 0;
    } else {
      if (sy != 0) sx = 0;
    }
    // penetration depth equals
    // the length of the separation vector
    let pen = sqrt(sx * sx + sy * sy);
    // todo: dist == 0 when the two rects have the same position?
    if (pen > 0) {
      // collision normal is the normalized separation vector (sx,sy)
      return [sx / pen, sy / pen, pen];
    }
    return _ret0_;
  }
  static c(a, b, dt) {
    // vector between the centers of the two shapes
    let dx = a.x - b.x,
      dy = a.y - b.y;
    // absolute distance between the centers of the two shapes
    let adx = abs(dx),
      ady = abs(dy);
    // find the shortest separation&&the penetration depth
    let sx = 0,
      sy = 0;
    let pen = 0;
    let r = b.r;
    let hw = a.hw,
      hh = a.hh;
    if (adx <= hw || ady <= hh) {
      // rectangle edge collision
      // check the x&&y axis
      // no intersection if the distance between the shapes
      // is greater than the sum of the half-width extents&&the radius
      let hwr = hw + r;
      let hhr = hh + r;
      if (adx >= hwr || ady >= hhr) {
        return _ret3_;
      }
      // shortest separation vector
      sx = hwr - adx;
      sy = hhr - ady;
      // ignore the longer separation axis
      // when both sx&&sy are non-zero
      if (sx < sy) {
        if (sx != 0) {
          sy = 0;
        } else if (sy != 0) {
          sx = 0;
        }
      }
      // penetration depth
      pen = sqrt(sx * sx + sy * sy);
    } else {
      // rectangle corner collision
      // check the dx&&dy axis
      // find the nearest point on the rect to the circle center
      let px = 0;
      let py = 0;
      if (adx > hw) {
        px = adx - hw;
      }
      if (ady > hh) {
        py = ady - hh;
      }
      // no intersection if point is outside of the circle
      let dist = sqrt(px * px + py * py);
      if (dist >= r) {
        return _ret3_;
      }
      // penetration depth equals the circle radius
      // minus the distance of the nearest point vector
      pen = r - dist;
      // shortest separation vector
      sx = (px / dist) * pen;
      sy = (py / dist) * pen;
    }
    // correct the sign of the separation vector
    if (dx < 0) {
      sx = -sx;
    }
    if (dy < 0) {
      sy = -sy;
    }
    return [sx / pen, sy / pen, pen];
  }

  static l(a, b, dt) {
    // normalize segment
    let x1 = b.x,
      y1 = b.y;
    let x2 = b.x2,
      y2 = b.y2;
    let dx = x2 - x1,
      dy = y2 - y1;
    let d = sqrt(dx * dx + dy * dy);
    // segment is degenerate
    if (d == 0) {
      return _ret3_;
    }
    //let  ndx, ndy = dx/d, dy/d
    // rotate the segment axis
    // 90 degrees counter-clockwise&&normalize
    let nx = -dy / d,
      ny = dx / d;

    // test along the normal axis
    // project velocity
    let xv = a.xv || 0,
      yv = a.yv || 0;
    let v = -(nx * xv + ny * yv);
    // ignore collision for one-sided segments
    if (v <= 0) {
      return _ret3_;
    }
    // project segment origin point
    let o = nx * x2 + ny * y2;
    // project rect center
    let x = a.x,
      y = a.y;
    let c = nx * x + ny * y;
    // project rect extents
    let hw = a.hw,
      hh = a.hh;
    let h = abs(nx * hw) + abs(ny * hh);
    // find the penetration depth
    let pen = -(c - h - o);
    // entirely on one side of the segment?
    if (pen <= 0 || pen > h * 2) {
      return _ret3_;
    }
    /**
        // was it previously on one side of the segment?
        let  v2 = v * dt
        if (v2 > 0 && pen - v2 > 1) {
            return
        }
        */
    // segment axis elimination
    if (x1 > x2) {
      [x1, x2] = [x2, x1];
    }
    if (y1 > y2) {
      [y1, y2] = [y2, y1];
    }
    let cx = x + nx * pen;
    if (cx + hw < x1 || cx - hw > x2) {
      return _ret3_;
    }
    let cy = y + ny * pen;
    if (cy + hh < y1 || cy - hh > y2) {
      return _ret3_;
    }

    return [nx, ny, pen];
  }
}

class c {
  // tests two circles
  static c(a, b, dt) {
    // vector between the centers of the circles
    let dx = a.x - b.x,
      dy = a.y - b.y;
    // squared distance between the centers of the circles
    let distSq = dx * dx + dy * dy;
    // sum of the radii
    let radii = a.r + b.r;
    // no intersection if the distance between the circles
    // is greater than the sum of the radii
    if (distSq >= radii * radii) {
      return _ret3_;
    }
    // distance between the centers of the circles
    let dist = sqrt(distSq);
    // distance is zero when the two circles have the same position
    let nx = 0,
      ny = 1;
    if (dist > 0) {
      (nx = dx / dist), (ny = dy / dist);
    }
    // penetration depth equals the sum of the radii
    // minus the distance between the intersecting circles
    let pen = radii - dist;
    // collision normal is the normalized vector between the circles
    return [nx, ny, pen];
  }
  // tests circle versus line segment
  static l(a, b, dt) {
    // normalize segment
    let x1 = b.x,
      y1 = b.y;
    let x2 = b.x2,
      y2 = b.y2;
    let dx = x2 - x1,
      dy = y2 - y1;
    let d = sqrt(dx * dx + dy * dy);
    // segment is degenerate
    if (d == 0) {
      return _ret3_;
    }
    let ndx = dx / d,
      ndy = dy / d;
    // test along the segment axis
    let s1 = ndx * x1 + ndy * y1;
    let s2 = ndx * x2 + ndy * y2;
    let cx = a.x,
      cy = a.y;
    let c2 = ndx * cx + ndy * cy;
    if (c2 < s1 || c2 > s2) {
      return _ret3_;
    }
    // test along the normal axis
    // rotate the segment axis 90 degrees counter-clockwise
    let nx = -ndy,
      ny = ndx;
    // project velocity
    let xv = a.xv || 0,
      yv = a.yv || 0;
    let v = -(nx * xv + ny * yv); //*dt
    // ignore collision for one-sided segments
    if (v <= 0) {
      return _ret3_;
    }
    // project segment origin
    let o = nx * b.x + ny * b.y;
    // project circle center
    let c = nx * cx + ny * cy;
    // find separation
    let r = a.r;
    let pen = -(c - r - o);
    // entirely on one side of the segment?
    if (pen <= 0 || pen > r * 2) {
      return _ret3_;
    }
    /**
        // was it previously on one side of the segment?
        if (v * dt > 0 && pen - v * dt > 1) {
            return
        }
        */
    return [nx, ny, pen];
  }
}

class l {
  static l(a, b, dt) {
    // assert(false, "dynamic line collision unsupported")
  }
}

export default class Shapes {
  // Constructors
  // rects have a center position&&half-width/height extents
  static creator = ShapeCreator;
  // Tests
  static tests = { r, c, l };

  // tests two rectangles
  // tests rectangle versus circle
  static fasttest(a, b) {
    return r.fastRect(this.bounds(a), this.bounds(b));
  }

  // tests any two shapes
  // returns normalized separation vector&&penetration
  static test(a, b, dt) {
    let sa = a.shape;
    let sb = b.shape;
    // find collision function
    let test = Shapes.tests[sa][sb];
    let r = false;
    // swap the colliding shapes?
    let ashape = a,
      bshape = b;
    if (!test) {
      test = Shapes.tests[sb][sa];
      (ashape = b), (bshape = a);
      r = true;
    }
    let [x, y, p] = test(ashape, bshape, dt);
    // reverse direction of the collision normal
    if (r == true && x != null && y != null) {
      (x = -x), (y = -y);
    }
    return [x, y, p];
  }

  //- Utility functions

  static area(s) {
    let t = s.shape;
    let a = 0;
    if (t == 'r') {
      a = s.hw * s.hh * 4;
    } else if (t == 'c') {
      a = s.r * s.r * pi;
    }
    return a;
  }

  // returns center position&&half width/height extents for any shape
  static bounds(s) {
    let x = s.x,
      y = s.y;
    let hw, hh;
    let t = s.shape;
    if (t == 'r') {
      (hw = s.hw), (hh = s.hh);
    } else if (t == 'c') {
      (hw = s.r), (hh = s.r);
    } else if (t == 'l') {
      // figure out extents
      let x2 = s.x2,
        y2 = s.y2;
      if (x > x2) {
        [x, x2] = [x2, x];
      }
      if (y > y2) {
        [y, y2] = [y2, y];
      }
      hw = (x2 - x) / 2;
      hh = (y2 - y) / 2;
      // get the midpoint
      x = x + hw;
      y = y + hh;
    }
    return [x, y, hw, hh];
  }

  // changes the position of a shape
  static translate(a, dx, dy) {
    a.x = a.x + dx;
    a.y = a.y + dy;
    if (a.shape == 'l') {
      a.x2 = a.x2 + dx;
      a.y2 = a.y2 + dy;
    }
  }
}
