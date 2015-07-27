//entity that blocks projectiles when the ball is being held by the paddle

HoldShield = function(game,x,y,key,frame, points, paddle) {
	Phaser.Rope.apply(this, arguments);
	//rope has no anchor, causes p2 body enabling to fail
	this.anchor = new Phaser.Point();
	this.paddle = paddle;
	game.physics.p2.enable(this, false);
	this.body.setRectangle(this.paddle.width, 7, this.paddle.width/2, -1);
	this.body.setCollisionGroup(game.const.COL_PADDLE);
	this.body.collides(game.const.COL_INVADER, this.stopShot, this);
	this.body.motionState = Phaser.Physics.P2.Body.KINEMATIC;
	//this.game.physics.p2.createLockConstraint(this.paddle, this,[0,-1]);
	this.paddle.paddleGroup.addChild(this);
	//game.add.existing(this);
	this.updateCount = 10;
	this.updateAnimation = function() {
		if (this.updateCount != 10) {
			this.updateCount++;
			return;
		}
		this.updateCount = 0;
		for (var i = 1; i < this.points.length -1; i++) {
		this.points[i].y = -Math.sin(this.game.rnd.frac()*Math.PI/2)*7;
	}
		//console.log(this.points);
	};
	return this;
};

HoldShield.prototype = Object.create(Phaser.Rope.prototype);
HoldShield.prototype.constructor = HoldShield;

HoldShield.getShield = function(game,paddle) {
	if (typeof HoldShield.shield === 'undefined') {
		var paddleLength = paddle.width;
		var texture = game.add.bitmapData(paddleLength, 2);
		texture.rect(0,0, paddleLength, 2, "#00fff6");
		var points = [];
		for (var i = 0; i < paddleLength; i++) {
			points.push(new Phaser.Point(i, 1));	
		}
		HoldShield.shield = new HoldShield(game, paddle.x - paddle.width/2, paddle.y - paddle.height/2 - 1, texture, 0, points, paddle); 
	}
	else {
		HoldShield.shield.exists = true;
		HoldShield.shield.visible = true;
	}
	return HoldShield.shield;
};

HoldShield.prototype.stopShot = function(shield, bullet) {
	if (bullet instanceof Laser) {
		bullet.pendingDestroy = true;	
	}
};

HoldShield.sheath = function() {
	if (HoldShield.shield) {
		HoldShield.shield.exists = false;
		HoldShield.shield.visible = false;
	}
	
	return null;
};

//move with paddle. Should just make a paddleGroup to move everything together!
HoldShield.prototype.updatePos = function() {
	this.body.x = this.paddle.x - this.paddle.width/2;
	this.body.y = this.paddle.y - this.paddle.height/2 - 1;
}