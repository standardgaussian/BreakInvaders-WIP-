/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

FontManager = function(game) {
	this.game = game;
	
	};
	
FontManager.prototype = Object.create(Object.prototype);
FontManager.prototype.constructor = FontManager;

FontManager.prototype.createRetro = function(key, text) {
	var retro = this.game.add.retroFont(key, 10, 21, "@ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÁ↑← !\"#$%&'()*+,-./0123456789:;<=>?", 27, 1, 2, 1, 1);
	retro.text = text;
	return retro;
};
