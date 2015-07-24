/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//implements the paddle laser object

//A hitscan laser... Find the hit object before creating the laser line

//highly inefficient, needs a refactor
PaddleLaser = function(game,x,y) {
	var raycastLine = new Phaser.Line().fromAngle(x,y, -Math.PI/2, game.height); //beyond the top
	this.closest = null;
	game.canvas.playState.invaders.forEachAlive(this.castIntersect, this, raycastLine);
	var distance;
	if (this.closest) {
		distance = y - this.closest.y - this.closest.height/2;
	}
	else {
		distance = raycastLine.length;
	}
	var points = [];
	points.push(new Phaser.Point(0, 0));
	for (var i = PaddleLaser.const.PT_DIST; i < distance; i+= PaddleLaser.const.PT_DIST) {
		points.push(new Phaser.Point(game.rnd.between(-PaddleLaser.const.ROPE_SPREAD, PaddleLaser.const.ROPE_SPREAD),-i));
	}
	points.push(new Phaser.Point(0, -distance));
	Phaser.Rope.call(this,game,x,y, 'pLaser', 0, points);
	//this.animations.add('idle', [0,1,2], 12, true);
	//this.animations.play('idle');
	this.lifespan = PaddleLaser.const.LIFETIME;
	game.add.existing(this);
};

PaddleLaser.prototype = Object.create(Phaser.Rope.prototype);
PaddleLaser.prototype.constructor = PaddleLaser;

PaddleLaser.const = {PT_DIST: 10, ROPE_SPREAD: 10, LIFETIME: 150};

PaddleLaser.prototype.castIntersect = function(child, raycast) {
	if (this.closest && this.closest.y >= child.y) return;
	var perpLine = new Phaser.Line(child.x - child.width/2, child.y + child.height/2, child.x + child.width/2, child.y + child.height/2);
	if (raycast.intersects(perpLine)) {
		this.closest = child;
		return;
	}
};

PaddleLaser.prototype.update = function() {
	if (this.closest) {
		this.closest.checkDestroy();
		this.closest = null;
	}
};