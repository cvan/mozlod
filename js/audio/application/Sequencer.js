define(["application/EventManager"], function(event) {

    var now;
    var eventQueue = [];

    var queueEvent = function(callback, wait) {
        eventQueue.push({wait:wait, callback:callback});
    };

    var updateQueue = function(dt) {
        for (var i = 0; i < eventQueue.length; i++) {
            var queueEntry = eventQueue[i];
            queueEntry.wait -= dt;
            if (queueEntry.wait <= 0) {
                queueEntry.callback();
                eventQueue.splice(i, 1);
            }
        }
    };

    var sequenceCallback = function(e) {
        var args = event.eventArgs(e);
        var callback = args.callback;
        var wait = args.wait;
        queueEvent(callback, wait);
    };

    var flushQueue = function() {
        for (var i = 0; i < eventQueue.length; i++) {
            var queueEntry = eventQueue[i];

        }
        eventQueue = [];
    };

    event.registerListener(event.list().SEQUENCE_CALLBACK, sequenceCallback);

    var tick = function(time, frameDuration) {
        now = time;
        updateQueue(frameDuration);
    };

    return {
        tick:tick
    };
});
