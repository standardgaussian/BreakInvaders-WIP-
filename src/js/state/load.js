"use strict";
window.BreakInvaders.state.load = {
	preload: function(){
		
		this.game.load.spritesheet('paddle', 'assets/paddle.png', 150, 15);
		
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
		for(var i = 1; i < 6; i++) {
			this.game.load.tilemap('wave' + i.toString(), 'maps/wave' + i.toString() + '.json', null, Phaser.Tilemap.TILED_JSON);
		}
		
		//sounds
		this.game.load.audio('bounce1', 'assets/Sound/UI_Electric_01.mp3');
		this.game.load.audio('kill1', 'assets/Sound/UI_Synth_05.mp3');
		this.game.load.audio('paddleLaser', 'assets/Sound/bigShot.wav');
		this.game.load.audio('paddleLaserStrong', 'assets/Sound/Futuristic Shotgun Single Shot.wav');
		this.game.load.audio('warpIn', 'assets/Sound/Laser_07.mp3');
		
		//music
		this.game.load.audio('frantic1', 'assets/Sound/Hit Them Harder_0.mp3');
		this.game.load.audio('beats1','assets/Sound/Xenocity - Digital Acid (HD).mp3');
		this.game.load.audio('chip1', 'assets/Sound/Pocket Destroyer_0.mp3');
	},
	
	create: function(){
		// loading has finished - proceed to demo state
		var loadText = this.game.add.text(this.game.width/4, this.game.height/2, "CHARGING PADDLE...", {
			font: "32px Arial",
			fill: "#FFFFFF",
			align: "center"
		 });
		 loadText.smoothed = false;
		this.game.sound.setDecodedCallback(['frantic1', 'beats1', 'chip1'], function() {this.game.state.start("play");}, this);
		
		
		
	}
};