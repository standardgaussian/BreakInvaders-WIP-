"use strict";
window.BreakInvaders.state.load = {
	preload: function(){
		
		this.game.load.spritesheet('paddle', 'assets/InvaderTiles.png', 150, 15);
		
		this.game.load.spritesheet('invaders', 'assets/InvaderTiles.png',32, 32);
		this.game.load.spritesheet('wisp', 'assets/wisp.png',32,32);
        this.game.load.spritesheet('laser1', 'assets/laser1.png',3,8);
        this.game.load.spritesheet('laser2', 'assets/laser2.png',3,8);
		this.game.load.spritesheet('pLaser', 'assets/pLaser.png',3,2);
		//power ups
        this.game.load.spritesheet('fireballPower', 'assets/fireballPower.png', 12,12);
        this.game.load.spritesheet('recapturePower', 'assets/RecapturePower.png', 12,12);
		this.game.load.spritesheet('gravityPower', 'assets/gravityPower.png', 12,12);
		this.game.load.spritesheet('paddleDownPower', 'assets/PaddleDownPower.png', 12, 12);
		this.game.load.spritesheet('paddleUpPower', 'assets/PaddleUpPower.png', 12, 12);
		this.game.load.spritesheet('paddleLaser', 'assets/paddleLaser.png', 12,12);
		this.game.load.spritesheet('paddleShield', 'assets/paddleShield.png', 12,12);
		this.game.load.spritesheet('paddleKill', 'assets/paddleKill.png', 12,12);
		this.game.load.spritesheet('DurationDownPower', 'assets/DurationDownPower.png',12,12);
		this.game.load.spritesheet('DurationUpPower', 'assets/DurationUpPower.png', 12,12);
		
		//particle effects
        this.game.load.spritesheet('explodeParticles', 'assets/explodeParticles.png',2,2);
		this.game.load.spritesheet('fireParticles', 'assets/fireParticles.png', 2,2);
		this.game.load.spritesheet('parryParticles', 'assets/parryParticles.png',2,2);
		
		//maps
        this.game.load.tilemap('waveMap', 'maps/Waves.json', null, Phaser.Tilemap.TILED_JSON);
	},
	
	create: function(){
		// loading has finished - proceed to demo state
		this.game.state.start("play");
	}
};