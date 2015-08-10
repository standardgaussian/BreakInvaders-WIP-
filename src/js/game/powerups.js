Powerup = function(game,x,y, key, frames, name, vx, vy, grav) {
	Phaser.Sprite.apply(this,arguments);
	if (grav === undefined) {grav = 10};
	if (vx === undefined) { vx = this.game.rnd.between(-300, 300)};
	if (vy === undefined) { vy = this.game.rnd.between(-300, -50)};
	this.name = name;
	game.physics.p2.enable(this);
	this.body.collideWorldBounds = true;
	this.checkWorldBounds = true;
	this.outOfBoundsKill = true;
	this.body.setRectangleFromSprite();
	this.body.setCollisionGroup(this.game.const.COL_POWER);
	this.body.collides(game.physics.p2.boundsCollisionGroup, Powerup.checkKill, this);
	this.body.fixedRotation = true;
	this.grav = grav
	this.body.velocity.y = vy;
	this.body.velocity.x = vx;
	
	if (typeof frames === 'undefined' || frames === 0) {
		this.animations.add('idle', [0,1,2], 3, true);
	}
	else {
		this.animations.add('idle', frames, 3, true);
	}
	this.animations.play('idle');
	
	this.smoothed = false;
	game.add.existing(this);
	return this;
};

Powerup.const = {FALL_RATE: 75, DURATION: 5000, GRAV_RAD: 96, GRAV_INF: 10, LASER_UP: 4, DURATION_INC: 1000, DURATION_MAX: 15000, DURATION_MIN: 2000, SCALE_INC: 0.1, SCALE_MAX: 0.5};
Powerup.durationTime = Powerup.const.DURATION;

Powerup.prototype = Object.create(Phaser.Sprite.prototype);
Powerup.prototype.constructor = Powerup;

Powerup.listenTo = function(obj) {
	if (obj instanceof Director) {
		obj.events.onNewWave.add(this.reset, this);	
	}
};

Powerup.reset = function() {
	Powerup.durationTime = Powerup.const.DURATION;
};

Powerup.prototype.update = function() {
	console.log(this.body.collideWorldBounds);
	//this.body.applyForce([0,0]);
	if (this.overlap(this.game.player)) {
		this.game.player.powerup(this);
		this.pendingDestroy = true;
	}
};

Powerup.checkKill = function(fa, la,powerup, worldBound) {
	if (worldBound == this.game.physics.p2.walls.bottom) {
		this.pendingDestroy = true;
	}
}

Powerup.recapture = function(game,x,y, vx, vy, grav) {
	var capture = new Powerup(game,x,y, 'recapturePower', 0, "capture",vx, vy, grav);
	capture.effect = function() {
		this.recaptureTally++;
	}
	return capture;
};

Powerup.fireball = function(game,x,y, vx, vy, grav) {
	var capture = new Powerup(game,x,y, 'fireballPower', 0, "fireball",vx, vy, grav);
	capture.effect = function() {
		if (Ball.fireTexture == null) {	//refactor later to make anonymous function that sets texture
		var ballTexture = game.make.bitmapData(Ball.const.BALL_RADIUS*2, Ball.const.BALL_RADIUS*2);
		ballTexture.circle(ballTexture.width/2, ballTexture.height/2, Ball.const.BALL_RADIUS, Ball.const.FIRE_COLOR);
		Ball.fireTexture = ballTexture;
	}
		this.game.ball.loadTexture(Ball.fireTexture);
		//this.game.ball.body.createGroupCallback(game.const.COL_INVADER, null); //clear previous callback
		this.game.ball.body.createGroupCallback(game.const.COL_INVADER, Ball.ballKillFire, this.game.ball);
		this.game.ball.effectTimer = this.game.time.create(true);
		this.game.ball.effectTimer.add(Powerup.const.DURATION, this.game.ball.revertNorm, this.game.ball);
		this.game.ball.candyTimer = this.game.time.create(true);
		this.game.ball.candyTimer.loop(250, Ball.fireParticles, this.game.ball);
		//this.game.ball.pEmitter = this.game.ball.addChild(this.game.add.emitter(this.game.ball.width/2, this.game.ball.height/2, 6));
		this.game.ball.pEmitter = this.game.add.emitter(this.game.ball.x,this.game.ball.y,6);
		this.game.ball.pEmitter.makeParticles('fireParticles', [0,1,2]);
		this.game.ball.pEmitter.gravity = 0;
		this.game.ball.pEmitter.setScale(1, 2, 1, 2, 0);
		this.game.ball.pEmitter.lifespan = 500;
		this.game.ball.effectTimer.onComplete.add(function() {this.destroy()}, this.game.ball.candyTimer);
		this.game.ball.candyTimer.start();
		this.game.ball.effectTimer.start();
	};
	return capture;
};

