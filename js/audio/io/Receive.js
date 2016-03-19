define([ "application/EventManager", "io/Requests"],
    function( event, requests) {
    "use strict";

    var handleResponse = function(response, packet) {
        if (packet.util)  handleUtilResponse(response, packet);
    };

    var handleUtilResponse = function(response, packet) {
        switch (packet.util) {
            case requests.utils.LOAD_CONTEXT_SOUND:
                packet.params.callback(packet.params.sound, response);
            break;
            default: alert("Unhandled response from utility packet");
        }
    };

    return {
        handleResponse:handleResponse
    }
});