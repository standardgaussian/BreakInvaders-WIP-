/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

Backgrounds = function(game) {
	this.game = game;
};
Backgrounds.prototype = Object.create(Object.prototype);
Backgrounds.prototype.constructor = Backgrounds;


Backgrounds.prototype.filteredBG = function(dest) {
	if (typeof dest === 'undefined' || dest === null) {
		dest = this.game.add.sprite(0,0);
		dest.width = this.game.world.width;
		dest.height = this.game.world.height;
	}
	var filt = dest.filt = new Phaser.Filter(this.game, null, Backgrounds.filterSrcLevel);
	filt.setResolution(this.game.width, this.game.height);
	dest.filtUni = new Phaser.Point(this.game.width/2, this.game.height/2);
	
	dest.update = function() {
		this.filters[0].update(this.filtUni);
	};
	dest.alpha = 1;
	
	//define filter states
	//dest.level = {speed: 0.003, density: 0.002, shape: 0.01};
	//dest.transit = {speed: 0.005, density: 0.002, shape: 0.01};
	dest.level = {speed: 0.003, shape: 0.04};
	dest.transit = {speed: 0.005, shape: 0.04};
	
	dest.filters = [filt];
	
	
	return dest;
	
};
	

Backgrounds.prototype.makeBG = function(dest) {
	var bg = this.game.make.bitmapData(this.game.world.width, this.game.world.height);
	//bg.rect(0,0, this.game.world.width, this.game.world.height, 'rgba(0,0,0,1)');
	this.addStars(bg);
	//this.addPlanets(bg);
	//bg.rect(0,0, this.game.world.width, this.game.world.height, '#edFF09');
	bg.update();
	var pix = Phaser.Color.createColor();
	var pixVal = bg.getPixel32(0,0);
	//console.log(bg.getPixel32(0,1));
	//console.log(Phaser.Color.unpackPixel(bg.getPixel32(0, 1), pix, true));
	//console.log(Phaser.Color.getGreen(pixVal));
	//bg.setHSL(1, 1, null);
	//console.log(bg.getPixel32(0,0));
	bg.update();
	console.log(Phaser.Color.unpackPixel(bg.getPixel32(0, 1), pix, true));
	if (typeof dest === 'undefined' || dest === null) {
		return (dest = this.game.add.sprite(0,0, bg));
	}
	dest.loadTexture(bg);
};

//const config, load config later
Backgrounds.prototype.addStars = function(bg) {
	var maxSlots = this.game.width * this.game.height;
	var percMin = maxSlots*.001;
	var percMax = maxSlots*0.003;
	//generate a sequence of points that will be stars
	var num = this.game.rnd.integerInRange(percMin, percMax);
	//bg.rect(0,0, 2,2, 'rgba(254,255,255,1)');
	//bg.setPixel32(368,123, 255, 255, 255, 255, true);
	bg.rect(0,0, this.game.width,this.game.height, 'rgba(0,255,255,0.3)');
	console.log(bg.getPixel32(0,1));
	//bg.setPixel32(368,123, 255, 255, 255, 255, true);
	//bg.update();
	//bg.context.putImageData(bg.imageData,0,0);
	//bg.dirty = true;
	
	/*
	for (var i = 0; i < num; i++) {
		bg.rect(this.game.rnd.integerInRange(0, this.game.width), this.game.rnd.integerInRange(0,this.game.height), 2,2, 'rgba(255,255,255, 1)');
	}*/
};

//simple, just add one maybe
Backgrounds.prototype.addPlanets = function(bg) {
	var planRad = this.game.rnd.integerInRange(16, 80);
	var r = this.game.rnd.integerInRange(0, 255);
	var g = this.game.rnd.integerInRange(0,255);
	var b = this.game.rnd.integerInRange(0,255);
	var fillStr = 'rgba('+r.toString()+','+g.toString()+','+b.toString()+', 0.5)';
	var xp = this.game.rnd.integerInRange(0, this.game.width);
	var yp = this.game.rnd.integerInRange(0, this.game.height);
	bg.circle(xp,yp, planRad, '#000000');
	bg.circle(xp, yp, planRad, 'rgba('+r.toString()+','+g.toString()+','+b.toString()+', 1)');
};

