/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//Defines a menu object, as in the main and pause menus

MenuManager = function(game, parent, x, y, inputs, params) {
	if (params === undefined) { params = {}};
	Phaser.Group.call(this, game, parent);
	this.x = x;
	this.y = y;
	this.items = [];
	this.startX = params.startX || 40;
	this.startY = params.startY || 0;
	this.spaceY = params.spaceY || 60;
	this.cursor = -1;
	this.cursorSprite = this.game.add.sprite(0,0, 'invaders',0, this);
	this.cursorSprite.animations.add('idle', [0,5], 2, true);
	this.cursorSprite.animations.play('idle');
	this.cursorSprite.scale.x = 1.5;
	this.cursorSprite.scale.y = 1.5;
	this.inputs = inputs;
	this.enabled = true;
};

MenuManager.prototype = Object.create(Phaser.Group.prototype);
MenuManager.prototype.constructor = MenuManager;

MenuManager.prototype.update = function() {
	if (!this.enabled) {
		return;
	}
	if (this.inputs.down.isDown && this.inputs.down.justDown) {
		this.cursor++;
		this.game.sound.play('moveCursor1');
		if (this.cursor >= this.children.length) {
			this.cursor = 1;
		}
	}
	else if (this.inputs.up.isDown && this.inputs.up.justDown) {
		this.cursor--;
		this.game.sound.play('moveCursor1');
		if (this.cursor < 1) {
			this.cursor = this.children.length -1;
		}
	}
	else if (this.inputs.action1.isDown && this.inputs.action1.justDown || this.inputs.action2.isDown && this.inputs.action2.justDown) {
		this.select(this.children[this.cursor]);
		this.enabled = false;
	}
	if (this.cursor < 0) {
		this.cursorSprite.visible = 0;
	}
	else {
		this.cursorSprite.visible = 1;
		this.cursorSprite.x = this.children[this.cursor].x - 45;
		this.cursorSprite.y = this.children[this.cursor].y -5;
	}
};

MenuManager.prototype.add = function(text, callback, context) {
	var newItemText = this.game.FontManager.createRetro('font1', text);
	var newItem = this.game.add.sprite(this.startX, this.spaceY*(this.children).length, newItemText, 0, this);
	newItem.scale.x = 2;
	newItem.scale.y = 2;
	newItem.selectCallback = callback;
	newItem.selectCallbackContext = context;
	if (this.cursor < 0) {
		this.cursor = 1;
	}
};


MenuManager.prototype.select = function(item) {
	if (item.selectCallback) {
		item.selectCallback.apply(item.selectCallbackContext);
	}
};