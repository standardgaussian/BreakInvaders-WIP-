/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//witch wisps
//should "collide" only to have wispy effects
Wisp = function(game,x,y, parent) {
	Phaser.Sprite.call(this, game,x,y,'wisp',0);
	this.witchParent = parent;
	this.anchor.x = this.anchor.y = 0.5;
	this.alpha = 0.7;
	this.effect = null;
	this.target = this.findTarget();
	this.animations.add('idle', [0,1], 2, true);
	this.animations.play('idle');
	game.add.existing(this);
	return this;
};

Wisp.prototype = Object.create(Phaser.Sprite.prototype);
Wisp.prototype.constructor = Wisp;

Wisp.const = {SPEED: 2, INV_HP_TINT : 0xFF050B};

Wisp.prototype.findTarget = function() {
	//equal weights for now
	var target = this.game.rnd.pick([this.game.ball, this.game.player, this.game.canvas.playState.invaders]);
	target = this.game.canvas.playState.invaders;	//debug for just this
	if (typeof target === 'Ball') {
		this.effect = this.chooseBallEffect(target);
	}
	else if (typeof target === 'Paddle') {
		this.effect = this.choosePaddleEffect(target);
	}
	//this won't work...
	else {
		target = this.invaderTarget(target);
		this.effect = this.chooseInvaderEffect(this.target);
	}
	return target;
};

Wisp.prototype.invaderTarget = function(invaders) {
	var target;
	invaders.remove(this.witchParent); //get rid of the parent now to avoid issues
	target = invaders.getRandom();
	if (target === null) return target;	//no invaders, just die
	//if the target is already possessed, don't do anything
	if (target.possessed == true) {
		return null;
	}
	return target;
};

Wisp.prototype.chooseBallEffect = function(ball) {
	
};

Wisp.prototype.choosePaddleEffect = function(paddle) {
	
};

Wisp.prototype.chooseInvaderEffect = function(invader) {
	return this.invaderHP;
	
};

//invader effects

Wisp.prototype.invaderHP = function() {
	this.health++;
	this.possessed = true;
	this.tint = Wisp.const.INV_HP_TINT;
};

Wisp.prototype.update = function() {
	if (this.target == null || typeof this.target === 'undefined' || !this.target.alive) {
		this.destroy();
		return;
	}
	console.log(this.target);
	console.log(this);
	if (this.overlap(this.target) && !this.possessTween) {
		this.possessTween = this.game.add.tween(this.scale);
		this.possessTween.to({x: 0.1, y:0.1}, 750);
		this.possessTween.onComplete.add(function() {this.effect.apply(this.target); this.destroy();}, this);
		this.possessTween.start();
	}
	var angle = Phaser.Point.angle(this, this.target);
	this.x += Wisp.const.SPEED*Math.cos(angle);
	this.y -= Wisp.const.SPEED*Math.sin(angle);
};