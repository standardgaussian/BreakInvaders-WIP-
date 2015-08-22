//Ball

Ball = function(game, x,y, key, frame) {
	Phaser.Sprite.apply(this, arguments);
	game.physics.p2.enable(this);
	this.body.setCircle(Ball.const.BALL_RADIUS);
	this.body.collideWorldBounds = true;
	this.body.setCollisionGroup(game.const.COL_BALL);
	this.checkWorldBounds = true;
	//this.outOfBoundsKill = true;
	this.body.collides([game.const.COL_BALL,game.const.COL_PADDLE]);
	this.body.collides(game.const.COL_INVADER, Ball.ballKill, this);
	this.body.collides(game.physics.p2.boundsCollisionGroup, Ball.checkKill, this);
	this.body.collides(game.const.COL_LASER, Laser.convertLaser, this);
	this.ballSpeed = Ball.const.BALL_SPEED;
	//this.filters = [game.filters.colorMatrix];
	
	this.body.onBeginContact.add(function() {this.game.sound.play('bounce1')}, this);
	this.smoothed = false;
	this.bounceEmitter = this.game.add.emitter(this.body.x,this.body.y,8);
	this.bounceEmitter.makeParticles('bounceParticles', [0,1,2]);
	this.bounceEmitter.gravity = 0;
	this.bounceEmitter.setScale(1, 2, 1, 2, 0);
	this.bounceEmitter.lifespan = 250;
	this.bounceEmitter.setAlpha(0.8,0.4, 250, Phaser.Easing.Linear.None);
	this.body.onBeginContact.add(this.bounceCandy, this);
	game.add.existing(this);
	return this;
};

Ball.prototype = Object.create(Phaser.Sprite.prototype);
Ball.prototype.constructor = Ball;
Ball.ballTexture = null;
Ball.fireTexture = null;
Ball.const = {BALL_RADIUS : 7, BALL_COLOR : '#9eff00', BALL_SPEED: 350, START_ANGLE: 1, X_INFLUENCE : 300, SPEED_UP: 5, SPEED_MAX: 600,
			  FIRE_COLOR : '#ff2929',
			  GRAV_COLOR: '#ff47b4',
			  PARTICLE_SPEED: 150, PARTICLE_SPEED_SPREAD: 10, BALL_FAST: 420,
	};

Ball.makeBall = function(game,paddle,x,y) {
	if (Ball.ballTexture == null) {	//refactor later to make anonymous function that sets texture
		var ballTexture = game.make.bitmapData(this.const.BALL_RADIUS*2, this.const.BALL_RADIUS*2);
		ballTexture.circle(ballTexture.width/2, ballTexture.height/2, this.const.BALL_RADIUS, this.const.BALL_COLOR);
		Ball.ballTexture = ballTexture;
	}
	if (paddle) {
		return new Ball(game,paddle.position.x + paddle.width/2, paddle.position.y - Ball.ballTexture.height, Ball.ballTexture);
	}
	return new Ball(game, x,y, Ball.ballTexture);
	
		
};

Ball.prototype.bounceCandy = function(body2, pBody2, shapeThis, shapeThat, contactEq) {
	var contactVector;
	if (contactEq[0].bodyA == this.body.data) {
		contactVector = contactEq[0].contactPointA;
	}
	else if (contactEq[0].bodyB == this.body.data) {
		contactVector = contactEq[0].contactPointB;
	}
	else {
		console.log("ERROR!");
		return;
	}
	var angle = Math.atan2(contactVector[1], (-1)*contactVector[0]);
	var adjust = this.game.rnd.realInRange(Math.PI/3, 3*Math.PI/4)*(Phaser.Utils.chanceRoll() ? 1: -1);
	this.bounceEmitter.at(this);
	var numEmit = this.ballSpeed < Ball.const.BALL_FAST ? 4 : 8;
	//this.bounceEmitter.emitX += this.game.physics.p2.mpxi(contactVector[0]);
	//this.bounceEmitter.emitY += this.game.physics.p2.mpxi(contactVector[1]);
	for (var i = 0; i < numEmit; i++) {
		var adjust = angle + this.game.rnd.realInRange(Math.PI/4, Math.PI/3)*(i % 2 == 0 ? 1 : -1);
		this.bounceEmitter.setXSpeed((-1)*Ball.const.PARTICLE_SPEED*Math.cos(adjust) - 10, (-1)*Ball.const.PARTICLE_SPEED*Math.cos(adjust) + 10);
		this.bounceEmitter.setYSpeed(Ball.const.PARTICLE_SPEED*Math.sin(adjust) - 10, Ball.const.PARTICLE_SPEED*Math.sin(adjust) + 10);
		this.bounceEmitter.emitParticle();
	}
};

