Powerup = function(game,x,y, key, frames, name) {
	Phaser.Sprite.apply(this,arguments);
	this.name = name;
	game.physics.p2.enable(this);
	this.body.setRectangleFromSprite();
	this.body.motionState = Phaser.Physics.P2.Body.KINEMATIC;
	this.body.fixedRotation = true;
	this.body.velocity.y = Powerup.const.FALL_RATE;
	
	if (typeof frames === 'undefined' || frames === 0) {
		this.animations.add('idle', [0,1,2], 3, true);
	}
	else {
		this.animations.add('idle', frames, 3, true);
	}
	this.animations.play('idle');
	
	game.add.existing(this);
	return this;
};

Powerup.const = {FALL_RATE: 150, DURATION: 10000, GRAV_RAD: 96, GRAV_INF: 10};

Powerup.prototype = Object.create(Phaser.Sprite.prototype);
Powerup.prototype.constructor = Powerup;

Powerup.prototype.update = function() {
	if (this.overlap(this.game.player)) {
		this.game.player.powerup(this);
		this.destroy();
	}
};

Powerup.recapture = function(game,x,y) {
	var capture = new Powerup(game,x,y, 'recapturePower', 0, "capture");
	capture.effect = function() {
		this.recaptureTally++;
	}
	return capture;
}

Powerup.fireball = function(game,x,y) {
	var capture = new Powerup(game,x,y, 'fireballPower', 0, "fireball");
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
}

Powerup.gravity = function(game,x,y) {
	var capture = new Powerup(game,x,y,'gravityPower', [0,1,0,2], "gravity");
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
}