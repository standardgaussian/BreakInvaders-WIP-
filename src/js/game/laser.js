Laser = function(game,x,y,key,frame) {
	Phaser.Particle.apply(this, arguments);
	game.physics.p2.enable(this);
	this.body.setRectangleFromSprite();
	this.body.collideWorldBounds = true;
	this.body.fixedRotation = true;
	this.body.setCollisionGroup(game.const.COL_LASER);
	this.body.collides(game.const.COL_BALL, this.ballCollide, this);
	this.body.collides(game.const.COL_PADDLE, this.killPaddle, this);
	
	this.body.checkCollision = {};	//hack to get around makeParticle forcing arcade physics.
	
	this.animations.add('idle', [0,1,2,3], 6, true);
	this.animations.play('idle');
	
	this.body.velocity.y = 250;
	
	this.checkWorldBounds = true;
	this.outOfBoundsKill = true;
	
	game.add.existing(this);
	return this;
};

Laser.prototype = Object.create(Phaser.Particle.prototype);
Laser.prototype.constructor = Laser;

Laser.prototype.killPaddle = function (laser, paddle) {
	//paddle.sprite.destroy();	//nonfunctional, but simple	
};

Laser.prototype.update = function() {
	this.body.velocity.y = 150;
	this.body.velocity.x = 0;
}

//laser emitter

ShotEmitter = function(game,x,y, maxParticles) {
	Phaser.Particles.Arcade.Emitter.apply(this, arguments);
	game.add.existing(this);
	return this;
};

ShotEmitter.prototype = Object.create(Phaser.Particles.Arcade.Emitter.prototype);
ShotEmitter.prototype.constructor = ShotEmitter;


ShotEmitter.prototype.emitParticle = function() {
	var particle = this.getFirstExists(false);

    if (particle === null)
    {
        return false;
    }

    if (this.width > 1 || this.height > 1)
    {
        particle.reset(this.game.rnd.integerInRange(this.left, this.right), this.game.rnd.integerInRange(this.top, this.bottom));
    }
    else
    {
        particle.reset(this.emitX, this.emitY);
    }

    particle.angle = 0;
    particle.lifespan = this.lifespan;

    if (this.particleBringToTop)
    {
        this.bringToTop(particle);
    }
    else if (this.particleSendToBack)
    {
        this.sendToBack(particle);
    }

    if (this.autoScale)
    {
        particle.setScaleData(this.scaleData);
    }
    else if (this.minParticleScale !== 1 || this.maxParticleScale !== 1)
    {
        particle.scale.set(this.game.rnd.realInRange(this.minParticleScale, this.maxParticleScale));
    }
    else if ((this._minParticleScale.x !== this._maxParticleScale.x) || (this._minParticleScale.y !== this._maxParticleScale.y))
    {
        particle.scale.set(this.game.rnd.realInRange(this._minParticleScale.x, this._maxParticleScale.x), this.game.rnd.realInRange(this._minParticleScale.y, this._maxParticleScale.y));
    }

    if (Array.isArray(this._frames === 'object'))
    {
        particle.frame = this.game.rnd.pick(this._frames);
    }
    else
    {
        particle.frame = this._frames;
    }

    if (this.autoAlpha)
    {
        particle.setAlphaData(this.alphaData);
    }
    else
    {
        particle.alpha = this.game.rnd.realInRange(this.minParticleAlpha, this.maxParticleAlpha);
    }

    particle.blendMode = this.blendMode;

    //particle.body.updateBounds();

    //particle.body.bounce.setTo(this.bounce.x, this.bounce.y);

    //particle.body.velocity.x = this.game.rnd.between(this.minParticleSpeed.x, this.maxParticleSpeed.x);
    //particle.body.velocity.y = this.game.rnd.between(this.minParticleSpeed.y, this.maxParticleSpeed.y);
    //particle.body.angularVelocity = this.game.rnd.between(this.minRotation, this.maxRotation);

   // particle.body.gravity.y = this.gravity;

    //particle.body.drag.x = this.particleDrag.x;
    //particle.body.drag.y = this.particleDrag.y;

    //particle.body.angularDrag = this.angularDrag;

    particle.onEmit();

    return true;

};
//from collision callback with ball
Laser.convertLaser = function(ball, laser) {
	
}