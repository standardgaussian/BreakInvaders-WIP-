//director class
//The equivalent of an "AI" for the enemy waves
//decides which wave comes next, composes waves out of component units

Director = function(game, playState, difficulty) {
	this.game = game;
	this.state = playState;
	this.difficulty = difficulty;
	this.isActive = false;
	this.waveCount = 0;
	this.done = true;
	this.events = new Phaser.Events(this);
	this.events.onNewWave = new Phaser.Signal();
    this.waveMap = this.game.make.tilemap('waveMap');
	
	//background transition tweens
	this.toWarp = this.game.add.tween(this.game.bg.filters[0]);
	this.toWarp.to(this.game.bg.transit, Director.const.TRANSIT_OVERLAP);
	this.toLevel = this.game.add.tween(this.game.bg.filters[0]);	//can emulate this with a yoyo
	this.toLevel.to(this.game.bg.level, Director.const.TRANSIT_OVERLAP);
	
	return this;
};

Director.prototype = new Object();
Director.prototype.constructor = Director;

Director.const = {TRANSIT_TIME: 1000, TRANSIT_OVERLAP: 1000};

Director.prototype.start = function() {
	this.isActive = true;
	
};


Director.prototype.startWave = function() {
	//transition effects
	this.transitEffectBegin();
	this.done = false;
	var genNum = 0;
	this.currentWave = this.chooseWave(genNum);
	this.waveKey = "wave_"+ this.currentWave.toString();
	this.timer = this.game.time.create(true);
    this.timer.add(Director.const.TRANSIT_OVERLAP, this.launchWaveLayer, this, this.waveMap, this.waveKey);
	this.timer.add(Director.const.TRANSIT_TIME + Director.const.TRANSIT_OVERLAP, function(){});
    this.timer.onComplete.add(function() {this.transitEffectEnd(); this.done = true;}, this);
	this.timer.start();
};

Director.prototype.launchWaveLayer = function(map, waveKey) {
	for (var i = 1; i <= Invaders.length; i++) {
		map.createFromTiles(i, null, null, waveKey, this.state.invaders, {customClass: Invaders[i-1], frame: 0}); 	
	}
};



Director.prototype.chooseWave  = function(genNum) {
	if (!this.currentWave || typeof this.currentWave === 'undefined') {
		return 1;	
	}
	return ++this.currentWave;
};

//type is dummy for now
Director.addInvader = function (invaderType, x, y) {
		this.state.invaders.create(x,y, Invader.invaderTexture);
};

Director.prototype.setInvasionEvents = function(timer) {
	for (var i = 0; i < this.currentWave.invaders.length; i++) {
		var unit = this.currentWave.invaders[i];
		timer.add(unit.t, Director.addInvader, this, unit.type, unit.x, unit.y); 
	}
};

Director.prototype.update = function() {
	if (this.done && this.state.invaders.children.length == 0 && this.isActive) {
		this.events.onNewWave.dispatch();
		this.startWave();
		this.displayWave();
	}
};

Director.prototype.displayWave = function(num) {
	if (typeof num === 'undefined') { num = this.currentWave};
	var startText = this.game.add.text(this.game.width/3, 20, "WAVE " + num.toString() + " BEGIN!", { font: "40px Arial", fill: "#ff0044", align: "center" });
	startText.lifespan = 2000;
	startText.update = function() {
		if (this.lifespan > 0) {
        	this.lifespan -= this.game.time.physicsElapsedMS;

        	if (this.lifespan <= 0)  {
           	  this.destroy(); return;
        	}
    	}
		this.alpha = Math.abs(Math.cos(Math.PI*6*(2000 - this.lifespan)/2000));
		this.alpha = this.alpha > 0.3 ? this.alpha : 0;
	};
	
};

Director.prototype.transitEffectBegin = function() {
	this.toWarp = this.game.add.tween(this.game.bg.filters[0]);
	this.toWarp.to(this.game.bg.transit, Director.const.TRANSIT_OVERLAP);
	this.toWarp.start();
	//console.log(this.game.bg.filters[0]);
};

Director.prototype.transitEffectEnd = function() {
	//console.log(this.game.bg.filters[0].speed);
	//console.log(this.game.bg.filters[0].density);
	//console.log(this.game.bg.filters[0].shape);
	this.toLevel = this.game.add.tween(this.game.bg.filters[0]);	//can emulate this with a yoyo
	this.toLevel.to(this.game.bg.level, Director.const.TRANSIT_OVERLAP);
	this.toLevel.start();
	//this.game.bg.filterChange('levelAlt');
	//this.game.bg.filters[0].fragmentSrc[5] = "const float speed = 0.8;";
	//this.game.bg.filterChange('transit');
	//this.game.bg.filterChange('level');
	//this.waitTimer = this.game.time.create();
	//this.waitTimer.add(1000, function() {this.game.bg.filters[0].fragmentSrc[6] = "const float density  = .5;"; this.game.bg.filters = [this.game.bg.filters[0]];  console.log(this.game.bg.filters[0]);}, this);
	//this.waitTimer.start();
	
	
};