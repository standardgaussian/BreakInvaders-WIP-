"use strict";
window.BreakInvaders.state.menu = {
	preload: function(){
		
	},
	
	create: function(){
		this.game.add.image(0,0,'cover');
		var bgOverlay = this.game.add.bitmapData(this.game.width/2 - 20, this.game.height);
		bgOverlay.context.fillStyle = "#8c8c8c";
		bgOverlay.context.fillRect(0,0, this.game.width/2 - 20, this.game.height);
		var bgOverlaySprite = this.game.add.sprite(this.game.width/2 + 20, 0, bgOverlay);
		bgOverlaySprite.blendMode = PIXI.blendModes.OVERLAY;
		bgOverlaySprite.alpha = 0.5;
		//var titleText = this.game.add.image(50, 50, this.game.mainFont);
		//this.game.mainFont.text = "BREAK INVADERS!\n Press Any Key To Play!";
		this.keyPressed = false;
		this.transition = false;
		this.buttons = VirtualButton.makeButtons(this.game);
		VirtualButton.setup(this.buttons);
		this.game.input.keyboard.addCallbacks(this, function(keyCode) {
			this.keyPressed = true;
		});	
		this.mainMenu = new MenuManager(this.game, this.game.world, this.game.width/2 + 20, 0, this.buttons);
		this.mainMenu.add("New Game", this.selectNewGame, this);
		this.mainMenu.add("Credits", this.selectCredits,this);
		this.mainMenu.add("Exit", this.selectExit, this);
		
	},
	
	update: function(){
		if (this.transition && this.timeToGo <= this.game.time.now) {
			this.game.state.start("play");
		}
	},
	
	selectNewGame: function() {
		console.log(this);
		this.game.sound.play('select1'); 
		this.transition = true; 
		this.timeToGo = this.game.time.now + 2000;
		this.mainMenu.cursorSprite.animations.currentAnim.speed *= 3;
	},
	
	selectCredits: function() {
		this.game.sound.play('select2');
		var credTimer = this.game.timer.create();
		credTimer.add(1000, function() {this.game.state.start("credits");}, this);
		this.mainMenu.cursorSprite.animations.currentAnim.speed *= 3;
	},
	
	selectExit: function() {
		this.game.sound.play('select2');
	},
};