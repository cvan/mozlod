var _gaq = _gaq || [];
define(["application/EventManager"],
    function(event) {
    "use strict";

        var addToQueue = function(category, action, labels, value) {
            _gaq.push(['_trackEvent', category, action, labels, value]);
        };

        var trackEvent = function(e) {
            var eventId = e.type;
            var args = event.eventArgs(e);
                var label = "";
            for (var index in args) {
                label += index+" "+args[index];
            }
            addToQueue("EVENT", eventId, args.labels, 0);
        };

        var explicitTrack = function(e) {
            var args = event.eventArgs(e);
            console.log(args.category, args.action, args.labels, args.value);
            addToQueue(args.category, args.action, args.labels, args.value);
        };

    event.registerListener(event.list().ANALYTICS_EVENT, explicitTrack);

});
