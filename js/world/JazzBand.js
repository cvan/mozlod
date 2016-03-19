"use strict";

define([
    'goo/math/Vector3',
    "application/EventManager",
    'js/world/WorldData'
] ,function(
    Vector3,
    event,
    WorldData
    ) {
    var worldEngine;
    var audioEngine;
    var bandMembers = {};
    var device;
    var spectrumModels = {};

    var addBandToWorld = function() {
        for (var index in WorldData.JAZZ_BAND) {
            bandMembers[index] = worldEngine.addMusicEntity(index, WorldData.JAZZ_BAND[index].pos,  WorldData.JAZZ_BAND[index].trackId);
        }

        if (device == "ANDROID") {
            return;
        }

        for (index in WorldData.ANALYZER_MODELS) {
            spectrumModels[index] = worldEngine.addAnalyzerEntity(index, WorldData.ANALYZER_MODELS[index].pos, WorldData.ANALYZER_MODELS[index].rot,  WorldData.ANALYZER_MODELS[index].trackId);
        }
    };

    var addMusicFeedback = function(bandMemberId) {

        var bandMember = bandMembers[bandMemberId];
        bandMember.analyzerDelta = [];
        bandMember.analyzerValues = [];
        bandMember.analyzerAmplitude = 0;

        var calcMusicFeedbackVector = function(vec3) {
            var selectBar = 0;

            var barSum = 0;
            var deltaSum = 0;


            for (var i = 0; i < bandMember.analyzerValues.length; i++) {
                var barDelta = bandMember.analyzerDelta[i];
                var barMagnitude = bandMember.analyzerValues[i];
                var biggestDelta = bandMember.analyzerDelta[selectBar];
                var biggestMagnitude = bandMember.analyzerValues[selectBar];

                if (barDelta * barMagnitude + i * 0.0015 > biggestDelta * biggestMagnitude) selectBar = i;
                barSum += biggestMagnitude;
                deltaSum += barDelta;
            }

            bandMember.analyzerAmplitude = barSum;
        //    console.log("play note", barSum , deltaSum)
            if (barSum * deltaSum > 0.3) {

                vec3.setd(0, 0.2+selectBar*2.4, (-i + selectBar*2)* 4);
            } else {
                vec3.setd(0, -100, 0); // Maybe hide this better...
            }
            return vec3;
        };

        var getEmissionVelocity = function(particle) {
            var vec3 = particle.velocity;
            vec3.setd(bandMember.analyzerAmplitude*bandMember.analyzerAmplitude*0.05, 1+bandMember.analyzerAmplitude*0.1, 0);
            return vec3;
        };

        var getEmissionPosition = function(particle) {
            var vec = particle.position;
            var pos = calcMusicFeedbackVector(vec);
            return pos;
        };

        var emitFunctions = {
            velocity:getEmissionVelocity,
            position:getEmissionPosition
        };

        var analyseMusicCallback = function(values) {
            for (var i = 0; i < bandMember.analyzerValues.length; i++) {
                bandMember.analyzerDelta[i] = values[i] - bandMember.analyzerValues[i];
            }

            bandMember.analyzerValues = values;
        };
        setTimeout(function() {
            audioEngine.registerAnalyseTrackCallback(bandMemberId, analyseMusicCallback);
        }, 1000);


        worldEngine.buildParticles(bandMember, WorldData.PARTICLES.music_notes, emitFunctions, WorldData.BLEND_STATES.smoke);
    };

    var setupMusicAnalyser = function() {
        if (device == "ANDROID") return;

        for (var index in bandMembers) {
            addMusicFeedback(index);
        }
    };

    var handleSoundscapeReady = function(){
        addBandToWorld();
        setTimeout(function() {
            setupMusicAnalyser();
        }, 0);


    };

    var handleDeviceDetected = function(e) {
        device = event.eventArgs(e).device;
    };

    var handleMixerVisibility = function(e) {
        var visible = event.eventArgs(e).visible;

        for (var index in spectrumModels) {
            if (visible) {
                spectrumModels[index].addToWorld();
            } else {
                spectrumModels[index].removeFromWorld();
            }
        }
    };

    event.registerListener(event.list().DEVICE_DETECTED, handleDeviceDetected);

    event.registerListener(event.list().ADD_JAZZ_BAND, handleSoundscapeReady);

    event.registerListener(event.list().MIXER_VISIBILITY, handleMixerVisibility);

    var setEngines = function(world, audio) {
        worldEngine = world;
        audioEngine = audio;
    };

    return {
        setEngines:setEngines
    };
});