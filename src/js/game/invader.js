//Invaders

//invader


Invaders = [];
Invaders.prototype = Object.create(Array.prototype);
/*
Invaders[0] = Invaders[1] = Invaders[2] = function(game,x,y,key,frame) {
	Invader.call(this, game,x,y, this.textureTemplate, 0);
	return this;
};

Invaders[3] = function(game,x,y,key,frame) {
	Invaders[3].prototype.materialize = function() {
		this.game.physics.p2.enable(this, true);
		this.alpha = 1;
		this.body.setRectangle(32, 18, 0, -8);
		this.body.setCollisionGroup(this.game.const.COL_INVADER);
		this.body.collides([this.game.const.COL_BALL, this.game.const.COL_PADDLE]);
		this.body.createGroupCallback(this.game.const.COL_BALL, this.bounceBack, this);
		this.body.motionState = Phaser.Physics.P2.Body.KINEMATIC;
		this.exists = true;
		this.tint = 0xFFFFFF;

		//shooting
		//this.shotEmitter = this.game.add.emitter(this.body.x, this.bottom, 1);
		this.shotEmitter = new ShotEmitter(this.game, this.body.x, this.body.y + this.height/2, 1);
		this.shotEmitter.particleClass = Laser;
		this.shotEmitter.makeParticles(['laser1', 'laser2'], 0);

		return this;
	};
	
	Invaders[3].prototype.bounceBack = function(thisBod, thatBod, thisShape, thatShape) {
		console.log("HIT");
	};
	Invader.call(this, game,x,y,this.textureTemplate,0);
	
	return this;
	
};*/
Invaders.init = function(game, key) {
	this.game = game; 
	this.key = key;
	this.getNext = function() {
		return this.length;	
	};
	this.master = game.cache.getImage(key);
	this.master.frameData = game.cache.getFrameData(key);
	this.frameWidth = this.master.frameData._frames[0].width;
	this.frameHeight = this.master.frameData._frames[0].height;
	this.frameLine = this.master.width/this.frameWidth;
	for (var i = 0; i < this.frameLine; i++) {
		Invaders.makeProto(i, [i, i+this.frameLine]);
	}
	
};
//Invaders.master = this.game.cache.getRenderTexture('InvaderTiles.png');

Invaders.constructor = function(game,x,y, frame) {
	Invader.call(this, game,x,y, this.textureTemplate, frame);
	return this;
};

Invaders.makeProto = function(num, frames) {
	if (typeof this[num] === 'undefined') {
		this[num] = function(game,x,y,key,frame) {
			Invader.call(this, game,x,y, this.textureTemplate, 0);
			return this;
		};
	}
	this[num].prototype = Object.create(Invader.prototype);
	this[num].prototype.constructor = this[num];
	this[num].prototype.textureTemplate = this.game.make.bitmapData(this.frameWidth*frames.length, this.frameHeight);
	var frameData = new Phaser.FrameData();
	for(var i = 0; i < frames.length; i++) {
		this[num].prototype.textureTemplate.copy(this.master, this.frameWidth*(frames[i] % this.frameLine), this.frameHeight*(Math.floor(frames[i]/this.frameLine)), this.frameWidth, this.frameHeight, this.frameWidth*i, 0);
		var frame = new Phaser.Frame(i, this.frameWidth*(i), 0, this.frameWidth, this.frameHeight, i.toString());
		frameData.addFrame(frame);
	}
	this.game.cache.addBitmapData('inv' + num.toString(), this[num].prototype.textureTemplate, frameData);
	
};

Invader = function(game,x,y,key,frame) {
	Phaser.Sprite.apply(this,arguments);
	this.points = 100;
	this.health = 1;
	this.events.onDestroy.add(window.BreakInvaders.state.play.updateScore, {wasDestroyed: this, stateCtx:window.BreakInvaders.state.play });
	this.events.onDestroy.add(this.candyDestroy, this);
	this.events.onDestroy.add(this.spawnPower, this);
	this.events.onDestroy.add(function() {this.game.sound.play('kill1')}, this);
	this.moveTime = game.time.now;
	this.shootTime = game.time.now;
	this.animations.add('idle', [0,1], 2, true);
	this.animations.play('idle');
	this.anchor.x = 0.5; this.anchor.y = 0.5;
	
	//warp in
	//this.exists = false;
	this.alpha = 0.7;
	this.smoothed = false;
	var warpTween = this.game.add.tween(this).from({width: 1, height: 1}, 800, Phaser.Easing.Bounce.Out);
	warpTween.onComplete.add(this.materialize, this);
	warpTween.start();
	return this;
};

