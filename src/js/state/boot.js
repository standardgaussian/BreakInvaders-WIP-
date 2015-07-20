"use strict";
window.BreakInvaders.state.boot = {
	preload: function(){
		// set world size
		this.game.world.setBounds(0, 0, 800, 400);
		
		this.enableScaling();

	},
	create: function(){
		// add all game states
		for(var stateName in window.BreakInvaders.state){
			this.game.state.add(stateName, window.BreakInvaders.state[stateName]);
		}
		
		// goto load state
		this.game.state.start("load");
	},
	enableScaling: function(){
		var game = this.game;
		game.scale.parentIsWindow = (game.canvas.parentNode == document.body);
		game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
		//game.scale.pageAlignVertically = true;
		//game.scale.pageAlignHorizontally = true;
	}
};