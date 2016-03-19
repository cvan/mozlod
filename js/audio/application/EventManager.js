define(["application/EventList", "sound/SoundList"], function(eventList, soundList) {

    var element = document.createElement('div');
    var events = {};

    var eventException = function(message) {
        this.name = "EventArgumentException";
        this.message = message;
    };
    eventException.prototype = Error.prototype;

    var list = function() {
        return eventList;
    };

    var sound = function() {
        return soundList;
    };

    var validateEventArguments = function(event, args) {
        for (var index in args) {
            if (typeof(event.eArgs[index]) != typeof(args[index])) {
                throw new eventException("Invalid event arguments, "+event.type+" does not match type for supplied argument: "+index);
            }
        }
    };

    var generateEvent = function(event, args) {
        validateEventArguments(event, args);

        return new CustomEvent(
            event.type,
            {
                detail: {arguments:args},
                bubbles: false,
                cancelable: false
            }
        );
    };

    var eventArgs = function(e) {
        return e.detail.arguments;
    };

    var fireEvent = function(event, args) {
        element.dispatchEvent(generateEvent(event, args));
    };

    var registerListener = function(event, onFireEvent) {
        events[event.type] = onFireEvent;
        element.addEventListener(event.type, onFireEvent);
    };

    var removeListener = function(event) {
        element.removeEventListener(event.type, events[event.type], null);
        delete events[event.type];
    };

    return {
        removeListener:removeListener,
        registerListener:registerListener,
        eventArgs:eventArgs,
        fireEvent:fireEvent,
        list:list,
        sound:sound
    };

});