Invader.prototype = Object.create(Phaser.Sprite.prototype);
Invader.prototype.constructor = Invader;
Invader.invaderTexture = null;
Invader.const = {INVADER_HEIGHT : 32, INVADER_WIDTH: 32, INVADER_COLOR: '#0000FF', MOVE_WAIT: 10000, SHOOT_WAIT: 5000};
Invader.makeTexture = function(game) {
	if (Invader.invaderTexture == null) {
		var invaderTexture = game.make.bitmapData(this.const.INVADER_WIDTH, this.const.INVADER_HEIGHT);
		invaderTexture.rect(0,0,this.const.INVADER_WIDTH, this.const.INVADER_HEIGHT, this.const.INVADER_COLOR);
		Invader.invaderTexture = invaderTexture;
	}
	
};

Invader.prototype.update = function() {
	if (this.game.time.now >= this.moveTime + Invader.const.MOVE_WAIT) {
		this.moveTime = this.game.time.now;
		//just move down instantly, can get fancy later
		//this.body.y += 32;
	}
	if (this.body && this.body.y >= this.game.world.height - this.game.const.KILL_PLANE) {
		this.game.state.start("boot");	//just a hard reset
	}
	
	//shooting?
	if (this.body && this.game.rnd.frac() < 0.5 && this.game.time.now >= this.shootTime + Invader.const.SHOOT_WAIT) {
		//this.shotEmitter.emitParticle(); //will fail if the particle is already on screen, that's fine!	
		this.shoot();
	}
};


Invader.prototype.candyDestroy = function() {
	var emitter = this.game.add.emitter(this.x,this.y, 16);
	emitter.makeParticles('explodeParticles', [0,1,2]);
	emitter.gravity = 0;
	emitter.setYSpeed(-75, 75);
	emitter.setXSpeed(-75, 75);
	emitter.setAlpha(1,0.4, 600, Phaser.Easing.Linear.None);
	emitter.setScale(0.75, 1.5, 0.75, 1.5, 0);
	emitter.start(true, 1000, 0,16, true);
	emitter.forEach(this.setParticleLifespan, this);
};

Invader.prototype.materialize = function() {
	//blah blah blah
	this.game.physics.p2.enable(this, false);
	this.alpha = 1;
	this.body.setRectangle(24, 16,  0, 0);
	this.body.motionState = Phaser.Physics.P2.Body.KINEMATIC;
	this.body.setCollisionGroup(this.game.const.COL_INVADER);
	this.body.collides([this.game.const.COL_BALL, this.game.const.COL_PADDLE]);
	this.exists = true;
	this.tint = 0xFFFFFF;
	
	//shooting
	//this.shotEmitter = this.game.add.emitter(this.body.x, this.bottom, 1);
	this.shotEmitter = new ShotEmitter(this.game, this.body.x, this.body.y + this.height/2, 1);
	this.shotEmitter.particleClass = Laser;
	this.shotEmitter.makeParticles(['laser1', 'laser2'], 0);
	
	return this;
	
};

//SO not an invader thing, refactor into a particle thing
Invader.prototype.setParticleLifespan = function(particle) {
	particle.lifespan = particle.game.rnd.integerInRange(600,1000);
};

Invader.prototype.checkDestroy = function() {
	if (!this.body) return;
	this.health--;
	//pretty sure I don't need to check this
	if (this.health == 0) {
		this.pendingDestroy = true;
		return true;
	}
	else {
		this.hurtTint = this.game.add.tween(this);
		this.hurtTint.to({tint: 0x00FF00}, 100, null,true, 0, 6, true);
		return false;
	}
};

Invader.prototype.spawnPower = function() {
	/*
	if (this.game.rnd.frac() < 0.008) {
		return Powerup.recapture(this.game, this.body.x, this.body.y);
	}
	*/
	/*
	else if (this.game.rnd.frac() < 0.5) {
		return Powerup.fireball(this.game, this.body.x, this.body.y);
	}*/
	/*
	if (this.game.rnd.frac() < 1) {
		return Powerup.paddleDown(this.game, this.body.x, this.body.y);
	}*/
};

Invader.prototype.shoot = function() {
	//this.shotEmitter.emitParticle();
	this.shootTime = this.game.time.now;
};

