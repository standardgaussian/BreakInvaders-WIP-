//Paddle

Paddle = function(game, x, y, key, frame) {
	Phaser.Sprite.apply(this,arguments);
	game.physics.p2.enable(this);
	this.body.setRectangle(150, 10, 0, 2.5);
	this.body.collideWorldBounds = true;
	this.body.motionState = Phaser.Physics.P2.Body.KINEMATIC;
	this.body.fixedRotation = true;
	this.body.setCollisionGroup(game.const.COL_PADDLE);
	this.body.collides(game.const.COL_BALL, this.ballCollisionAbsolute, this);
	this.body.collides(game.const.COL_INVADER, this.killPaddle, this);
	this.body.collides(game.const.COL_LASER, this.killPaddle, this);
	
	/*Object.defineProperty(this, 'recaptureTally', {
		get: function() {
			return recaptureTally;	
		},
		set: function(value) {
			recaptureTally = value;
			this.updateCaptureTally();
		}
	});*/
	this.recaptureTally = 3;
	this.laserCount = 5;
	this.inputEnabled = true;
	this.animations.add('idle', [0,1,2,1], 8, true);
	this.animations.play('idle');
	this.smoothed = false;
	
	this.bounceEmitter = this.game.add.emitter(this.body.x,this.body.y,6);
	this.bounceEmitter.makeParticles('paddleParticles', [0,1,2]);
	this.bounceEmitter.gravity = 0;
	this.bounceEmitter.setScale(1, 2, 1, 2, 0);
	this.bounceEmitter.lifespan = 150;
	this.bounceEmitter.setAlpha(0.8,0.4,150, Phaser.Easing.Linear.None);
	this.body.onBeginContact.add(this.bounceCandy, this);
	game.add.existing(this);
	return this;
};

Paddle.prototype = Object.create(Phaser.Sprite.prototype);
Paddle.prototype.constructor = Paddle;
Paddle.paddle = null;
Paddle.paddleTexture = null;
Paddle.const = {PADDLE_POS_Y : 30, PADDLE_POS_X : 400,  PADDLE_HEIGHT: 10, PADDLE_WIDTH: 150 , PADDLE_COLOR : '#ffb500', PADDLE_OUTLINE : 2,
				SPEED_X: 500, PARTICLE_SPEED: 400
			};


//Paddle animation: pulsing outline (2 and 3)
Paddle.getPaddle = function(game,x,y) {
	if (Paddle.paddle != null) {
		return Paddle.paddle.reset(x,y);
	}
	if (x == null) {
		x = this.const.PADDLE_POS_X;	
	}
	if (y == null) {
		y = game.world.height - this.const.PADDLE_POS_Y;	
	}
	Paddle.paddle = new Paddle(game,x,y,'paddle');
	return Paddle.paddle;
};

Paddle.prototype.bounceCandy = function(body2, pBody2, shapeThis, shapeThat, contactEq) {
	var contactVector;
	var normalVector;
	if (contactEq[0].bodyA == this.body.data) {
		contactVector = contactEq[0].contactPointA;
		normalVector = [-contactEq[0].normalA[0], -contactEq[0].normalA[1]];
	}
	else if (contactEq[0].bodyB == this.body.data) {
		contactVector = contactEq[0].contactPointB;
		normalVector = contactEq[0].normalA;
	}
	else {
		console.log("ERROR!");
		return;
	}
	var angle = Math.atan2(normalVector[1], (-1)*normalVector[0]);
	var adjust = this.game.rnd.realInRange(Math.PI/3, 3*Math.PI/4)*(Phaser.Utils.chanceRoll() ? 1: -1);
	//this.bounceEmitter.at(this);
	this.bounceEmitter.emitX = this.body.x + this.game.physics.p2.mpxi(contactVector[0]);
	this.bounceEmitter.emitY = this.body.y + this.game.physics.p2.mpxi(contactVector[1]);
	for (var i = 0; i < 6; i++) {
		var adjust = angle + this.game.rnd.realInRange(Math.PI/4, Math.PI/3)*(i % 2 == 0 ? 1 : -1);
		this.bounceEmitter.setXSpeed((-1)*Paddle.const.PARTICLE_SPEED*Math.cos(adjust) - 10, (-1)*Paddle.const.PARTICLE_SPEED*Math.cos(adjust) + 10);
		this.bounceEmitter.setYSpeed(Paddle.const.PARTICLE_SPEED*Math.sin(adjust) - 10, Paddle.const.PARTICLE_SPEED*Math.sin(adjust) + 10);
		this.bounceEmitter.emitParticle();
	}
}

Paddle.prototype.update = function() {
	if (this.body.x - this.width/2 < this.game.world.bounds.left) {
		this.body.x = this.game.world.bounds.left + this.width/2;
	}
	if (this.body.x + this.width/2 > this.game.world.bounds.right) {
		this.body.x = this.game.world.bounds.right - this.width/2;	
	}
	
	if (this.isHolding || this.shieldPower) {
		if (!this.holdShield) {
			this.holdShield = HoldShield.getShield(this.game, this);	
		}
	}
	else {
		this.holdShield = HoldShield.sheath();	
	}
	//update children
	
	if (this.children && this.children.length > 0) {
		for (var i = 0; i < this.children.length; i++) {
			this.children[i].update();
		}
	}
	
	
};

