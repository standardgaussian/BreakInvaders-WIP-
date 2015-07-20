/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//Filter that can be updated on the fly, tweened, etc:.
//the construction on filters requires a complete fragmentSrc
//this can be built on the fly, 
//but for now just assume a pre-constructed shader fragment with additional
//parameters

AdvancedFilter = function(game, uniforms, fragmentSrc) {
	Phaser.Filter.apply(this, arguments);
	this.params = {};
	this.dirtyFragment = false;
	this.lastCompile = this.game.time.now;
	this.registerResize();
	this.game.scale.onSizeChange.add(this.registerResize, this);
	
	this.dirtyAnchor = [];
	//debug
	this.testAnchor = true;
};

AdvancedFilter.prototype = Object.create(Phaser.Filter.prototype);
AdvancedFilter.prototype.constructor = AdvancedFilter;

AdvancedFilter.COMPILE_DELAY = 100;	//max rate at which the shaders can be updated

AdvancedFilter.prototype.createParameter = function(name, line, type, value, immediate) {
	if (typeof immediate === 'undefined') {immediate = true;};
	this.params[name] = {value: value, line: line, type: type, immediate: !!immediate};
	if (immediate) {
		this.setParam(name);
	}
	Object.defineProperty(this, name, {
		get: function() {
			return this.params[name].value;
		},
		set: function(value) {
			if (value != this.params[name].value) {
				this.params[name].oldValue = this.params[name].value;
				this.params[name].value = value;
				this.setParam(name);
			}
		}
	});
	
};

//if your shader assumes constant parameters, as they tend to, you can use this to create an invariant relationship
//so there is continuity when you alter parameters
AdvancedFilter.prototype.anchorParameter = function(name, anchorUniform, relationCallback) {
	this.params[name].anchor = {uniform: anchorUniform, callback: relationCallback};
};

AdvancedFilter.prototype.changeParam = function(name, value) {
	if (typeof this.params[name] === 'undefined') {
		console.log("Error: Cannot change nonexistant parameter on filter");
		return false;
	}
	this.params[name].value = value;
	return true;
};

AdvancedFilter.prototype.setParam = function(name) {
	var paramObj = this.params[name];
	if (paramObj === null || typeof paramObj === 'undefined') {
		console.log("Error: Cannot set nonexistant parameter on filter");
		return false;
	}
	this.fragmentSrc[paramObj.line] = "const " + paramObj.type.toString() + " " + name + " = " + paramObj.value.toString() + ";";
	//if we have an anchored relationship with a uniform, we need to adjust that uniform before we proceed
	if (paramObj.anchor) {
		//this.dirtyAnchor.push(paramObj);
		/*
		var newUni = paramObj.anchor.callback(paramObj.oldValue, paramObj.value, paramObj.anchor.uniform.value);
		paramObj.anchor.uniform.anchorDiff = paramObj.anchor.uniform.value - newUni;
		if (this.testAnchor == true) {
			console.log("Old speed: ", paramObj.oldValue);
			console.log("New speed: ", paramObj.value);
			console.log("Old time: ", paramObj.anchor.uniform.value);
			console.log("New time: ", newUni);
			console.log("oldInvariant:", paramObj.oldValue*paramObj.anchor.uniform.value);
			console.log("newInvariant:", newUni*paramObj.value);
			this.testAnchor = false;
		}*/
	}
	
	
	//MAGIC
	//Clear shaders for re-compile
	this.dirtyFragment = true;
	this.shaders = [];
	return true;
};

AdvancedFilter.prototype.update = function(pointer) {
	//dump time uniform
	if (typeof pointer !== 'undefined')
        {
            var x = pointer.x / this.game.width;
            var y = 1 - pointer.y / this.game.height;

            if (x !== this.prevPoint.x || y !== this.prevPoint.y)
            {
                this.uniforms.mouse.value.x = x.toFixed(2);
                this.uniforms.mouse.value.y = y.toFixed(2);
                this.prevPoint.set(x, y);
            }
        }
		console.log(this.uniforms.time.value);
		this.uniforms.time.value += this.game.time.elapsedSince(this.uniforms.time.value);
		//You find the invariant, but by the time update is run again, the time has changed!
		//Instead, note that an anchor update is required, and then, here, find the difference
		//between the invariant value it WOULD have if the old parameter were here, and adjust then
		while (this.dirtyAnchor.length > 0) {
			var paramObj = this.dirtyAnchor.pop();
			var newUni = paramObj.anchor.callback(paramObj.oldValue, paramObj.value, paramObj.anchor.uniform.value);
			paramObj.anchor.uniform.anchorDiff = paramObj.anchor.uniform.value - newUni;
			paramObj.anchor.uniform.value -= paramObj.anchor.uniform.anchorDiff;
		}
	
	//Phaser.Filter.prototype.update.call(this, pointer);
	/*
	if (this.dirtyFragment == true && this.lastCompile + AdvancedFilter.COMPILE_DELAY <= this.game.time.now) {
		this.shaders = [];
		this.dirtyFragment = false;
		this.lastCompile = this.game.time.now;
	}*/
};


//Ignores limit on compile frequency
//Using this function has the potential to cause significant slowdown if continuously updating the fragment source like during a tween
//Only do this if absolutely necessary
AdvancedFilter.prototype.forceCompile = function() {
	this.shaders = [];
	this.dirtyFragment = false;
	this.lastCompile = this.game.time.now;
};

AdvancedFilter.prototype.registerResize = function() {
	this.setResolution(this.game.width, this.game.height);
};