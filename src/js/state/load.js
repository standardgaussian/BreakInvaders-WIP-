"use strict";
window.BreakInvaders.state.load = {
	preload: function(){
		this.game.load.spritesheet('invaders', 'assets/InvaderTiles.png',32, 32);
        this.game.load.spritesheet('laser1', 'assets/laser1.png',3,8);
        this.game.load.spritesheet('laser2', 'assets/laser2.png',3,8);
        this.game.load.spritesheet('fireballPower', 'assets/fireballPower.png', 12,12);
        this.game.load.spritesheet('recapturePower', 'assets/RecapturePower.png', 12,12);
		this.game.load.spritesheet('gravityPower', 'assets/gravityPower.png', 12,12);
        this.game.load.spritesheet('explodeParticles', 'assets/explodeParticles.png',2,2);
		this.game.load.spritesheet('fireParticles', 'assets/fireParticles.png', 2,2);
		this.game.load.spritesheet('parryParticles', 'assets/parryParticles.png',2,2);
        this.game.load.tilemap('waveMap', 'maps/Waves.json', null, Phaser.Tilemap.TILED_JSON);
	},
	
	create: function(){
		// loading has finished - proceed to demo state
		this.game.state.start("play");
	}
};