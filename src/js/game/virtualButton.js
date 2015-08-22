//class that creates a virtual button interface by composition

VirtualButton = function(game, type) {
	Phaser.Key.call(this, game, 0);
	this.type = type;
	this.keys = [];
	this.padButtons = [];
	this.movementEvents = [] ;
	return this;
};

VirtualButton.prototype = Object.create(Phaser.Key.prototype);
VirtualButton.prototype.constructor = VirtualButton;

VirtualButton.TYPE_BUTTON = 1;
VirtualButton.TYPE_ANALOG = 2;


//key can either be a keycode or a key object
VirtualButton.prototype.attachKey = function(key) {
	if (key instanceof Phaser.Key) {
		this.keys.push(key);
	}
	else if (typeof key === 'number') {
		var keyObj = this.game.input.keyboard.addKey(key);
		return this.attachKey(keyObj);
	}
	key.onDown.add(this.virtOnDown, {virtKey: this, realKey: key});
	key.onUp.add(this.virtOnUp, {virtKey: this, realKey: key});
	return this;
};

VirtualButton.prototype.virtOnDown = function() {
	this.virtKey.processKeyDown(this.realKey.event);
};

VirtualButton.prototype.virtOnUp = function() {
	this.virtKey.processKeyUp(this.realKey.event);	
};

VirtualButton.prototype.attachPadButton = function(key) {
	if (key instanceof Phaser.GamepadButton) {
		this.padButtons.push(key);	
	}
	else if (typeof key === 'number') {
		var keyObj = new Phaser.GamepadButton(this.game.input.gamepad.pad1, key);
		return this.attachPadButton(keyObj);
	}
	key.onDown.add(this.virtOnDownPad, {virtKey: this, realKey: key});
	key.onUp.add(this.virtOnUpPad, {virtKey: this, realKey: key});
	
};

VirtualButton.prototype.virtOnDownPad = function(value) {
	this.realKey.processButtonDown.call(this.virtKey, value);
	this.virtKey._justDown = true;
};

VirtualButton.prototype.virtOnUpPad = function(value) {
	this.realKey.processButtonUp.call(this.virtKey, value);
	this.virtKey._justUp = true;
};

VirtualButton.buttons = ['left', 'right', 'up', 'down', 'action1', 'action2', 'debugAction', 'pause', 'menu'];

VirtualButton.makeButtons = function(game) {
	var obj = {};
	for (var i = 0; i < VirtualButton.buttons.length; i++) {
		obj[VirtualButton.buttons[i]] = new VirtualButton(game, VirtualButton.TYPE_BUTTON);	
	}
	return obj;
	
};

VirtualButton.setup = function(buttons) {
	buttons.left.attachKey(Phaser.Keyboard.LEFT);
	buttons.right.attachKey(Phaser.Keyboard.RIGHT);
	buttons.up.attachKey(Phaser.Keyboard.UP);
	buttons.down.attachKey(Phaser.Keyboard.DOWN);
	buttons.action1.attachKey(Phaser.Keyboard.Z);
	buttons.action2.attachKey(Phaser.Keyboard.X);
	buttons.debugAction.attachKey(Phaser.Keyboard.C);
	
};

//attach a callback that is called whenever the mouse moves
//Callback must return a true or false value regarding whether the movement triggered the button
VirtualButton.prototype.attachMovement = function(keyFunction) {
	this.movementEvents.push(keyFunction);
};

VirtualButton.prototype.movementPoll = function(event,pointer,x,y, isDown) {
	for (var i = 0; i < this.movementEvents.length; i++) {
		if (this.movementEvents[i].apply(this, arguments) === true) {
			this.processKeyDown(event);
		}
		else {
			this.processKeyUp(event);
		}
	}
};

VirtualButton.addMotion = function(buttons) {
	//buttons.left.attachMovement(VirtualButton.leftMove);
	//buttons.right.attachMovement(VirtualButton.rightMove);

};
//poor structure
VirtualButton.leftMove = function(event,pointer,x,y,isDown) {
	if (this.game.input.mousePointer.position.x < this.game.input.mousePointer.prevPos.x && this.game.input.mousePointer.prevPos.x != -1) {
		return true; 
	}
	else return false; 
};

VirtualButton.rightMove = function(event,pointer,x,y,isDown) {
	if (this.game.input.mousePointer.position.x > this.game.input.mousePointer.prevPos.x && this.game.input.mousePointer.prevPos.x != -1) {
		//console.log("RIGHT");
		return true;	
	}
	else return false;
};