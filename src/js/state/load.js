"use strict";
window.BreakInvaders.state.load = {
	preload: function(){
		
		//art
		this.game.load.image('cover', 'assets/downsampledCover.png');
		
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
		this.game.load.spritesheet('bounceParticles', 'assets/bounceParticles.png',2,2);
		this.game.load.spritesheet('paddleParticles', 'assets/paddleParticles.png',2,2);
		
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
		this.game.load.audio('select1', 'assets/Sound/Menu_Select_00.mp3');
		this.game.load.audio('select2', 'assets/Sound/Menu_Select_01.mp3');
		this.game.load.audio('moveCursor1' ,'assets/Sound/UI_Electric_08.mp3');
		
		//fonts
		
		this.game.load.image('font1', 'assets/fonts/fontWorkGreen.png');
	},
	
	create: function(){
		//this.game.add.image(0,0,'cover');
		
		this.setupFonts();
		// loading has finished - proceed to demo state
		var loadText = this.game.add.sprite(this.game.width/6, this.game.height/3, this.game.mainFont);
		this.game.mainFont.text = "LOADING";
		loadText.scale.x = 5;
		loadText.scale.y = 5;
		var loadingMessageTimer = this.game.time.create();
		loadingMessageTimer.loop(1000, this.loadLoop, this.game.mainFont);
		loadingMessageTimer.start();
		loadText.smoothed = false;
		this.game.sound.setDecodedCallback(['frantic1', 'beats1', 'chip1'], function() {this.game.state.start("menu");}, this);
		
		
		
	},
	
	setupFonts: function() {
		this.game.FontManager = new FontManager(this.game);
		this.game.mainFont = this.game.FontManager.createRetro('font1', "");
		//this.game.mainFont = this.game.add.retroFont('font1', 10, 21, "@ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÁ↑← !\"#$%&'()*+,-./0123456789:;<=>?", 27, 1, 2, 1, 1);
	},
	
	loadLoop: function() {
		this.text +=  ".";
		if (this.text.length > 10) {
			this.text = "LOADING";
		}
	},
};