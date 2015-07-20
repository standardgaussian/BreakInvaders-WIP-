"use strict";
window.BreakInvaders = {
	
	// reference to the Phaser.Game instance
	game: null,
	
	// main function
	main: function(){
		this.game = new Phaser.Game(800, 400, Phaser.WEBGL, document.body, window.BreakInvaders.state.boot);
	},
	
	// here we will store all states
	state: {}, 
},

window.addEventListener('DOMContentLoaded', function(){
	window.BreakInvaders.main();
}, false);