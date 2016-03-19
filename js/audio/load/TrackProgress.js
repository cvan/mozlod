define(["application/EventManager", "view/DomUtils", "application/AnalyticsWrapper"],
function(event, domUtils, analyticsWrapper) {
    "use strict";

    var loadingsStarted = 0;
    var loadingsFinished = 0;
    var loadingErrors = 0;
    var startedIds = [];
    var screen;


    var loadStats = {
        start:new Date().getTime(),
        loaded:0,
        buffered:0,
        audioModel:""
    };

    var removeLoadingScreen = function() {


    };



    var getPercent = function(started, finished) {
        return 100 * (finished / started);
    };

    var showProgress = function(started, finished, errors) {
		drawProgressBar(started, finished);
        domUtils.getElementById("load_feedback").innerHTML = "Loading Data -- started:"+started+" finished: "+finished+" errors:"+errors;
//        console.log(started, finished, errors)
    };

	function drawProgressBar(totalValue, currentValue) {
		var barWidth = Math.round((currentValue * 100) / totalValue);
		document.getElementById("progress_background").style.width = barWidth + '%';
		//document.getElementById("progress_indicator").innerHTML=barWidth+'%';
	}

    var loadingCompleted = function() {
        var counts = {started:loadingsStarted, completed:loadingsFinished, errors:loadingErrors};
        event.fireEvent(event.list().LOADING_COMPLETED, counts);
        loadStats.loaded = new Date().getTime();
        var loadTime = loadStats.loaded - loadStats.start;
        event.fireEvent(event.list().ANALYTICS_EVENT, {category:"AUDIO_LOAD", action:"DOWNLOADED", labels:JSON.stringify(counts), value:loadTime});
        domUtils.getElementById("loading_screen").style.display = "none";

    };

    var handleSoundsReady = function() {
        loadStats.buffered = new Date().getTime();
        var bufferingTime = loadStats.buffered - loadStats.loaded;
        event.fireEvent(event.list().ANALYTICS_EVENT, {category:"AUDIO_LOAD", action:"BUFFERED", labels:loadStats.audioModel, value:bufferingTime});
    };

    var loadingProgress = function(start, complete, error, id) {
        loadingsStarted += start;
        loadingsFinished += complete;
        loadingErrors += error;
        if (start && id) startedIds.push(id);
        if (complete && id) startedIds.splice(startedIds.indexOf(id), 1);
        if (error) event.fireEvent(event.list().ANALYTICS_EVENT, {category:"AUDIO_ERROR", action:"LOAD", labels:"ID: "+id, value:0});
        showProgress(loadingsStarted, loadingsFinished, loadingErrors);
        if (loadingsStarted == loadingsFinished+loadingErrors) loadingCompleted();
    };

    var getLoadedCount = function() {
        return {started:loadingsStarted, finished:loadingsFinished, errors:loadingErrors};
    };

    var handleLoadEvent = function(e) {
        var args = event.eventArgs(e);
        loadingProgress(args.started, args.completed, args.errors);
    };

    var handleContextRegistered = function(e) {
        loadStats.audioModel = event.eventArgs(e).model;
    };

    event.registerListener(event.list().LOAD_PROGRESS, handleLoadEvent);
    event.registerListener(event.list().REGISTER_AUDIO_CONTEXT, handleContextRegistered);
    event.registerListener(event.list().SOUNDSCAPE_INITIALIZED, handleSoundsReady);

    return {
        removeLoadingScreen:removeLoadingScreen,
        loadingProgress:loadingProgress,
        getLoadedCount:getLoadedCount
    };

});