//home grown P2 cell overlap function, thanks Obama
Invader.prototype.cellOverlap = function(that) {
	if (this.body.y == that.body.y && this.body.x == that.body.x) {
		return true;
	}
	return false;
};
/*
Invaders[0] = Invaders[1] = Invaders[2] = function(game,x,y,key,frame) {
	Invader.call(this, game,x,y, this.textureTemplate, 0);
	return this;
};*/

//Speed invader

Invaders[2] = function(game,x,y,key,frame) {
	Invaders[2].prototype.materialize = function() {
		this.game.physics.p2.enable(this, false);
		this.alpha = 1;
		this.health = 1;
		this.points = 150;
		this.body.setRectangle(16, 16, 0, 0);
		this.body.setCollisionGroup(this.game.const.COL_INVADER);
		this.body.collides([this.game.const.COL_BALL, this.game.const.COL_PADDLE]);
		//this.body.createGroupCallback(this.game.const.COL_BALL, this.bounceBack, this);
		this.body.motionState = Phaser.Physics.P2.Body.KINEMATIC;
		this.exists = true;
		this.tint = 0xFFFFFF;
		this.game.globalEvent.add(this.move, this);
		//shooting
		//this.shotEmitter = this.game.add.emitter(this.body.x, this.bottom, 1);
		this.shotEmitter = new ShotEmitter(this.game, this.body.x, this.body.y + this.height/2, 1);
		this.shotEmitter.particleClass = Laser;
		this.shotEmitter.makeParticles(['laser1', 'laser2'], 0);
		return this;
	};
	
	
	Invaders[2].prototype.move = function() {
		var collide = true;
		if (!this.alive || !this.exists) {
			console.log("HANGING CALLBACK:", this); //seriously, how?
			if (this.game) {
				this.game.globalEvent.remove(arguments.callee, this);
			}
			return;
		}
		while (collide) {
			this.body.y +=32;
			collide = false;
			for(var i = 0; i < this.game.canvas.playState.invaders.children.length; i++) {
				var that = this.game.canvas.playState.invaders.children[i];
				if (this != that && this.cellOverlap(that)) {
					collide = true; continue;
				}
			}
		}
	};
	
	Invaders[2].prototype.destroy = function() {
		this.game.globalEvent.remove(this.move, this);
		Invader.prototype.destroy.apply(this);
	};
	
	Invader.call(this, game,x,y, this.textureTemplate, 0);
	return this;
};

//Parry Invader

Invaders[3] = function(game,x,y,key,frame) {
	Invaders[3].prototype.materialize = function() {
		this.game.physics.p2.enable(this, false);
		this.alpha = 1;
		this.health = 2;
		this.points = 300;
		this.body.setRectangle(32, 18, 0, -4);
		this.parryBody = this.body.addRectangle(32, 10, 0, 8);
		this.parrySpeed = Ball.const.SPEED_MAX;
		this.body.setCollisionGroup(this.game.const.COL_INVADER);
		this.body.collides([this.game.const.COL_BALL, this.game.const.COL_PADDLE], this.bounceBack, this);
		this.body.motionState = Phaser.Physics.P2.Body.KINEMATIC;
		this.exists = true;
		this.tint = 0xFFFFFF;

		

		//shooting
		//this.shotEmitter = this.game.add.emitter(this.body.x, this.bottom, 1);
		this.shotEmitter = new ShotEmitter(this.game, this.body.x, this.body.y + this.height/2, 1);
		this.shotEmitter.particleClass = Laser;
		this.shotEmitter.makeParticles(['laser1', 'laser2'], 0);

		return this;
	};
	
	Invaders[3].prototype.bounceBack = function(thisBod, thatBod, thisShape, thatShape) {
		if (thisShape == this.parryBody && !(this.hurtTint && this.hurtTint.isRunning)) {
			thisBod.sprite.candyParry();
			thatBod.velocity.x = 0;
			thatBod.sprite.oldSpeed = thatBod.sprite.ballSpeed;
			thatBod.sprite.ballSpeed = this.parrySpeed;
			thatBod.velocity.y = this.parrySpeed;
			thatBod.sprite.tint = 0x00ffff;
			thatBod.onBeginContact.addOnce(function() {this.sprite.ballSpeed = this.sprite.oldSpeed; this.sprite.tint = 0xFFFFFF}, thatBod);
			
		}
	};
	
	Invaders[3].prototype.candyParry = function() {
		var emitter = this.game.add.emitter(this.body.x,this.y+this.height/2, 50);
		emitter.makeParticles('parryParticles', [0,1,2]);
		emitter.gravity = 0;
		emitter.setYSpeed(150, 300);
		emitter.setXSpeed(-50, 50);
		emitter.setAlpha(1,0.7, 600, Phaser.Easing.Linear.None);
		emitter.setScale(0.75, 1.5, 0.75, 1.5, 0);
		emitter.start(true, 1000, 0,50, true);
		emitter.forEach(this.setParticleLifespan, this);
		
	}
	
	Invaders[3].prototype.checkDestroy = function(context, body1, body2, shape1, shape2) {
		if (shape2 == this.parryBody) {
			return false;
		}
		this.health--;
		if (this.health == 0) {
			this.candyDestroy();
			this.candyDestroy();
			this.pendingDestroy = true;
			//hacky: add a few more destruction particles for effect, shouldn't really be done here

			return true;
		}
		else {
			this.hurtTint = this.game.add.tween(this);
			this.hurtTint.to({tint: 0x00FF00}, 100, null,true, 0, 6, true);
			
		}
		
	}
	
	Invader.call(this, game,x,y,this.textureTemplate,0);
	
	return this;
	
};


