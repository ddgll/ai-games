class Rect {
  constructor (x, y, w, h) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
  }

  triangleCollide (x, y, size) {
    const x1 = x - size/2,
          y1 = y - size/2,
          x2 = x + size/2,
          y2 = y - size/2,
          x3 = x,
          y3 = y + size / 2
    return this.pointCollide(x1, y1) || 
            this.pointCollide(x2, y2) || 
            this.pointCollide(x3, y3)
  }

  pointCollide (pointX, pointY) {
    const rx = this.x,
          ry = this.y,
          rw = this.w, 
          rh = this.h
    if (pointX >= rx &&         // right of the left edge AND
        pointX <= rx + rw &&    // left of the right edge AND
        pointY >= ry &&         // below the top AND
        pointY <= ry + rh) {    // above the bottom
            return true
    }
    return false
  }

  circleCollide (cx, cy, diameter) {
    const rx = this.x,
          ry = this.y,
          rw = this.w, 
          rh = this.h 
    //2d
    // temporary variables to set edges for testing
    let testX = cx;
    let testY = cy;
  
    // which edge is closest?
    if (cx < rx) {
      testX = rx       // left edge
    } else if (cx > rx+rw) {
      testX = rx+rw 
    }   // right edge
    if (cy < ry){
      testY = ry       // top edge
    } else if (cy > ry+rh) {
      testY = ry+rh
    }   // bottom edge
    // // get distance from closest edges
    const distance = this.dist(cx,cy,testX,testY)
    // if the distance is less than the radius, collision!
    if (distance <= diameter) {
      return true
    }
    return false
  }

  lineCollide (x1, y1, x2, y2, calcIntersection) {
    const rx = this.x,
          ry = this.y,
          rw = this.w, 
          rh = this.h

    // check if the line has hit any of the rectangle's sides. uses the lineLineCollide function above
    var left, right, top, bottom, intersection;
  
    if(calcIntersection){
       left =   this.lineLineCollide(x1,y1,x2,y2, rx,ry,rx, ry+rh,true);
       right =  this.lineLineCollide(x1,y1,x2,y2, rx+rw,ry, rx+rw,ry+rh,true);
       top =    this.lineLineCollide(x1,y1,x2,y2, rx,ry, rx+rw,ry,true);
       bottom = this.lineLineCollide(x1,y1,x2,y2, rx,ry+rh, rx+rw,ry+rh,true);
       intersection = {
          "left" : left,
          "right" : right,
          "top" : top,
          "bottom" : bottom
      }
    }else{
      //return booleans
       left =   this.lineLineCollide(x1,y1,x2,y2, rx,ry,rx, ry+rh);
       right =  this.lineLineCollide(x1,y1,x2,y2, rx+rw,ry, rx+rw,ry+rh);
       top =    this.lineLineCollide(x1,y1,x2,y2, rx,ry, rx+rw,ry);
       bottom = this.lineLineCollide(x1,y1,x2,y2, rx,ry+rh, rx+rw,ry+rh);
    }
  
    // if ANY of the above are true, the line has hit the rectangle
    if (left || right || top || bottom) {
      if(calcIntersection){
        return intersection;
      }
      return true
    }
    return false
  }

  lineLineCollide (x1, y1, x2, y2, x3, y3, x4, y4,calcIntersection) {

    var intersection;
  
    // calculate the distance to intersection point
    var uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
    var uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
  
    // if uA and uB are between 0-1, lines are colliding
    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
  
      if(this._collideDebug || calcIntersection){
        // calc the point where the lines meet
        var intersectionX = x1 + (uA * (x2-x1));
        var intersectionY = y1 + (uA * (y2-y1));
      }
  
      if(this._collideDebug){
        this.ellipse(intersectionX,intersectionY,10,10);
      }
  
      if(calcIntersection){
        intersection = {
          "x":intersectionX,
          "y":intersectionY
        }
        return intersection;
      }else{
        return true;
      }
    }
    if(calcIntersection){
      intersection = {
        "x":false,
        "y":false
      }
      return intersection;
    }
    return false;
  }
  

  dist (x1, y1, x2, y2) {
    const sy = this.sqr(y2 - y1)
    const sx = this.sqr(x2 - x1)
    const d = Math.sqrt(sy + sx)
    return d
  }

  sqr (a) {
    const qr = a * a
    return qr
  }
}

class Bounds extends Rect {
  constructor (constants) {
    const bounds = {
      x1: { x: -(constants.VISION.WIDTH * constants.VISION.SIDE), y: -(constants.VISION.WIDTH * constants.VISION.TOP) },
      x2: { x: (constants.VISION.WIDTH * constants.VISION.SIDE), y: -(constants.VISION.WIDTH * constants.VISION.TOP) },
      x3: { x: (constants.VISION.WIDTH * constants.VISION.SIDE), y: (constants.VISION.WIDTH * constants.VISION.BOTTOM) },
      x4: { x: -(constants.VISION.WIDTH * constants.VISION.SIDE), y: (constants.VISION.WIDTH * constants.VISION.BOTTOM) },
      w: (constants.VISION.WIDTH * constants.VISION.SIDE * 2),
      h: ((constants.VISION.TOP + constants.VISION.BOTTOM) * constants.VISION.SIDE)
    }
    bounds.x1 = 
    super (bounds.x1.x, bounds.x1.y, bounds.w, bounds.h)
    this.constants = constants
    this.bounds = bounds
  }

  rotate(x, y, angle) {
    const cos = Math.cos(-angle),
        sin = Math.sin(-angle),
        nx = (cos * (x)) + (sin * (y)),
        ny = (cos * (y)) - (sin * (x));
    return { x: nx, y: ny };
  }

  getVision (objects) {
    let x, y, rect, index, vision = []
    for (let i = 0, l = 2 * this.constants.VISION.SIDE; i < l; i++) {
      x = this.x + i * this.constants.VISION.WIDTH
      for (let j = 0, ll = this.constants.VISION.TOP + this.constants.VISION.BOTTOM; j < ll; j++){
        y = this.y + j * this.constants.VISION.WIDTH
        rect = new Rect(x, y, this.constants.VISION.WIDTH, this.constants.VISION.WIDTH)
        index = vision.length
        vision.push(.1)
        objects.forEach((o) => {
          switch(o.type) {
            case 'bo':
            case 'p':
            case 'b':
            case 'a':
              if (rect.circleCollide(o.x, o.y, o.r)) vision[index] += o.p
              break;
            case 's':
              if (rect.triangleCollide(o.x, o.y, o.r)) vision[index] += o.p
              break;
            case 'w':
              if (rect.lineCollide(o.x1, o.y1, o.x2, o.y2)) vision[index] += o.p
              break;
          }
        })
        if (vision[index] > 1) vision[index] = 1
        if (vision[index] < 0) vision[index] = 0
      }
    }
    return vision
  }
}

if (typeof window === 'undefined') module.exports = Bounds
