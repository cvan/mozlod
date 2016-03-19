define(["application/AudioClient"
	//imports
],
/** @lends */
function (
    audioClient
) {
	"use strict";
    audioClient.initiateClient();
	/**
	 * @class This class contains some methods for controlling the sound scape in the AudioClient.
     * These methods are used for sounds which have a lasting behaviour. For shortish one shots we
     * will be using some sort of events instead.
	 */
	function AudioEngine() {
	}

    AudioEngine.prototype.addSoundSourceObject = function (id, pos, trackId) {
        audioClient.addWorldSound(id, pos, trackId);
    };

    AudioEngine.prototype.moveSoundSourceObject = function (id, pos, dt) {
        audioClient.moveWorldSound(id, pos, dt);
    };

    AudioEngine.prototype.setListeningPoint = function (posVec, rotVec, dt) {
         audioClient.moveListener(posVec, rotVec, dt);
    };

    AudioEngine.prototype.registerAnalyseTrackCallback = function (emitterId, callback) {
        audioClient.registerAnalyserCallback(emitterId, callback);
    };

	return AudioEngine;
});