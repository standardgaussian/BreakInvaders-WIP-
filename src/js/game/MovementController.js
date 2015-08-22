/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//created by director, reference held in Invaders class

MovementController = function(game, director, invaders) {
	this.game = game;
	this.director = director;
	this.invaders = invaders;
	this.origin = new Phaser.Point(0,0);
	this.moveBounds = new Phaser.Point(16,16);
	this.lastMove = new Phaser.Point(0,0);
	this.currentMove = new Phaser.Point(0,0);
	
	
};

MovementController.prototype = Object.create(Object.prototype);
MovementController.prototype.constructor = MovementController;

MovementController.prototype.start = function(event) {
	if (event === undefined || event === null) { event = this.game.globalEvent };
	event.add(this.move, this);
	this.director.events.onNewWave.add(this.newWave, this);
};

MovementController.prototype.newWave = function() {
		this.lastMove.x = this.lastMove.y = 0;
};

//for now, move randomly
MovementController.prototype.getMove = function() {
	//random movements around the origin!
	this.currentMove = new Phaser.Point(this.game.rnd.between(0, this.moveBounds.x - 1), this.game.rnd.between(0, this.moveBounds.y - 1));
	if (this.lastMove.x > 0) {
		this.currentMove.x = -this.currentMove.x;
	}
	if (this.lastMove.y > 0) {
		this.currentMove.y = -this.currentMove.y;
	}	
	
	this.lastMove = this.currentMove;
	return this.currentMove;
	
};

MovementController.prototype.clamp = function(move, invader) {
	var toPos = Phaser.Point.add(new Phaser.Point(invader.body.x, invader.body.y), move);	//super expensive, replace call to new
	if (toPos.x - invader.orig.x + invader.body.width/2 >= this.moveBounds.x) {
		toPos.x = invader.orig.x + this.moveBounds.x - invader.body.width/2;
	}
	else if (toPos.x - invader.orig.x - invader.body.width/2 <= - this.moveBounds.x) {
		toPos.x = invader.orig.x - this.moveBounds.x + invader.body.width/2;
	}
	
	if (toPos.y - invader.orig.y + invader.body.height/2 >= this.moveBounds.y) {
		toPos.y = invader.orig.y + this.moveBounds.y - invader.body.height/2;
	}
	else if (toPos.y - invader.orig.y - invader.body.height/2 <= - this.moveBounds.y) {
		toPos.y = invader.orig.y - this.moveBounds.y + invader.body.height/2;
	}
	
	return toPos;
};

MovementController.prototype.move = function() {
	var nextMove = this.getMove();
	nextMove.x = 40;
	
	this.invaders.forEachAlive(this.moveInvader, this, nextMove);
};

MovementController.prototype.moveInvader = function(invader, nextMove) {
	if (invader.move !== undefined) {
		invader.move(nextMove);	//custom move functions
		return;
	}
	var toPos =  this.clamp(nextMove, invader);
	invader.body.x = toPos.x;
	invader.body.y = toPos.y;
	return;
};