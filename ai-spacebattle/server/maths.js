'use strict';

const sqr = (a) => {
  const qr = a * a
  return qr
}

const distance = (x1, y1, x2, y2) => {
  const sy = sqr(y2 - y1)
  const sx = sqr(x2 - x1)
  const d = Math.sqrt(sy + sx)
  return d
}

const angleBetween = (x1, y1, x2, y2) => {
  const sy = y2 - y1
  const sx = x2 - x1
  const a = Math.atan2(sy, sx)
  return a
}

const fromAngle = (angle, length) => {
  const x = Math.cos(angle) * length
  const y = Math.sin(angle) * length
  return { x, y }
}

const randomInt = (min, max) => {
 return Math.floor(Math.random() * (max - min + 1)) + min;
}

const circlePointCollision = (x, y, xCircle, yCircle, radius) =>{
  return distance(x, y, xCircle, yCircle) < radius;
}

const collidePointTriangle = (px, py, x1, y1, x2, y2, x3, y3) => {

  // get the area of the triangle
  var areaOrig = Math.abs( (x2-x1)*(y3-y1) - (x3-x1)*(y2-y1) );

  // get the area of 3 triangles made between the point and the corners of the triangle
  var area1 =    Math.abs( (x1-px)*(y2-py) - (x2-px)*(y1-py) );
  var area2 =    Math.abs( (x2-px)*(y3-py) - (x3-px)*(y2-py) );
  var area3 =    Math.abs( (x3-px)*(y1-py) - (x1-px)*(y3-py) );

  // if the sum of the three areas equals the original, we're inside the triangle!
  if (area1 + area2 + area3 == areaOrig) {
    return true;
  }
  return false;
}

const collideTriangleTriangle = (px1, py1, px2, py2, px3, py3, x1, y1, x2, y2, x3, y3) => {
  return (collidePointTriangle(px1, py1, x1, y1, x2, y2, x3, y3) ||
          collidePointTriangle(px2, py2, x1, y1, x2, y2, x3, y3) ||
          collidePointTriangle(px3, py3, x1, y1, x2, y2, x3, y3))
}

const inRange = (value, min, max) => {
  return value >= Math.min(min, max) && value <= Math.max(min, max);
}

const map = (value, sourceMin, sourceMax, destMin, destMax) => {
  return lerp(norm(value, sourceMin, sourceMax), destMin, destMax);
}

const lerp = (norm, min, max) => {
  return (max - min) * norm + min;
}

const norm = (value, min, max) => {
  return (value - min) / (max - min);
}

const magnitude = (x, y, length) => {
  if (length) {
    const angle = angleBetween(0, 0, x, y)
    return { x: Math.cos(angle) * length, y: Math.sin(angle) * length }
  } else {
    return Math.sqrt(x * x + y * y) 
  }
}

const rotate = (cx, cy, x, y, angle) => {
  const cos = Math.cos(angle),
      sin = Math.sin(angle),
      nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
      ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
  return { x: nx, y: ny };
}

const uuid = () => {
  let d = new Date().getTime()
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = (d + Math.random()*16)%16 | 0
    d = Math.floor(d/16)
    return (c=='x' ? r : (r&0x3|0x8)).toString(16)
  })
  return uuid
}

module.exports = {
  sqr,
  distance,
  angleBetween,
  randomInt,
  circlePointCollision,
  collidePointTriangle,
  collideTriangleTriangle,
  inRange,
  lerp,
  fromAngle,
  map,
  norm,
  magnitude,
  uuid,
  rotate
}
