/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//implements the paddle laser object

//A hitscan laser... Find the hit object before creating the laser line

//highly inefficient, needs a refactor
PaddleLaser = function(game,x,y) {
	this.closest = null;
	this.hasKilled = false;
	this._distance = game.height;
	var points = [];
	points.push(new Phaser.Point(0, 0));
	for (var i = PaddleLaser.const.PT_DIST; i < this._distance; i+= PaddleLaser.const.PT_DIST) {
		points.push(new Phaser.Point(game.rnd.between(-PaddleLaser.const.ROPE_SPREAD, PaddleLaser.const.ROPE_SPREAD),-i));
	}
	points.push(new Phaser.Point(0, -this._distance));
	Phaser.Rope.call(this,game,x,y, 'pLaser', 0, points);
	
	//first iteration, refactor into function
	this.raycastLine = new Phaser.Line().fromAngle(this.worldPosition.x, this.worldPosition.y, -Math.PI/2, game.height); //beyond the top
	game.canvas.playState.invaders.forEachAlive(this.castIntersect, this, this.raycastLine);
	if (this.closest) {
		this._distance = y - this.closest.y;
	}
	//this.animations.add('idle', [0,1,2], 12, true);
	//this.animations.play('idle');
	this.lifespan = PaddleLaser.const.LIFETIME;
	this.updateAnimation = function() {
		if (this.hasKilled && this.killPoint) {
			for(var i = 0; i < this.points.length; i++) {
				this.points[i].x = (i/this.points.length)*this.toLocal(this.killPoint).x + this.game.rnd.between(-PaddleLaser.const.ROPE_SPREAD, PaddleLaser.const.ROPE_SPREAD);
				this.points[i].y = (i/this.points.length)*this.toLocal(this.killPoint).y;
				
			}
		}
		else {
			for(var i = 0; i < this.points.length; i++) {
				this.points[i].x = this.game.rnd.between(-PaddleLaser.const.ROPE_SPREAD, PaddleLaser.const.ROPE_SPREAD);
			}
		}
	};
	this.smoothed = false;
	this.game.sound.play('paddleLaserStrong');
	game.add.existing(this);
};

PaddleLaser.prototype = Object.create(Phaser.Rope.prototype);
PaddleLaser.prototype.constructor = PaddleLaser;

PaddleLaser.const = {PT_DIST: 10, ROPE_SPREAD: 10, LIFETIME: 150};

PaddleLaser.prototype.castIntersect = function(child, raycast) {
	if (this.closest && this.closest.y >= child.y) return;
	var perpLine = new Phaser.Line(child.x - child.width/2, child.y + child.height/2, child.x + child.width/2, child.y + child.height/2);
	//console.log("RAY ", this.raycastLine);
	//console.log("PERP ", perpLine);
	if (raycast.intersects(perpLine)) {
		this.closest = child;
		return;
	}
};

PaddleLaser.prototype.update = function() {
	if (this.hasKilled != true) {
		this.raycastLine.fromAngle(this.worldPosition.x, this.worldPosition.y, -Math.PI/2, this.game.height); //beyond the top
		this.game.canvas.playState.invaders.forEachAlive(this.castIntersect, this, this.raycastLine);
		if (this.closest) {
			this._distance = this.worldPosition.y - this.closest.y;
			this.killPoint = new Phaser.Point(this.closest.x, this.closest.y);
			console.log(this.killPoint);
			if (this.closest.checkDestroy()) {
				this.hasKilled = true;
				var explode = new Explosion(this.game, this.closest.x, this.closest.y, PaddleLaser.const.LIFETIME, 8);
			}
		}
	}
	Phaser.Rope.prototype.update.apply(this);
};