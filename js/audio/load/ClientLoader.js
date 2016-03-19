define(["sound/SoundManager", "load/TrackProgress"],
    function(soundManager, trackProgress) {
    "use strict";

        var imageCache = {};

        var getCachedImage = function(src) {
            return imageCache[src];
        };

        var preloadClientData = function() {
            soundManager.loadSounds();
        };

        var getLoadedCount = function() {
            return trackProgress.getLoadedCount();
        };

        return {
            preloadClientData:preloadClientData,
            getLoadedCount:getLoadedCount,
            getCachedImage:getCachedImage
        };

    });