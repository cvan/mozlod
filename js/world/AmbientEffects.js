"use strict";

define([
    'goo/math/Vector3',
    "application/EventManager",
    'js/world/WorldData'
], function(
    Vector3,
    event,
    WorldData
) {
    var worldEngine;
    var audioEngine;
    var device;

    var effectsToWorld = function() {
        for (var index in WorldData.AMBIENT) {
            addAmbientEffect(index, WorldData.PARTICLES[index])
        }
        for (var index in WorldData.STATIONARY) {
            addLoopingEffectSystem(index, WorldData.STATIONARY[index])
        }
    };

    var getRandomWorldPoint = function(vec) {
        var x = WorldData.WORLD_DIMENSIONS.x0 + Math.random() * WorldData.WORLD_DIMENSIONS.x1;
        var y = WorldData.WORLD_DIMENSIONS.y0 + Math.random() * WorldData.WORLD_DIMENSIONS.y1;
        var z = WorldData.WORLD_DIMENSIONS.z0 + Math.random() * WorldData.WORLD_DIMENSIONS.z1;
        vec.setd(x, y, z);
        return vec;
    };


    var addLoopingEffectSystem = function(id, fxData) {
        var particleData = WorldData.PARTICLES[fxData.particles];
        var systemPos = fxData.pos;
        var soundLoop = fxData.soundLoop;

        var randomSpeed = function() {
            var speedFactor = 0.3;
            return (Math.random()) * speedFactor;
        };

        var getEmissionVelocity = function(particle) {
            var velVec3 = particle.velocity;
            velVec3.setd(1 - Math.random() * 2, randomSpeed(), 1 - Math.random() * 2);
            return velVec3;
        };

        var getEmissionPosition = function(particle) {
            var pos = particle.position;
            pos.setd(Math.random() * 2, 0, Math.random() * 2);
            pos.add_d(systemPos[0], systemPos[1], systemPos[2])
            return pos;
        };

        var emitFunctions = {
            velocity: getEmissionVelocity,
            position: getEmissionPosition
        };

        event.fireEvent(event.list().LOOP_AMBIENT_SOUND, {
            soundData: event.sound()[soundLoop],
            pos: [systemPos[0], systemPos[1], systemPos[2]],
            vel: [0, 0, 0]
        })
        worldEngine.buildParticles(null, particleData, emitFunctions, WorldData.BLEND_STATES[fxData.blendState]);
    };


    var addAmbientEffect = function(id, particleData) {

        var randomSpeed = function() {
            var speedFactor = 3;
            return (1 - Math.random() * 2) * speedFactor;
        };

        // var velVec3 = new Vector3();

        // var updateVelVec3 = function() {
        //     velVec3.setd(randomSpeed(),randomSpeed(), randomSpeed());
        // };

        var getEmissionVelocity = function(particle) {
            var velVec3 = particle.velocity;
            velVec3.setd(randomSpeed(), randomSpeed(), randomSpeed());
            return velVec3;
        };

        var getEmissionPosition = function(particle) {
            // updateVelVec3();
            var pos = getRandomWorldPoint(particle.position);
            var selection = Math.ceil(Math.random() * 3);
            var dt = worldEngine.goo.world.tpf;

            var velVec3 = particle.velocity;

		/*	Enable this for some pingling sfx. Skipped due to performance concerns
            event.fireEvent(event.list().ONESHOT_AMBIENT_SOUND, {
                soundData: event.sound()["FX_PINGLES_" + selection],
                pos: [pos.data[0], pos.data[1], pos.data[2]],
                vel: [velVec3.data[0] / dt, velVec3.data[1] / dt, velVec3.data[2] / dt]
            });
        */
            return pos;
        };

        var emitFunctions = {
            velocity: getEmissionVelocity,
            position: getEmissionPosition
        };

        worldEngine.buildParticles(null, particleData, emitFunctions, WorldData.BLEND_STATES.fire);
    };



    var handleSoundscapeReady = function() {
        if (device != "ANDROID") effectsToWorld();
    };

    var handleDeviceDetected = function(e) {
        device = event.eventArgs(e).device;
        console.log("Device: ", device)
    };
    event.registerListener(event.list().DEVICE_DETECTED, handleDeviceDetected);
    event.registerListener(event.list().SOUNDSCAPE_INITIALIZED, handleSoundscapeReady);


    var setEngines = function(world, audio) {
        worldEngine = world;
        audioEngine = audio;
    };



    return {
        setEngines: setEngines
    }
});