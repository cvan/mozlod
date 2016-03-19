define(["sound/SoundList", "sound/SourceFactory", "load/TrackProgress"],
    function(soundList, sourceFactory, trackProgress) {
    "use strict";

        var completionCallback = function(started, finished, error, id) {
            trackProgress.loadingProgress(0, 1, 0, id);
        };

        var loadSoundList = function() {

            for (var keys in soundList) {
                var callback = function(started, finished, error) {
                    if (error) console.log("Sound Loading Error", error);
                };
                if (soundList[keys].options.preload) {
                    trackProgress.loadingProgress(1, 0, 0, soundList[keys].file);
                    callback = completionCallback;
                }
                sourceFactory.addSourceToSound(soundList[keys], callback);
            }
        };


        return {
            loadSoundList:loadSoundList
        };

    });