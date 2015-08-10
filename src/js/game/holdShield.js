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
	//this.paddle.paddleGroup.addChild(this);
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
	game.add.existing(this);
	this.smoothed = false;
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
		//HoldShield.shield = new HoldShield(game, paddle.x - paddle.width/2, paddle.y - paddle.height/2, texture, 0, points, paddle);
		HoldShield.shield = new HoldShield(game,-paddle.width/2, -3, texture, 0, points, paddle); 
	}
	else {
		HoldShield.shield.exists = true;
		HoldShield.shield.visible = true;
	}
	paddle.addChild(HoldShield.shield);
	return HoldShield.shield;
};

HoldShield.prototype.stopShot = function(shield, bullet) {
	if (bullet instanceof Laser) {
		bullet.pendingDestroy = true;	
	}
};

HoldShield.sheath = function(paddle) {
	if (HoldShield.shield) {
		HoldShield.shield.exists = false;
		HoldShield.shield.visible = false;
		HoldShield.shield.paddle.removeChild(HoldShield.shield);
	}
	
	return null;
};

//move with paddle. Should just make a paddleGroup to move everything together!
HoldShield.prototype.update = function() {
	//this.body.x = this.paddle.x - this.paddle.width/2;
	//this.body.y = this.paddle.y - this.paddle.height/2 - 1;
	Phaser.Rope.prototype.update.apply(this);
}