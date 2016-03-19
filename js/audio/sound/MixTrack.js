define(["application/EventManager", "sound/MixNodeFactory"] ,function(event, mixNodeFactory) {
    "use strict";

    var MixTrack = function(context, is3dSource) {
        this.is3dSource = is3dSource;
        this.context = context;
        this.sources = [];
        this.gainNode = this.context.createGain();

        this.filterNode = this.context.createBiquadFilter();
        this.filterNode.connect(this.gainNode);
        this.analyzerNode = this.context.createAnalyser();
        this.analyzerNode.fftSize = 256;
        this.analyzerCallbacks = [];

        this.analyzerBars = 12;
        this.gainNode.connect(this.analyzerNode);

        this.bandSize = [1, 2, 4, 5, 7, 10, 16, 23, 28, 32, 36, 42, 54];
        this.bandLevels = [];
        this.data = null;

        this.lastPos = [0,0,0];
        if (is3dSource) {
            this.panNode = this.context.createPanner();
            this.gainNode.connect(this.panNode);
            this.panNode.rolloffFactor = 0.5;
        } else {
            this.panNode = mixNodeFactory.buildStereoChannelSplitter(this.gainNode, context);
            this.panNode.setPosition(0, this.context.currentTime);
        }

        this.defaultMix();
    };


    MixTrack.prototype.defaultMix = function() {
        this.setTrackGain(1, 0);
        if (!this.is3dSource) this.setTrackPan(0, 0);
        this.setFilterQValue(1, 0);
        this.setFilterFreqValue(20000, 0);
    };

    MixTrack.prototype.stopSources = function() {
        for (var i = 0; i < this.sources.length; i++) {
            this.sources[i].stop(0);
        }
        this.sources = [];
    };

    MixTrack.prototype.startSources = function(contextTime) {
        for (var i = 0; i < this.sources.length; i++) {
            this.sources[i].start(0, contextTime - this.context.resetTimeTriggeredAt);
        }
    };

    MixTrack.prototype.addSourceNode = function(node) {
        this.sources.push(node);
        node.connect(this.filterNode);
    };

    MixTrack.prototype.setTrackGain = function(gain, time) {
        if (!time) time = 0.5;
        this.gainNode.gain.linearRampToValueAtTime(gain, this.context.currentTime + time);
    };

    MixTrack.prototype.getTrackGain = function() {
        return this.gainNode.gain.value;
    };

    MixTrack.prototype.setTrackPan = function(pan, time) {
//    console.log("Pan time = ", time, track, pan)
        this.panNode.setPosition(pan, time);
        this.panNode.position = pan;
    };

    MixTrack.prototype.getTrackPan = function() {
        return this.panNode.position;
    };

    MixTrack.prototype.setFilterQValue = function(value, time) {
        if (!time) time = 0.5;
        this.filterNode["Q"].linearRampToValueAtTime( value, time+ this.context.currentTime);
    };

    MixTrack.prototype.getFilterQValue = function() {
        return this.filterNode.Q.value;
    };

    MixTrack.prototype.setFilterFreqValue = function(value, time) {
        if (!time) time = 0.5;
        this.filterNode["frequency"].linearRampToValueAtTime( value, time+ this.context.currentTime);
    };
    MixTrack.prototype.getFilterFreqValue = function() {
        return this.filterNode.frequency.value;
    };

    MixTrack.prototype.move3dSource = function(posX, posY, posZ, dt) {
        if (!this.is3dSource) alert("Error: attempt move direct sound");

        var dx = posX-this.lastPos[0];
        var dy = posY-this.lastPos[1];
        var dz = posZ-this.lastPos[2];

        var rx = Math.round(posX);
        var ry = Math.round(posY);
        var rz = Math.round(posZ);

        this.panNode.position = this.panNode.position || [];
        this.panNode.position[0] = rx;
        this.panNode.position[1] = ry;
        this.panNode.position[2] = rz;
        this.lastPos[0] = posX;
        this.lastPos[1] = posY;
        this.lastPos[2] = posZ;
        this.panNode.setPosition(posX, posY, posZ);
        this.panNode.setVelocity(dx/dt, dy/dt, dz/dt);

    };


    MixTrack.prototype.toChannel = function(channel) {
        if (this.is3dSource) alert("Error: attempt direct send 3d sound");
        this.panNode.connect(channel);
    };

    MixTrack.prototype.addAnalyseUpdateCallback = function(callback) {
        this.analyzerCallbacks.push(callback);
    };

    MixTrack.prototype.sampleMixAnalyser = function() {
        var analyzer = this.analyzerNode;

        this.data = this.data || new Uint8Array(analyzer.frequencyBinCount);

        analyzer.getByteFrequencyData(this.data);

        this.bandLevels.length = 0;
        var volumesum = 0;
        for (var i = 0; i < this.analyzerBars; i++) {
            var bandSum = 0;
            var bsize = this.bandSize[i];
            for (var j = 0; j < this.bandSize[i]; j++) {

                var binData = this.data[bsize + j];

                bandSum += binData;
            }
            var average = 0.003 * (bandSum /  bsize);

            this.bandLevels.push(average);
            volumesum += average;
        }

        this.volumesum = Math.min(2 * volumesum / this.analyzerBars, 1);
        for(var k= 0; k < this.analyzerCallbacks.length; k++) {
            this.analyzerCallbacks[k](this.bandLevels);
        }
        return this.bandLevels;
    };

    return MixTrack;
});
