define(["application/EventManager", "io/Requests", "io/XhrWrapper"], function(event, requests, xhrWrapper) {
    "use strict";

    var gameAction = function() {
        return requests.game;
    };

    var utilRequest = function(util, params) {
        var packet = makeUtilPacket(util, params);
        xhrWrapper.sendRequest(packet);
    };

    var makeUtilPacket = function(util, params) {
        var url = params.url;
        switch (util) {
            case requests.utils.LOAD_CONTEXT_SOUND:
                var packet = {
                    responseType:'arraybuffer',
                    type:"GET",
                    url:url
                };
                break;

        }
        packet.util = util;
        packet.params = params;
        return packet;
    };

    return {
        utilRequest:utilRequest
    }
});