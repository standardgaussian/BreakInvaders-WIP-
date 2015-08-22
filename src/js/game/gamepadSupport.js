//set up support for gamepad

gamepadCallbacks = {};

gamepadCallbacks.onConnect = function() {
	var pad = this.game.input.gamepad.pad1;
	this.buttons.left.attachPadButton(pad.getButton(Phaser.Gamepad.XBOX360_DPAD_LEFT));
	this.buttons.right.attachPadButton(pad.getButton(Phaser.Gamepad.XBOX360_DPAD_RIGHT));
	this.buttons.action1.attachPadButton(pad.getButton(Phaser.Gamepad.XBOX360_A));
	this.buttons.action2.attachPadButton(pad.getButton(Phaser.Gamepad.XBOX360_B));
	
};