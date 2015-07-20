//Command pattern for decoupling gameplay behavior from control scheme (Etc:)

Command = function(thisObj, execute) {
	this.thisObj = thisObj;
	this.executeCommand = execute;
};

Command.prototype = Object.create(Object.prototype);
Command.prototype.constructor = Command;

Command.make = function (execute, thisObj) {
	if (typeof thisObj === 'undefined') { thisObj = null;};
	if (typeof execute === 'undefined') { execute = function() {};}; //null command
	
	return new Command(thisObj, execute);
};

Command.prototype.execute = function(thisObj) {
	if (typeof thisObj !== 'undefined') { this.executeCommand.apply(thisObj);}
	else if (typeof this.thisObj === 'undefined') { this.executeCommand.apply(this);}
	else { this.executeCommand.apply(this.thisObj)};
};

//commands


//requires
////this.const.SPEED_X
Commands.moveLeft = Command.make( function() {
	if (this.body.x - this.width/2 > this.game.world.bounds.left) {
		this.body.velocity.x = -1*this.const.SPEED_X;	
	}
});

//requires
////this.const.SPEED_X
Commands.moveRight = Command.make( function() {
	if (this.body.x + this.width/2 < this.game.world.bounds.right) {
		this.body.velocity.x = this.const.SPEED_X;	
	}
});

Commands.stop = Command.make( function() {
	this.body.velocity.x = 0;
});

//requires
////this.ballRef
////this.captureTally
Commands.captureBall = Command.make (function() {
	if (this.captureTally > 0) {
		this.ballRef.held = true;
		this.ballRef.heldBy = this.player;
		this.captureTally--;
			}
	
});
