define(["application/EventManager"] ,function(event) {
    "use strict";

    var context;
    var auxGain;
    var reverb;

    var setContext = function(ctx) {
        context = ctx;
        auxGain = context.createGain();
        reverb = context.createConvolver();
        auxGain.connect(reverb);
        auxGain.gain.value = 0.03;
    };

    var createReverbTrack = function(buffer) {
        reverb.buffer = buffer;
        reverb.connect(context.destination);
    };

    var setupReverb = function() {
        var setupBuffer = function(buffer) {
            createReverbTrack(buffer);
        };
        event.fireEvent(event.list().FETCH_BUFFER, {soundData:event.sound().FX_VERB, callback:setupBuffer});
    };

    var handleConnectReverb = function(e) {
        var node = event.eventArgs(e).node;
        node.connect(auxGain);
    };

    var handleLoadOk = function() {
        setupReverb();
    };

    event.registerListener(event.list().SEND_SOUND_TO_REVERB, handleConnectReverb);
//    event.registerListener(event.list().LOADING_COMPLETED, handleLoadOk);

    return {
        setContext:setContext
    };
});
