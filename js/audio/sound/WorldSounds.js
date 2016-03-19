define(["view/DomUtils", "application/EventManager", "sound/MixTrack", "view/SoundControl"],
    function(domUtils, event, MixTrack, SoundControl) {
    "use strict";

        var channels = {};
        var setupQueue = [];
        var isLoaded;
        var context;

        var bandMemebers = ["drumPlayer", "bassPlayer", "pianoPlayer", "saxPlayer"];


        var registerChannelId = function(id, control) {
            setTimeout(function(){
                channels[id] = control;
            }, 0);
        };

        var addChannel = function(id, pos, trackId) {
            var setupCB = function(sound) {
                var mixTrack = new MixTrack(sound.sourceNode.context, true);
                event.fireEvent(event.list().SEND_SOUND_TO_LISTENER, {node:mixTrack.panNode});
    //            event.fireEvent(event.list().SEND_SOUND_TO_REVERB, {node:mixTrack.gainNode});

                mixTrack.move3dSource(pos[0], pos[1], pos[2], 10);

                if (!mixTrack.context.resetTimeTriggeredAt) mixTrack.context.resetTimeTriggeredAt = 0;
                var control  = new SoundControl(trackId, mixTrack);
            //    control.buildSpectrumUi();
                registerChannelId(id, control);
            };

            event.fireEvent(event.list().FETCH_SOUND, {soundData:event.sound()[trackId], callback:setupCB});

        };

        var updateUI = function() {
            for (var index in channels) {
                channels[index].updateTrackUi();
            }
        };

        var queueSoundSetup = function(id, pos, trackId) {
            setupQueue.push({id:id, pos:pos, trackId:trackId});
        };

        var addSound = function(id, pos, trackId) {
            if (!isLoaded) {
                queueSoundSetup(id, pos, trackId);
            } else {
                addChannel(id, pos, trackId);
            }

        };

        var moveSound = function(id, pos, dt) {
            if (!channels[id]) return;
            channels[id].mixTrack.move3dSource(pos[0], pos[1], pos[2], dt);
        };

        var getTrackMix = function(id) {
            return channels[id].mixTrack;
        };

        var handleTick = function() {
            updateUI();
        };

        var handleLoadOk = function() {
            isLoaded = true;
            for (var i = 0; i <setupQueue.length; i++) {
                addChannel(setupQueue[i].id, setupQueue[i].pos, setupQueue[i].trackId);
            }
            setupQueue = [];

            setTimeout(function() {
                event.fireEvent(event.list().SOUNDSCAPE_INITIALIZED, {});
            }, 100);
        };


        var startBand = function() {
            context.resetTimeTriggeredAt = context.currentTime;
            console.log(channels, bandMemebers);
            for (var i = 0; i < bandMemebers.length; i++) {
                channels[bandMemebers[i]].fetch();
                channels[bandMemebers[i]].play();
            }
        };

        var stopBand = function() {
            for (var i = 0; i < bandMemebers.length; i++) {
                channels[bandMemebers[i]].stop();
            }
        };

        var handleRegisterContext = function(e) {
            context = event.eventArgs(e).context;
            context.listener.speedOfSound = 950;  // Player has eyes at about 3.5m above ground.
        };

        var handleConductBand = function(e) {
            var state = event.eventArgs(e).state;
            switch (state) {
                case "start":
                    startBand();
                break;
                case "stop":
                    stopBand();
                break;
            }
        };

        event.registerListener(event.list().RENDER_TICK, handleTick);
        event.registerListener(event.list().LOADING_COMPLETED, handleLoadOk);
        event.registerListener(event.list().CONDUCT_BAND, handleConductBand);
        event.registerListener(event.list().REGISTER_AUDIO_CONTEXT, handleRegisterContext);



        return {
            addSound:addSound,
            moveSound:moveSound,
            getTrackMix:getTrackMix
        };

    });
