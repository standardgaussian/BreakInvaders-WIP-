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
	game.add.existing(this);
	return this;
};

Paddle.prototype = Object.create(Phaser.Sprite.prototype);
Paddle.prototype.constructor = Paddle;
Paddle.paddle = null;
Paddle.paddleTexture = null;
Paddle.const = {PADDLE_POS_Y : 30, PADDLE_POS_X : 400,  PADDLE_HEIGHT: 10, PADDLE_WIDTH: 150 , PADDLE_COLOR : '#ffb500', PADDLE_OUTLINE : 2,
				SPEED_X: 500,
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
			this.holdShield.updatePos();
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