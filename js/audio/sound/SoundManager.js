define(["sound/SoundLoader", "application/EventManager"] ,function(soundLoader, event) {
    "use strict";

    var soundDisabledSettingId = "soundDisable";
    var soundsLoaded = false;

    var loadSounds = function() {
        console.log("Load Sounds");
        if (!soundsLoaded) {
            requestSoundLoad();
            soundsLoaded = true;
        }
    };

    var requestSoundLoad = function() {
        setTimeout(function() {
            soundLoader.loadSoundList();
        }, 0);

    };

    return {
        loadSounds:loadSounds
    };
});
