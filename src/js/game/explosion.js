//fireball and ExplodeInvader explosions

Explosion = function(game,x,y, lifetime, radius) {
	this.scaleTexture = game.make.bitmapData(radius*2, radius*2);
	this.scaleTexture.circle(this.scaleTexture.width/2, this.scaleTexture.height/2, radius, Explosion.const.COLOR);
	Phaser.Sprite.call(this, game,x,y, this.scaleTexture, 0);
	this.lifespan = lifetime;
	game.physics.p2.enable(this);
	this.radius = radius;
	this.lockX = x;
	this.lockY = y;
	this.body.setCircle(this.radius);
	//this.body.motionState = Phaser.Physics.P2.Body.KINEMATIC;
	this.body.setCollisionGroup(game.const.COL_BALL);
	//this.body.mass = Infinity; 
	this.body.collides(game.const.COL_INVADER, this.invaderCollide, this);
	//this.body.data.shapes[0].sensor = true;
	this.growth = this.game.add.tween(this.scale);
	this.growth.from({x: 0.1, y: 0.1}, this.lifespan - 200);
	this.body.onBeginContact.add(this.invaderCollide, this);
	game.add.existing(this);
	this.growth.start();
	return this;
};
				   
				

Explosion.prototype = Object.create(Phaser.Sprite.prototype);
Explosion.prototype.constructor = Explosion;

Explosion.const = {COLOR: '#ff9429'};

Explosion.prototype.invaderCollide = function(explosion, invader) {
	this.body.setZeroForce();
	this.body.setZeroVelocity();
	this.body.setZeroRotation();
	if(invader && invader.sprite) {
		invader.sprite.destroy();
	}
		
};

Explosion.prototype.update = function() {
	this.body.setCircle(this.radius*this.scale.x);
	this.body.setCollisionGroup(this.game.const.COL_BALL);
	this.body.x = this.lockX;
	this.body.y = this.lockY;
};