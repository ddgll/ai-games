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

  circleCollide (cx, cy, diameter, short) {
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
    if (short && distance <= diameter) return true
    if (!short && distance <= (diameter / 2)) return true
    
    return false
  }

  rectCollide (x2, y2, w2, h2) {
    const x = this.x,
          y = this.y,
          w = this.w, 
          h = this.h
    //2d
    //add in a thing to detect rectMode CENTER
    if (x + w >= x2 &&    // r1 right edge past r2 left
        x <= x2 + w2 &&    // r1 left edge past r2 right
        y + h >= y2 &&    // r1 top edge past r2 bottom
        y <= y2 + h2) {    // r1 bottom edge past r2 top
          return true;
    }
    return false;
  }

  polyCollide (vertices) {
    const rx = this.x,
          ry = this.y,
          rw = this.w, 
          rh = this.h
  
    // go through each of the vertices, plus the next vertex in the list
    var next = 0
    for (var current=0; current<vertices.length; current++) {
  
      // get next vertex in list if we've hit the end, wrap around to 0
      next = current+1;
      if (next == vertices.length) next = 0;
  
      // get the PVectors at our current position this makes our if statement a little cleaner
      var vc = vertices[current];    // c for "current"
      var vn = vertices[next];       // n for "next"
  
      // check against all four sides of the rectangle
      var collision = this.lineCollide(vc.x,vc.y,vn.x,vn.y);
      if (collision) return true
    }
  
    return false;
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

  between(min, p, max){
    let result = false
  
    if ( min < max ){
      if ( p > min && p < max ){
        result = true;
      }
    }
  
    if ( min > max ){
      if ( p > max && p < min){
        result = true
      }
    }
  
    if ( p == min || p == max ){
      result = true
    }
  
    return result
  }
  
  pointInRectangle (x, y) {
    return (this.between(this.x, x, this.x + this.w) && this.between(this.y, y, this.y + this.h))
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

  getVision (objects, limits) {
    let x, y, rect, short, vision = []
    for (let i = 0, l = 2 * this.constants.VISION.SIDE; i < l; i++) {
      x = -(this.constants.VISION.SIDE * this.constants.VISION.WIDTH) + i * this.constants.VISION.WIDTH
      if (typeof vision[i]) vision.push([])
      for (let j = 0, ll = this.constants.VISION.TOP + this.constants.VISION.BOTTOM; j < ll; j++){
        y = -(this.constants.VISION.TOP * this.constants.VISION.WIDTH) + j * this.constants.VISION.WIDTH
        rect = new Rect(x, y, this.constants.VISION.WIDTH, this.constants.VISION.WIDTH)
        vision[i].push(0)
        short = true
        objects.forEach((o) => {
          switch(o.type) {
            case 'p':
              short = false
              if (rect.circleCollide(o.x, o.y, o.r, short)) vision[i][j] = 1 // += o.p
              break;
            case 'b':
            case 'bo':
            case 'a':
              if (rect.circleCollide(o.x, o.y, o.r, short)) vision[i][j] = 0.5 // += o.p
              break;
            case 's':
              if (rect.triangleCollide(o.x, o.y, o.r)) vision[i][j] = 0.5 // += o.p
              break;
            case 'w':
              if (rect.polyCollide(o.vertices)) vision[i][j] = 0.5
              // if (!limitsRect.rectCollide(rect.x, rect.y, rect.w, rect.h)) vision[i][j] = 1
              break;
          }
        })
        // if (vision[i][j] < 0) vision[i][j] = 0
      }
    }
    // console.log(vision)
    return vision
  }
}

if (typeof window === 'undefined') module.exports = Bounds
