"use strict";
window.BreakInvaders.state.play = {
	
	
	
	preload: function(){
		console.log("loading play state");
	},
	
	create: function(){
		console.log("starting play state");
		this.game.canvas.playState = this;
		this.game.physics.startSystem(Phaser.Physics.P2JS);
		this.game.physics.p2.setBounds(0,0, this.game.width, this.game.height + 100);
		this.game.physics.p2.restitution = 1;
		this.game.physics.p2.updateBoundsCollisionGroup();
		this.game.physics.p2.setImpactEvents(true);
		
		this.game.const = {KILL_PLANE: 64, COL_PADDLE: this.game.physics.p2.createCollisionGroup(),
						   COL_BALL: this.game.physics.p2.createCollisionGroup(),
						   COL_INVADER: this.game.physics.p2.createCollisionGroup(),
						   COL_LASER: this.game.physics.p2.createCollisionGroup(),
						   SCORE_X: 20, SCORE_Y: this.game.height - 50,
						   CAPTURE_X: this.game.width - 50, CAPTURE_Y: this.game.height - 50,
						   LASER_X: 20, LASER_Y: 0,
						   MIN_ANGLE: 20,
						   GLOBAL_TIMER: 7500,
						  		};
		

		
		//create primary elements
		this.backgrounds = new Backgrounds(this.game);
		//this.bg = this.backgrounds.makeBG();
		this.bg = this.game.bg =  this.backgrounds.filteredBG();
		this.player = this.game.player = Paddle.getPaddle(this.game);
		this.game.ball = this.ball = Ball.makeBall(this.game, this.player);
		this.ball.held = true;
		this.ball.heldBy = this.player;
		this.player.isHolding = true;
		Invaders.init(this.game, 'invaders');
		this.invaders = this.game.add.group(); //empty group to start
		this.paddleGroup = this.game.add.group();
		this.paddleGroup.addChild(this.game.player);
		this.game.player.paddleGroup = this.paddleGroup;
		this.invaders.classType = Invader;
		Invader.makeTexture(this.game);
		
		this.buttons = VirtualButton.makeButtons(this.game);
		VirtualButton.setup(this.buttons);
		VirtualButton.addMotion(this.buttons);
		
		this.cursors = this.game.input.keyboard.createCursorKeys();
		this.special = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		this.shoot = this.game.input.keyboard.addKey(Phaser.Keyboard.X);
		
		
		this.game.input.gamepad.addCallbacks(this, gamepadCallbacks);
		this.game.input.gamepad.start();
		if (this.game.input.gamepad.padsConnected > 0) {
			gamepadCallbacks.onConnect.apply(this);	//set up directly	
		}
		
		//movement-related events
		//general move callback to hook into Virtual Button system
		this.game.input.addMoveCallback(function(pointer, x,y, isDown) {
			for (var button in this.buttons) {
					this.buttons[button].movementPoll(pointer, x,y,isDown);
				}
			}, this);
		
		this.game.input.onDown.add(this.game.input.mouse.requestPointerLock, this.game.input.mouse);
		this.game.input.mouse.capture = false;
		this.game.input.mouse.requestPointerLock();
		this.game.input.mouse.callbackContext = this;
		this.game.input.mousePointer.prevPos = new Phaser.Point(-1,-1);
		this.game.input.mouse.mouseMoveCallback = function(event) {
			for (var button in this.buttons) {
					this.buttons[button].movementPoll(event);
				}
			};
		//srsly?
		this.game.canvas.onmousemove = function(event) {
			for (var button in this.playState.buttons) {
					this.playState.buttons[button].movementPoll(event);
				}
			this.playState.game.input.mousePointer.position.copyTo(this.playState.game.input.mousePointer.prevPos);	
		};
	/*	VirtualButton.addMotion(this.buttons);
		this.game.input.mousePointer.moveCallback = function(event) {
			for (var button in this.buttons) {
				this.buttons[button].movementPoll(event);	
			}
		};*/
		this.score = 0;
		
		this.scoreText = this.game.add.text(this.game.const.SCORE_X, this.game.const.SCORE_Y, this.score, {
        	font: "32px Arial",
        	fill: "#FFFFFF",
        	align: "center"
    	});
		
		this.recaptureText = this.game.add.text(this.game.const.CAPTURE_X, this.game.const.CAPTURE_Y, this.player.recaptureTally, {
        	font: "32px Arial",
        	fill: "#FFFFFF",
        	align: "center"
    	});
		
		this.laserText = this.game.add.text(this.game.const.LASER_X, this.game.const.LASER_Y, this.player.laserCount, {
			font: "32px Arial",
        	fill: "#FFFFFF",
        	align: "center"
    	});
		this.director = new Director(this.game, this,1);
		
		//listen to the director
		this.ball.listenTo(this.director);
		this.player.listenTo(this.director);
		Powerup.listenTo(this.director);
		
		//global timer
		this.game.globalEvent = new Phaser.Signal();
		this.game.globalEventTimer = this.game.time.create();
		this.game.globalEventTimer.loop(this.game.const.GLOBAL_TIMER, function() {this.globalEvent.dispatch();}, this.game);
		this.game.globalEventTimer.start();
		
		this.director.start();

		
	},
	
	makeBG: function() {
		var bg = this.game.make.bitmapData(this.game.world.width, this.game.world.height);
		bg.rect(0,0, this.game.world.width, this.game.world.height, 0x000000);
		var bgsprite = this.game.add.sprite(0,0, bg);
		return bgsprite;
	}, 
	
	
	//first, do input the dumb way. Do it smart later.
	update: function(){
		//debug: check DOM elements
		
		//debug: report angle
		//console.log("Angle: ", 180*Math.atan2(this.ball.body.velocity.y, this.ball.body.velocity.x)/Math.PI);
		//console.log("# of gamepads connected: ", this.game.input.gamepad.padsConnected);
		this.director.update();
		if (this.ball.body.y >= this.game.height) {
			//kill condition
			//this.game.state.start("boot");
		}
		if (this.buttons.left.isDown && this.player.body.x - this.player.width/2 > this.game.world.bounds.left) {
			//this.paddleGroup.forEach(function(child) { child.body.velocity.x = -900;}, this.paddleGroup);
			this.player.body.velocity.x = -900;	
			
		}
		
		else if (this.buttons.right.isDown && this.player.body.x + this.player.width/2 < this.game.world.bounds.right) {
			//this.paddleGroup.forEach(function(child) { child.body.velocity.x = 900;}, this.paddleGroup);
			this.player.body.velocity.x = 900;	
		}
		/*
		if ((this.cursors.left.isDown || this.game.input.gamepad.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT)) && this.player.body.x - this.player.width/2 > this.game.world.bounds.left) {
			this.player.body.velocity.x = -500;
		}
	
		else if ((this.cursors.right.isDown || this.game.input.gamepad.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT)) && this.player.body.x + this.player.width/2 < this.game.world.bounds.right) {
			this.player.body.velocity.x = 500;
		}
		*/
		else {
			//this.paddleGroup.forEach(function(child) { child.body.velocity.x = 0;}, this.paddleGroup);
			this.player.body.velocity.x = 0;	
		}
		
		if (this.buttons.action1.isDown && this.buttons.action1.justDown) {
			if (this.ball.held) {
				this.ball.held = false;
				this.player.isHolding = false;
				this.ball.body.velocity.y = -Ball.const.BALL_SPEED*Math.sin(Ball.const.START_ANGLE);
				//this.ball.body.velocity.x = ((this.game.rnd.angle() > 0) ? -1 : 1)*Ball.const.BALL_SPEED*Math.cos(Ball.const.START_ANGLE); 
			}
			else if (this.player.recaptureTally > 0) {
				this.ball.held = true;
				this.ball.heldBy = this.player;
				this.player.recaptureTally--;
				this.player.isHolding = true;
			}
		}
		
		if (this.buttons.action2.isDown && this.buttons.action2.justDown) {
			if (this.player.laserCount > 0) {
				this.player.laserCount--;
				new PaddleLaser(this.game, this.player.x, this.player.y - this.player.height/2);
			}
		}
		//update score
		this.scoreText.setText(this.score);
		this.recaptureText.setText(this.player.recaptureTally);
		this.laserText.setText(this.player.laserCount);
		
	},
	
	//called through callbacks
	updateScore: function() {
			this.stateCtx.score += this.wasDestroyed.points;
	},
	

	
};