Paddle.prototype.listenTo = function(obj) {
	if (obj instanceof Director) {
		obj.events.onNewWave.add(this.resetPaddle, this);		
	}
}

//where the magic happens
//For now, 2 parameters for influencing ball movement: 
// Paddle collision region. Collision on the left side will influence ball to move to the left, softening angle while moving right 
//and sharpening it while moving left  
// Paddle movement. If the ball is moving in the same direction as the paddle, the return angle will be sharpened. If it is moving in the opposite direction, it will be softened

Paddle.prototype.ballCollision = function(paddle, ball) {
	if (ball.x <= this.body.x - this.width/6) {
		ball.applyForce([Ball.const.X_INFLUENCE, 0], ball.x, ball.y);
	}
	else if (ball.x >= this.body.x + this.width/6) {
		ball.applyForce([-Ball.const.X_INFLUENCE,0], ball.x, ball.y);
	}
	
	//movement
	ball.applyForce([Ball.const.X_INFLUENCE*Math.sign(this.body.velocity.x), 0], ball.x, ball.y);
	
};

//ball return vector is influenced entirely by area on paddle it collided with.
//Something in between would probably be best
Paddle.prototype.ballCollisionAbsolute = function (paddle, ball) {
	//zero out forces
	//ball.setZeroForce();
	//find collision area as ratio
	var collideProp = 2*(paddle.x - ball.x)/paddle.sprite.width;
	var angle = 1.047*collideProp;
	angle += Math.PI/2;
	ball.velocity.x = Math.cos(angle)*ball.sprite.ballSpeed;
	ball.velocity.y = -Math.sin(angle)*ball.sprite.ballSpeed;
	
};

Paddle.prototype.powerup = function(powerup) {
	powerup.effect.apply(this);	
};

Paddle.prototype.killPaddle = function(paddle, enemy) {
	if (paddle.sprite.isHolding) {
		return;	
	}
	this.pendingDestroy = true;	
};

Paddle.prototype.resetPaddle = function() {
	this.scale.x = 1;
	this.scale.y = 1;
	this.resetBody();
	if (this.laserCount < 5) {this.laserCount = 5;};
	if (this.recaptureTally < 3) {this.recaptureTally = 3;};
};

Paddle.prototype.resetBody = function() {
	this.body.setRectangle(150*this.scale.x, 10, 0,2.5);
	this.body.collideWorldBounds = true;
	this.body.motionState = Phaser.Physics.P2.Body.KINEMATIC;
	this.body.fixedRotation = true;
	this.body.setCollisionGroup(this.game.const.COL_PADDLE);
	this.body.collides(this.game.const.COL_BALL, this.ballCollisionAbsolute, this);
	this.body.collides(this.game.const.COL_INVADER, this.killPaddle, this);
	this.body.collides(this.game.const.COL_LASER, this.killPaddle, this);
};

Paddle.prototype.recaptureCandy = function(ball) {
	//first, make a ghost image of the ball
	/*
	var ghostBall = this.game.add.sprite(ball.body.x, ball.body.y, ball.texture);
	ghostBall.alpha = 0.6;
	ghostBall.lifespan = 300;
	ghostBall.scale.x = 1.2;
	ghostBall.scale.y = 1.2;*/
	
	//draw a thing
	//No, THIS should be a Rope
	var dist = Phaser.Point.distance(ball.body, this.body);
	var angle = Phaser.Point.angle(ball.body, this.body);
	var texture = this.game.add.bitmapData(2, ball.width);
	texture.rect(0,0, 2, ball.width, "#00fff6");
	var points = [];
	//points.push(new Phaser.Point(ball.body.x + (Ball.const.BALL_RADIUS/2)*Math.cos(angle), ball.body.y - (Ball.const.BALL_RADIUS/2)*Math.sin(angle)));
	points.push(new Phaser.Point(ball.x, ball.y));
	/*
	for (var i = 1; i <= dist; i+= 3) {
		points.push(new Phaser.Point(ball.body.x + (i/(dist*Math.cos(angle))), ball.body.y + (i/(dist*Math.sin(angle)))));
	}*/
	points.push(new Phaser.Point(this.body.x, this.body.y - 4));
	var candySprite = this.game.add.rope(0, 0, texture, 0, points);
	candySprite.blendMode = PIXI.blendModes.SCREEN;
	candySprite.alpha = 0.4;
	candySprite.lifespan = 200;
	
	//particle emitter
	var pEmitter = this.game.add.emitter(0,0,50);
	pEmitter.makeParticles('parryParticles', [0,1,2], 50);
	pEmitter.gravity = 0;
	pEmitter.setYSpeed(-50, 50);
	pEmitter.setXSpeed(-50, 50);
	pEmitter.setAlpha(1,0.7, 600, Phaser.Easing.Linear.None);
	pEmitter.setScale(0.75, 1.5, 0.75, 1.5, 0);
	pEmitter.lifespan = 500;
	for (var i = 0; i < 25; i++) {
		pEmitter.emitX = ball.body.x - ((i*2)/50)*(dist*Math.cos(angle));
		pEmitter.emitY = ball.body.y - ((i*2)/50)*(dist*Math.sin(angle));
		pEmitter.emitParticle();
		pEmitter.emitParticle();
	}
};