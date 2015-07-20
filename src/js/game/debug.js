DumpCache = function(game) {

	
	console.log("Binary: ", game.cache.getKeys(Phaser.Cache.BINARY));
	console.log("BitmapData: ", game.cache.getKeys(Phaser.Cache.BITMAPDATA));
	console.log(" BitmapFont:", game.cache.getKeys(Phaser.Cache.BITMAPFONT));
	console.log(" Canvas:", game.cache.getKeys(Phaser.Cache.CANVAS));
	console.log("Images: ",game.cache.getKeys(Phaser.Cache.IMAGE));
	console.log(" JSON:", game.cache.getKeys(Phaser.Cache.JSON));
	console.log(" Physics:", game.cache.getKeys(Phaser.Cache.PHYSICS));
	console.log(" Sound:", game.cache.getKeys(Phaser.Cache.SOUND));
	console.log(" Text:", game.cache.getKeys(Phaser.Cache.TEXT));
	console.log("Texture: ",game.cache.getKeys(Phaser.Cache.TEXTURE));
	console.log("Tilemap: ",game.cache.getKeys(Phaser.Cache.TILEMAP));
	console.log("XML:", game.cache.getKeys(Phaser.Cache.XML));
};