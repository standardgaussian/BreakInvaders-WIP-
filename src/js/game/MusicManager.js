/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

MusicManager = function(game) {
	this.game = game;
	this.tracks = [];
	this.activeTrack = null;
	this.masterVolume = 0.3;
	this.fadeOutTime = 1000;	//coarse fading, doesn't use events
	this.fadeInTime = 2000;
	this.maxTrackWaves = 2;
};

MusicManager.prototype = Object.create(Object.prototype);
MusicManager.prototype.constructor = MusicManager;

MusicManager.prototype.add = function(key) {
	this.tracks.push(this.game.sound.add(key, this.masterVolume, true));
};

//play a specific track, or something random if no key provided
MusicManager.prototype.play = function(key, volume) {
	if (key === 'undefined') {
		return this.playAny();
	}
	var newTrack = null;
	if (volume === 'undefined') {volume = 1};
	for (var i = 0; i < this.tracks.length; i++) {
		if (this.tracks[i].name == key) {
			newTrack = this.tracks[i].play(null, 0, this.masterVolume, true);
		}
	}
	
	if (newTrack) {
		this.stopActive();
		this.activeTrack = newTrack;
	}
	return this.activeTrack;
	
};

MusicManager.prototype.playAny = function() {
	var rand = this.game.rnd.between(0, this.tracks.length - 1);
	this.stopActive();
	this.activeTrack = this.tracks[rand].play("",0,this.masterVolume,true);
};

MusicManager.prototype.stopActive = function() {
	if (this.activeTrack) {
		this.activeTrack.stop();
	}
	this.activeTrack = null;
};

MusicManager.prototype.listenTo = function(obj) {
	if (obj instanceof Director) {
		obj.events.onNewWave.add(this.newWave, this);		
	}
};

MusicManager.prototype.newWave = function(currentWave) {
	if (!this.activeTrack || (currentWave-1) % this.maxTrackWaves == 0 ) {
		this.playAny();
		return;
	}
	
};
//neither fadeIn nor fadeOut care about volume
MusicManager.prototype.fadeIn = function(duration, volume, track) {
	if (track === undefined) {track = this.activeTrack};
	if (track.isPlaying) {
		track.fadeIn(duration, volume);
	}
	else {
		track.onPlay.addOnce(function(duration, volume) {this.fadeIn(duration, volume);}, track, 0, duration, volume);
	}
};

MusicManager.prototype.fadeOut = function(duration, volume, track) {
	if (track === undefined) {track = this.activeTrack};
	if (track.isPlaying) {
		track.fadeOut(duration, volume);
	}
	else {
		track.onPlay.addOnce(function(duration, volume) {this.fadeOut(duration, volume);}, track, 0, duration, volume);
	}
};

MusicManager.prototype.fadeTo = function(duration, volume, track) {
	if (track === undefined) {track = this.activeTrack};
	if (track.isPlaying) {
		track.fadeTo(duration, volume);
	}
	else {
		track.onPlay.addOnce(function(duration, volume) {this.fadeIn(duration);}, track, 0, duration, volume);
	}
};