//  From http://glslsandbox.com/e#5891
Backgrounds.filterSrcOrig = [
        "precision mediump float;",
        "uniform float     time;",
        "uniform vec2      resolution;",
        "uniform vec2      mouse;",

        "const float Tau        = 6.2832;",
        "const float speed  = .02;",
        "const float density    = .04;",
        "const float shape  = .04;",

        "float random( vec2 seed ) {",
            "return fract(sin(seed.x+seed.y*1e3)*1e5);",
        "}",

        "float Cell(vec2 coord) {",
            "vec2 cell = fract(coord) * vec2(.5,2.) - vec2(.0,.5);",
            "return (1.-length(cell*2.-1.))*step(random(floor(coord)),density)*2.;",
        "}",

        "void main( void ) {",

            "vec2 p = gl_FragCoord.xy / resolution  - mouse;",

            "float a = fract(atan(p.x, p.y) / Tau);",
            "float d = length(p);",

            "vec2 coord = vec2(pow(d, shape), a)*256.;",
            "//vec2 delta = vec2(-time*speed*256., .5);",
            "//vec2 delta = vec2(-time*speed*256., cos(length(p)*10.)*2e0+time*5e-1); // wavy wavy",

            "float c = 0.;",
            "for(int i=0; i<3; i++) {",
                "coord += delta;",
                "c = max(c, Cell(coord));",
            "}",

            "gl_FragColor = vec4(c*d);",
        "}"
    ];
	Backgrounds.filterSrcTransit = [
        "precision mediump float;",
        "uniform float     time;",
        "uniform vec2      resolution;",
        "uniform vec2      mouse;",

        "const float Tau        = 6.2832;",
        "const float speed  = .02;",
        "const float density    = .04;",
        "const float shape  = .04;",

        "float random( vec2 seed ) {",
            "return fract(sin(seed.x+seed.y*1e3)*1e5);",
        "}",

        "float Cell(vec2 coord) {",
            "vec2 cell = fract(coord) * vec2(.5,2.) - vec2(.0,.5);",
            "return (1.-length(cell*2.-1.))*step(random(floor(coord)),density)*2.;",
        "}",

        "void main( void ) {",

            "vec2 p = gl_FragCoord.xy / resolution  - mouse;",

            "float a = fract(atan(p.x, p.y) / Tau);",
            "float d = length(p);",

            "vec2 coord = vec2(pow(d, shape), a)*256.;",
            "vec2 delta = vec2(-time*speed*256., .5);",
            "//vec2 delta = vec2(-time*speed*256., cos(length(p)*10.)*2e0+time*5e-1); // wavy wavy",

            "float c = 0.;",
            "for(int i=0; i<3; i++) {",
                "coord += delta;",
                "c = max(c, Cell(coord));",
            "}",

            "gl_FragColor = vec4(c*d);",
        "}"
    ];
//modified filter src
Backgrounds.filterSrcLevel = [
        "precision mediump float;",
        "uniform float     time;",
        "uniform vec2      resolution;",
        "uniform vec2      mouse;",
		
        "const float Tau        = 6.2832;",
        "const float speed  = .02;",
        "const float density    = .02;",
        "const float shape  = .04;",

        "float random( vec2 seed ) {",
            "return fract(sin(seed.x+seed.y*1e3)*1e5);",
        "}",

        "float Cell(vec2 coord) {",
            "vec2 cell = fract(coord) * vec2(.5,2.) - vec2(.0,.5);",
            "return (1.-length(cell*2.-1.))*step(random(floor(coord)),density)*2.;",
        "}",

        "void main( void ) {",

            "vec2 p = gl_FragCoord.xy / resolution  - mouse;",

            "float a = fract(atan(p.x, p.y) / Tau);",
            "float d = length(p);",

            "vec2 coord = vec2(pow(d, shape), a)*256.;",
			"//vec2 delta = vec2(0,0);",
            "vec2 delta = vec2(-time*speed*256., .5);",
            "//vec2 delta = vec2(-time*speed*256., cos(length(p)*10.)*2e0+time*5e-1); // wavy wavy",

            "float c = 0.;",
            "for(int i=0; i<3; i++) {",
                "coord += delta;",
                "c = max(c, Cell(coord));",
            "}",

            "gl_FragColor = vec4(c*d);",
        "}"
    ];
	
	
	Backgrounds.filterTweenable = [
        "precision mediump float;",
        "uniform float     timespeed;",
        "uniform vec2      resolution;",
        "uniform vec2      mouse;",
		
        "const float Tau        = 6.2832;",
        "const float speed  = .02;",
        "const float density    = .02;",
        "const float shape  = .04;",

        "float random( vec2 seed ) {",
            "return fract(sin(seed.x+seed.y*1e3)*1e5);",
        "}",

        "float Cell(vec2 coord) {",
            "vec2 cell = fract(coord) * vec2(.5,2.) - vec2(.0,.5);",
            "return (1.-length(cell*2.-1.))*step(random(floor(coord)),density)*2.;",
        "}",

        "void main( void ) {",

            "vec2 p = gl_FragCoord.xy / resolution  - mouse;",

            "float a = fract(atan(p.x, p.y) / Tau);",
            "float d = length(p);",

            "vec2 coord = vec2(pow(d, shape), a)*256.;",
			"//vec2 delta = vec2(0,0);",
            "vec2 delta = vec2(-timespeed*256., .5);",
            "//vec2 delta = vec2(-timespeed*256., cos(length(p)*10.)*2e0+time*5e-1); // wavy wavy",

            "float c = 0.;",
            "for(int i=0; i<3; i++) {",
                "coord += delta;",
                "c = max(c, Cell(coord));",
            "}",

            "gl_FragColor = vec4(c*d);",
        "}"
    ];