Ball.prototype.update = function() {
	if (this.held) {
		this.body.x = this.heldBy.body.x + this.width/4;
		this.body.y = this.heldBy.body.y - this.height/2 - 3;
	}
	if (this.getSpeed() != this.ballSpeed) {
		this.speedNorm();	
	}
};

Ball.prototype.getSpeed = function() {
	var dx = this.body.velocity.x;
	var dy = this.body.velocity.y;
	return Math.sqrt(dx * dx + dy * dy);	
}

Ball.prototype.speedNorm = function() {
	var angle = Math.atan2(this.body.velocity.y, this.body.velocity.x);
	this.body.velocity.y = this.ballSpeed*Math.sin(angle);
	this.body.velocity.x = this.ballSpeed*Math.cos(angle);
};

Ball.prototype.listenTo = function(obj) {
	if (obj instanceof Director) {
		obj.events.onNewWave.add(this.speedReset, this);	
	}
};

Ball.prototype.speedReset = function() {
	this.ballSpeed = Ball.const.BALL_SPEED;
		
};

Ball.prototype.speedUp = function(plus) {
	if (typeof plus === 'undefined') { plus = Ball.const.SPEED_UP};
	this.ballSpeed += plus;
};

Ball.prototype.revertNorm = function() {
	this.loadTexture(Ball.ballTexture);
	this.body.createGroupCallback(this.game.const.COL_INVADER, Ball.ballKill,this);
	this.update = Ball.prototype.update();
	this.pEmitter = null;
	
}

Ball.ballKill = function(body1, body2, shape1, shape2) {
	if (body2.sprite) {
		if (body2.sprite.checkDestroy(this, body1, body2, shape1, shape2)) {
			this.speedUp();
		}
	}
};

Ball.checkKill = function(ball, worldBound) {
	if (worldBound == this.game.physics.p2.walls.bottom) {
		//kill condition
		//this.game.state.start("boot");
	}
	//check "dead angle" 
	var angle = Math.atan2(this.body.velocity.y, this.body.velocity.x);
	if (Math.abs(angle) < this.game.const.MIN_ANGLE*Math.PI/180) {
		ball.velocity.x = Math.cos(this.game.const.MIN_ANGLE*Math.PI/180*Math.sign(angle))*ball.sprite.ballSpeed;
		ball.velocity.y = -Math.sin(this.game.const.MIN_ANGLE*Math.PI/180*Math.sign(angle))*ball.sprite.ballSpeed;
	}
};

Ball.ballKillFire = function(body1, body2) {
	//asplode
	var explode = new Explosion(this.game, body2.x, body2.y, 1000, 50);
	Ball.ballKill.apply(this, arguments);
};

Ball.fireParticles = function() {
	//disable the effect or do something different when the ball is held
	if (this.held) {
		return;
	}
	
	var range = 0;
	if (this.body.velocity.x > 0) {
		range = 10;
	}
	else { range = -10;};
	this.pEmitter.setXSpeed(-this.body.velocity.x/5 - range,-this.body.velocity.x/5 + range);
	if (this.body.velocity.y > 0) {
		range = 10;
	}
	else { range = -10;};
	this.pEmitter.setYSpeed(-this.body.velocity.y/5 - range,-this.body.velocity.y/5 + range);
	this.pEmitter.at(this);
	this.pEmitter.emitParticle();
	this.pEmitter.emitParticle();
}