/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


//game hud elements as a group
//encompasses other information

HUD = function(game, state) {
	Phaser.Group.call(this, game);
	this.playState = state;
	this.scoreText = this.game.add.text(this.game.const.SCORE_X, this.game.const.SCORE_Y, this.playState.score, {
       	font: "32px Arial",
       	fill: "#FFFFFF",
       	align: "center"
    }, this);
	this.scoreText.smoothed = false;
		
	this.recaptureText = this.game.add.text(this.game.const.CAPTURE_X, this.game.const.CAPTURE_Y, this.playState.player.recaptureTally, {
       	font: "32px Arial",
       	fill: "#FFFFFF",
       	align: "center"
    }, this);
	this.recaptureText.smoothed = false;
	this.laserText = this.game.add.text(this.game.const.LASER_X, this.game.const.LASER_Y, this.playState.player.laserCount, {
		font: "32px Arial",
       	fill: "#FFFFFF",
       	align: "center"
   	}, this);
	this.laserText.smoothed = false;
	this.HUDoutlineColor = 0xfa06fe;
	this.HUDoutlineWidth = 10;
	this.outlineColorTween = this.game.add.tween(this);
	this.outlineColorTween.to({HUDoutlineWidth: 2}, 500, null, false, 0, -1, true);
	this.outlineColorTween.start();
	this.hudElement = this.game.add.bitmapData(this.game.width, this.game.const.HUD_SIZE);
	this.hudElementSprite = this.game.add.sprite(0,0, this.hudElement, 0);
	
	this.game.add.existing(this);
	
};

HUD.prototype = Object.create(Phaser.Group.prototype);
HUD.prototype.constructor = HUD;

HUD.const = {WIDTH1: 25, WIDTH2: 75, POS1: 100, POS2: 150};

HUD.prototype.update = function() {
	this.scoreText.setText(this.playState.score);
	this.recaptureText.setText(this.playState.player.recaptureTally);
	this.laserText.setText(this.playState.player.laserCount);
	
	//this.outlineColor = Phaser.Color.HSLtoRGB(this.outlineColorHue, 1,1);
	//this.HUDoutlineColor.a = 1;
	//draw the borders
	//this.hudElement = this.game.add.bitmapData(this.game.width, this.game.const.HUD_SIZE);
	var ctx = this.hudElement.context;
	ctx.clearRect(0,0, this.game.width, this.game.const.HUD_SIZE);
	//ctx.strokeStyle = 'Phaser.Color.getWebRGB(this.outlineColor);'
	ctx.lineWidth = this.HUDoutlineWidth;
	var color = Phaser.Color.getRGB(this.HUDoutlineColor);
	this.hudElement.context.strokeStyle = "rgba(" + color.r + "," + color.g +"," + color.b +",1)";
	ctx.strokeRect(0,0, this.game.width, this.game.const.HUD_SIZE);
	this.hudElement.dirty = true;
	
	this.hudElementSprite.loadTexture(this.hudElement);
	//this.hudElement.draw();
	
};