Powerup.gravity = function(game,x,y, vx, vy, grav) {
	var capture = new Powerup(game,x,y,'gravityPower', [0,1,0,2], "gravity",vx, vy, grav);
	capture.effect = function() {
		if (Ball.gravTexture == null) {
			var gravTexture = game.make.bitmapData(Ball.const.BALL_RADIUS*2, Ball.const.BALL_RADIUS*2);
			gravTexture.circle(gravTexture.width/2, gravTexture.height/2, Ball.const.BALL_RADIUS, Ball.const.GRAV_COLOR);
			Ball.gravTexture = gravTexture;
		}
		this.game.ball.beginApplyGrav = function(othBody, othBodyDat, thisShape, othShape, conData) {
			if (thisShape != this.sense || othBody == null || typeof othBody === 'undefined') return;
				this.senseArray.push(othBody);
		};
		this.game.ball.endApplyGrav = function(othBody, othBodyDat, thisShape, othShape) {
			if (thisShape != this.sense || othBody == null || typeof othBody === 'undefined') return;
				var i;
				if ((i = this.senseArray.indexOf(othBody)) != -1) {
					this.senseArray.splice(i, 1);
				}
		};
		this.game.ball.loadTexture(Ball.gravTexture);
		this.game.ball.sense = this.game.ball.body.addCircle(Powerup.const.GRAV_RAD);
		this.game.ball.senseArray = [];
		this.game.ball.sense.sensor = true;
		this.game.ball.body.setCollisionGroup(game.const.COL_BALL);
		this.game.ball.effectTimer = this.game.time.create(true);
		this.game.ball.effectTimer.add(Powerup.const.DURATION, this.game.ball.revertNorm, this.game.ball);
		this.game.ball.candyTween = this.game.add.tween(this.game.ball.scale);
		this.game.ball.scale.x = 0.8;
		this.game.ball.scale.y = 0.8;
		this.game.ball.candyTween.to({x: 1.2, y: 1.2}, 500, null, true, 0, -1, true);
		this.game.ball.candyTween.start();
		this.game.ball.effectTimer.onComplete.add(function() {this.target.x = 1; this.target.y = 1;this.destroy()}, this.game.ball.candyTween);
		this.game.ball.body.onBeginContact.add(this.game.ball.beginApplyGrav, this.game.ball);
		this.game.ball.body.onEndContact.add(this.game.ball.endApplyGrav, this.game.ball);
		this.game.ball.effectTimer.onComplete.add(function() { this.body.onBeginContact.remove(this.applyGrav); this.body.onEndContact.remove(this.endApplyGrav)}, this.game.ball);
		//this.game.ball.effectTimer.start();
		this.game.ball.update = function() {
			Ball.prototype.update.apply(this);
			var gravAvg = new Phaser.Point(0,0);
			if (this.senseArray.length == 0) return;
			for (var i = 0; i < this.senseArray.length; i++) {
				gravAvg.x += this.senseArray[i].x;
				gravAvg.y += this.senseArray[i].y;
			}
			gravAvg.x /= this.senseArray.length;
			gravAvg.y /= this.senseArray.length;
			if (gravAvg.x != 0 && gravAvg.y != 0) {
				
				Phaser.Point.subtract(gravAvg, new Phaser.Point(this.body.x, this.body.y), gravAvg);
				Phaser.Point.normalize(gravAvg, gravAvg);
				this.body.velocity.x += gravAvg.x*Powerup.const.GRAV_INF;
				this.body.velocity.y +=gravAvg.y*Powerup.const.GRAV_INF;
			}
			
		};
		
		
	};
	return capture;
};

Powerup.paddleKill = function(game,x,y, vx, vy, grav) {
	var powerup = new Powerup(game,x,y,'paddleKill', [0,1,2], "paddleKill",vx, vy, grav);
	powerup.effect = function() {
		this.pendingDestroy = true;	//~fin
	};
	return powerup;
};
	
	
Powerup.shieldPower = function(game,x,y, vx, vy, grav) {
	var powerup = new Powerup(game,x,y,'paddleShield', [0,1,2], "paddleShield",vx, vy, grav);
	powerup.effect = function() {
		this.shieldPower = true;	//should check if it's already on and just stop/reset the timer
		var shieldTimer = this.game.time.create();	//the above means that this timer needs to be accessible to be stopped
		shieldTimer.add(Powerup.const.DURATION, function() {this.shieldPower = false;}, this);
		shieldTimer.start();
	};
	return powerup;
};

Powerup.laserUp = function(game,x,y, vx, vy, grav) {
	var powerup = new Powerup(game,x,y,'paddleLaser', [0,1,2], "laserUp",vx, vy, grav);
	powerup.effect = function() {
		this.laserCount += Powerup.const.LASER_UP;
	};
	return powerup;
};

Powerup.durationUp = function(game,x,y, vx, vy, grav) {
	var powerup = new Powerup(game,x,y,'DurationUpPower', [0,1,2], "durationUp",vx, vy, grav);
	powerup.effect = function() {
		Powerup.durationTime += Powerup.const.DURATION_INC;
		if (Powerup.durationTime > Powerup.DURATION_MAX) {
			Powerup.durationTime = Powerup.DURATION_MAX;
		}
	};
	return powerup;
};

Powerup.durationDown = function(game,x,y, vx, vy, grav) {
	var powerup = new Powerup(game,x,y,'DurationDownPower', [0,1,2], "durationDown",vx, vy, grav);
	
	powerup.effect = function() {
		Powerup.durationTime -= Powerup.const.DURATION_INC;
		if (Powerup.durationTime < Powerup.DURATION_MIN) {
			Powerup.durationTime = Powerup.DURATION_MIN;
		}
	};
	return powerup;
};

Powerup.paddleUp = function(game,x,y, vx, vy, grav) {
	var powerup = new Powerup(game,x,y,'paddleUpPower', [0,1,2], "paddleUp", vx, vy, grav);
	powerup.effect = function() {
		this.scale.x +=Powerup.const.SCALE_INC;
		if (this.scale.x > 1  + Powerup.const.SCALE_MAX) {
			this.scale.x = 1 + Powerup.const.SCALE_MAX;
		}
		this.resetBody();
	};
	return powerup;
};

Powerup.paddleDown = function(game,x,y, vx, vy, grav) {
	var powerup = new Powerup(game,x,y,'paddleDownPower', [0,1,2], "paddleDown", vx, vy, grav);
	powerup.effect = function() {
		this.scale.x -= Powerup.const.SCALE_INC;
		if (this.scale.x < 1 - Powerup.const.SCALE_MAX) {
			this.scale.x = 1 - Powerup.const.SCALE_MAX;
		}
		this.resetBody();
	};
	return powerup;
};