//Witch

Invaders[4] = function(game,x,y,key,frame) {
	Invaders[4].prototype.materialize = function() {
		this.game.physics.p2.enable(this, false);
		this.alpha = 1;
		this.health = 1;
		this.points = 300;
		this.body.setRectangle(24, 20, 0, 0);
		this.body.setCollisionGroup(this.game.const.COL_INVADER);
		this.body.collides([this.game.const.COL_BALL, this.game.const.COL_PADDLE], this.bounceBack, this);
		//this.body.createGroupCallback(this.game.const.COL_BALL, this.bounceBack, this);
		this.body.motionState = Phaser.Physics.P2.Body.KINEMATIC;
		this.exists = true;
		this.tint = 0xFFFFFF;

		//shooting
		//this.shotEmitter = this.game.add.emitter(this.body.x, this.bottom, 1);
		this.shotEmitter = new ShotEmitter(this.game, this.body.x, this.body.y + this.height/2, 1);
		this.shotEmitter.particleClass = Laser;
		this.shotEmitter.makeParticles(['laser1', 'laser2'], 0);

		return this;
	};
	
	
	Invaders[4].const = {SPELL_DURATION: 1000 , GRAV_RAD: 128};
	
	Invaders[4].prototype.dropTable = ['paddleKill', 'durationDown', 'paddleDown'];
	
	Invaders[4].prototype.invincible = function() {
		this.checkDestroy = function() {return false };
		this.effectTimer = this.game.time.create();
		//CANDY HERE
		this.tint = 0x717171;
		this.effectTimer.add(Invaders[4].const.SPELL_DURATION, function() { this.checkDestroy = Invaders[4].prototype.checkDestroy; this.tint = 0xFFFFFF; console.log("END INVINCIBLE")}, this);
		this.effectTimer.start();
		console.log("INVINCIBLE");
	};
	
	Invaders[4].prototype.checkDestroy = function() {
		new Wisp(this.game, this.x, this.y, this);
		this.pendingDestroy = true;
		return true;
	};
	
	Invaders[4].prototype.antiGrav = function() {
		this.update = function() {
			Invader.prototype.update.apply(this);
			if (Phaser.Point.distance(this, this.game.ball) <= Invaders[4].const.GRAV_RAD) {
				if (this.game.ball.x > this.x) {
					this.game.ball.body.velocity.x += 10;
				}
				else {
					this.game.ball.body.velocity.x -= 10;
				}
			}
		};
		//candy HERE
		this.tint = 0x3b1c6d;
		this.effectTimer = this.game.time.create();	//just use one timer, don't keep making more!
		this.effectTimer.add(Invaders[4].const.SPELL_DURATION, function() {this.update = Invader.prototype.update; this.tint = 0xFFFFFF; console.log("End ANTIGRAV");}, this);
		this.effectTimer.start();
		console.log("ANTIGRAV");
	};
	
	Invaders[4].prototype.witchShoot = function() {
		Powerup[this.game.rnd.pick(this.dropTable)](this.game, this.body.x, this.body.y+this.height/2, 0, 80, 0);
	};
	
	Invaders[4].prototype.actions = [this.invincible, this.antiGrav, this.witchShoot];
	
	Invaders[4].prototype.shoot = function() {
		var witchAction = this.game.rnd.pick(this.actions);
		witchAction.apply(this);
		this.shootTime = this.game.time.now;
	};
	
	Invader.call(this, game,x,y,this.textureTemplate,0);
	return this;
};