define(["load/ClientLoader",
    "application/AnalyticsWrapper",
    "application/EventManager",
    "application/UpdateLoop",
    "application/DeviceHandler",
    "view/SimpleUi",
    "sound/WorldSounds",
    "sound/SoundPlayer"],
    function(clientLoader,
             analytics,
             event,
             updateLoop,
             deviceHandler,
             simpleUi,
             worldSounds,
             soundPlayer) {
    "use strict";

        var lastListenerPos = [0, 0, 0];

        var initiateClient = function() {
            preload();
            console.log("Preload");
        };

        var preloadCompleted = function() {
            event.removeListener(event.list().LOADING_COMPLETED);
            console.log("Load Completed");
            updateLoop.startRenderLoop();
        };

        var preload = function() {
            event.registerListener(event.list().LOADING_COMPLETED, preloadCompleted);
            clientLoader.preloadClientData();
        };


        var addWorldSound = function(id, pos, trackId) {
            worldSounds.addSound(id, pos, trackId);
        };

        var moveWorldSound = function(id, pos, dt) {
            worldSounds.moveSound(id, pos, dt);
        };

        var moveListener = function(posV3, rotV3, dt) {
            var pos = [posV3.data[0], posV3.data[1], posV3.data[2]];
            var vel = [(pos[0]-lastListenerPos[0])/dt, (pos[1]-lastListenerPos[1])/dt, (pos[2]-lastListenerPos[2])/dt];
            event.fireEvent(event.list().MOVE_AUDIO_LISTENER, {pos:pos, rot:[rotV3.data[0], rotV3.data[1], rotV3.data[2]], vel:vel});
            lastListenerPos = pos;
        };

        var registerAnalyserCallback = function(emitterId, callback) {
            var mixTrack = worldSounds.getTrackMix(emitterId);
            mixTrack.addAnalyseUpdateCallback(callback);
        };

        return {
            moveWorldSound:moveWorldSound,
            addWorldSound:addWorldSound,
            moveListener:moveListener,
            initiateClient:initiateClient,
            registerAnalyserCallback:registerAnalyserCallback
        };
    });