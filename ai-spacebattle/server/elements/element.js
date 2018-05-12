'use strict';

const CONSTANTS = require('../../statics/js/constants')

module.exports = class Element {
  constructor (id, x, y, options) {
    this.id = id
    this.x = x
    this.y = y
    this.xCenter = options && options.xCenter ? options.xCenter : (CONSTANTS.WIDTH / 2)
    this.yCenter = options && options.yCenter ? options.yCenter : (CONSTANTS.HEIGHT / 2)
    this.xMin = options && options.xMin ? options.xMin : 0
    this.yMin = options && options.yMin ? options.yMin : 0
    this.xMax = options && options.xMax ? options.xMax : this.xMin + CONSTANTS.WIDTH
    this.yMax = options && options.yMax ? options.yMax : this.yMin + CONSTANTS.HEIGHT

    this.mass = 0
    this.gravitations = []

    this.springs = []

    this.vel = { x: 0, y: 0 }

    this.rotation = 0
	}
	
	update () {
		this.handleGravitations()
		this.handleSprings()
	}

  setRotation (a) {
    this.rotation = a
  }

  addGravitation (p) {
		this.removeGravitation(p)
		this.gravitations.push(p)
	}

	removeGravitation (p) {
		for(let i = 0, l = this.gravitations.length; i < l; i += 1) {
			if(p === this.gravitations[i]) {
				this.gravitations.splice(i, 1)
				return
			}
		}
  }

  handleGravitations () {
		for(let i = 0, l = this.gravitations.length; i < l; i += 1) {
			this.gravitateTo(this.gravitations[i])
		}
  }

  gravitateTo (p) {
		

		if (p.repulse) {
			var dx = p.x - this.x,
					dy = p.y - this.y,
					distSQ = dx * dx + dy * dy,
					dist = Math.sqrt(distSQ),
					force = p.mass / distSQ,
					ax = dx / dist * force,
					ay = dy / dist * force;
			if (dist < CONSTANTS.PLANET_MAX_RADIUS / 1.5) {
				this.vel.x -= ax * Math.random();
				this.vel.y -= ay * Math.random();
			}
		} else {
			var dx = p.x - this.x,
					dy = p.y - this.y,
					distSQ = dx * dx + dy * dy,
					dist = Math.sqrt(distSQ),
					force = p.mass / distSQ,
					ax = dx / dist * force,
					ay = dy / dist * force;
			this.vel.x += ax;
			this.vel.y += ay;

			if (this.vel.x > CONSTANTS.SHIP_SPEED) this.vel.x = CONSTANTS.SHIP_SPEED
			if (this.vel.y > CONSTANTS.SHIP_SPEED) this.vel.y = CONSTANTS.SHIP_SPEED
		}
  }
  
  addSpring (point, k, length) {
		this.removeSpring(point);
		this.springs.push({
			point: point,
			k: k,
			length: length || 0
		})
	}

	removeSpring (point) {
		for(let i = 0, l = this.springs.length; i < l; i += 1) {
			if(point === this.springs[i].point) {
				this.springs.splice(i, 1)
				return
			}
		}
  }
  
  handleSprings () {
		for(let i = 0, l = this.springs.length, spring; i < l; i += 1) {
			spring = this.springs[i];
			this.springTo(spring.point, spring.k, spring.length);
		}
  }
  
  springTo (point, k, length) {
		var dx = point.x - this.x,
			dy = point.y - this.y,
			distance = Math.sqrt(dx * dx + dy * dy),
			springForce = (distance - length || 0) * k; 
		this.vel.x += dx / distance * springForce,
		this.vel.y += dy / distance * springForce;
	}
}