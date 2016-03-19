define(["application/EventManager",
    "application/Sequencer"],
    function(event, sequencer) {
    "use strict";

    var targetFPS = 60;
    var frame = 0;
    var isPaused = false;
    var tickTracker;
    var tickTrackerTimeout;
    var frameTime = new Date().getTime();
    var lastFrameDuration;
    var renderStatus = {
        slowFrameCount:0,
        worstFrameTime:0,
        cyclesOfTen:0
    };

    var startRenderLoop = function() {
        console.log("Start update loop");
        renderNext();
    };

    var getWaitTime = function(callTime, lastFrameDuration) {
        var tpf = 1000 / targetFPS;
        var adjustedTime = tpf - 1;
        if (lastFrameDuration > tpf+1) adjustedTime = tpf / 2;

        return adjustedTime;
    };


    var tickIsActive = function() {

        clearTimeout(tickTrackerTimeout);
        if (tickTracker) {
            console.log("unpause", tickTracker);
            event.fireEvent(event.list().UNPAUSE_UPDATES, {});
        }

        tickTracker = false;
        tickTrackerTimeout = setTimeout(function(){
            tickTracker = true;
            console.log("pause", tickTracker);
            event.fireEvent(event.list().PAUSE_UPDATES, {});
        }, 400);
    };

    var renderNext = function(callTime, lastFrameDuration) {
        frameTime = callTime;


        // Use the request animation frame call to check if game should be paused.
        if (window.requestAnimationFrame) {
            requestAnimationFrame(function() {
                tickIsActive();
            });
        } else if (window.webkitRequestAnimationFrame) {
            webkitRequestAnimationFrame(function() {
                tickIsActive();
            });
        }


        var waitTime = getWaitTime(callTime, lastFrameDuration);
        setTimeout(function() {

            renderFrame();
        }, waitTime);
    };

    var countSlowFrame = function(duration) {
        renderStatus.slowFrameCount += 1;
        if (duration > renderStatus.worstFrameTime) renderStatus.worstFrameTime = duration;
    //      console.log("Slow Frame count", renderStatus)

        if (renderStatus.slowFrameCount > 100) {
            console.log("Cound Slow Frames: ", renderStatus);
            renderStatus.slowFrameCount = 0;
            renderStatus.cyclesOfTen += 1;
            renderStatus.worstFrameTime = 0;
        }
    };

    var renderFrame = function() {
        frame += 1;
        var now = new Date().getTime();
        lastFrameDuration = now - frameTime;
        renderThisFrame(now, lastFrameDuration);
        sequencer.tick(now, lastFrameDuration);
        renderNext(now, lastFrameDuration);
    };

    var renderThisFrame = function(now, lastFrameDuration) {
        var tpf = 1000 / targetFPS;
        if (lastFrameDuration > tpf*2) countSlowFrame(lastFrameDuration);

        if (!isPaused) {
            event.fireEvent(event.list().RENDER_TICK, {frameTime:now, lastFrameDuration:lastFrameDuration});
        }
    };

    var pause = function() {
        isPaused = true;
    };

    var unpause = function() {
        isPaused = false;
    };

    event.registerListener(event.list().PAUSE_UPDATES, pause);
    event.registerListener(event.list().UNPAUSE_UPDATES, unpause);

    return {
        startRenderLoop:startRenderLoop
    };
});