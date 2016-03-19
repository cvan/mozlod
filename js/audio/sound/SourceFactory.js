define(["io/Requests", "io/Send", "view/DomUtils", "application/EventManager"], function(requests, send, domUtils, event) {
    "use strict";

    var path = "./resources/sounds/";
    var codec;
    var audioModel;
    var context;

    var getCodec = function() {
        return codec;
    };

    var determineCodec = function() {
        if (!Audio in window) {
            alert("Browser does not support sounds.");
            return "";
        }

        var audio = new Audio();

        var canPlayOgg = !!audio.canPlayType && audio.canPlayType('audio/ogg') !== "";
        var canPlayMp3 = !!audio.canPlayType && audio.canPlayType('audio/mp3') !== "";
        if (canPlayOgg) {
            codec = "ogg";
            //    codec = "mp3"
        } else if (canPlayMp3) {
            codec = "mp3";
        } else {
            alert("Browser can not play the sounds needed for this game.");
        }
        return codec;
    };

    var determinePlayerModel = function() {
        var test = ["AudioContext", "webkitAudioContext", "Audio"];
        for (var i = 0; i < test.length; i++) {
            if (test[i] in window) {
                audioModel = test[i];
                return audioModel;
            }
        }
        return "";
    };

    var runSourceFactoryConfig = function() {
        codec = determineCodec();
        audioModel = determinePlayerModel();
        if (!audioModel) return;
        if (audioModel != "Audio") {
            context = new window[audioModel]();
            event.fireEvent(event.list().REGISTER_AUDIO_CONTEXT, {context:context, model:audioModel});
            if (typeof(context.createGain) != "function") context.createGain = context.createGainNode;
        } else {
            alert("This browser does not support the Web Audio Api. Will run with limited sounds.");
        }
    };

    var contextSource = function(bufferData) {
        var buffer = bufferData;
        var gain = 1;

        var pause = function(sourceNode) {
            if (typeof(sourceNode.stop) == "function") {
                sourceNode.stop(0);
            } else {
                sourceNode.noteOff(0);
            }
        };

        var setGain = function(value) {
            gain = value;
        };

        var getSource = function() {
            var sourceNode = context.createBufferSource();
            sourceNode.buffer = buffer;
            return sourceNode;
        };

        var play = function(looping) {
            var sourceNode = context.createBufferSource();
            var gainNode = context.createGain();
            sourceNode.buffer = buffer;
            sourceNode.loop = looping;
            sourceNode.connect(gainNode);
            gainNode.connect(context.destination);
            gainNode.gain.value = gain;

            if (typeof(sourceNode.start) == "function") {
                sourceNode.start(0);
            } else {
                sourceNode.noteOn(0);
            }

            return sourceNode;
        };

        return {
            getSource:getSource,
            play:play,
            pause:pause,
            setGain:setGain
        };
    };

    var audioSource = function(baseAudio) {

        var gain = 1;

        var pause = function(sourceNode) {
            sourceNode.pause();
        };

        var setGain = function(value) {
            gain = value;
        };

        var play = function(looping) {
            var clone = baseAudio.cloneNode(false);
            clone.volume = gain;
            clone.loop = looping;
            clone.play();

            var done = function() {
                clone = null;
            };

            clone.addEventListener("pause", done, false);
            return clone;
        };

        return {
            play:play,
            pause:pause,
            setGain:setGain
        };
    };

    var loadContextSourceData = function(sound, url, completionCallback) {

        var dataCallback = function(listSound, response) {
            var onError = function() {
                completionCallback(0, 0, 1, url);
                console.log("Decode Error: ", listSound, response);
                alert("Sound decoding Error");
            };

            context.decodeAudioData(response, function(buffer) {
                listSound.source = new contextSource(buffer);
                completionCallback(0, 1, 0, url);
            }, onError);

        };

        send.utilRequest(requests.utils.LOAD_CONTEXT_SOUND, {url:url, sound:sound, callback:dataCallback});
    };

    var createMockSource = function(sound, completionCallback) {

        var mockSource = {
            play:function() {},
            setGain:function() {},
            pause:function() {}
        };

        sound.source = mockSource;
        completionCallback(0, 1, 0);
    };


    var addSourceToSound = function(sound, completionCallback) {
        if (!audioModel) {
            createMockSource(sound, completionCallback);
            return;
        }

        var url = path+sound.folder+"/"+sound.file+"."+codec;
        if (context) {
            loadContextSourceData(sound, url, completionCallback);
            return;
        }

        if (audioModel == "Audio") {

            var baseAudio = new Audio([url]);
            var onCanPlay = function() {
                completionCallback(0, 1, 0);
            };
            baseAudio.addEventListener("canplaythrough", onCanPlay, false);
            sound.source = audioSource(baseAudio);
        }
    };

    runSourceFactoryConfig();

    return {
        addSourceToSound:addSourceToSound
    };

});