define(["io/Receive"], function(receive) {
    "use strict";

    var nrSentRequests = 0;
    var ongoingRequests = {};

    var getNewRequestId = function() {
        nrSentRequests += 1;
        return "requestId_"+nrSentRequests;
    };

    /*
    var makeBaseAuth = function(user, pass) {
        var tok = user + ':' + pass;
        var hash = Base64.encode(tok);
        return "Basic " + hash;
    };
    */

    var sendRequest = function(packet) {
        packet.packetId = getNewRequestId();
    //    if (packet.auth) packet.auth.header = makeBaseAuth(packet.auth.username, packet.auth.password);
        sendXHR(packet);
    };

    var sendXHR = function(packet) {
        var packetId = packet.packetId;

        var body = "";

        var request = new XMLHttpRequest();
        request.packet = packet;

        var asynch = true;
    //    if (packet.contentType == 'application/x-www-form-urlencoded') asynch = false;


        request.open(packet.type, packet.url, asynch);
        if (packet.responseType) request.responseType = packet.responseType;

        if (packet.contentType == 'application/json') {
            body = JSON.stringify(packet.body);
            request.setRequestHeader("Content-Type", packet.contentType);
        }

        if (packet.contentType == 'application/x-www-form-urlencoded') {
            body = packet.params;
            request.setRequestHeader("Content-Type", packet.contentType);

        //    request.setRequestHeader("Content-length", packet.params.length);
        //    request.setRequestHeader("Connection", "close");
        }

        if (packet.auth) request.setRequestHeader('Authorization', packet.auth.header);

        request.onreadystatechange = function() {
        //    console.log(request.readyState)

            if (request.readyState == 4) {
                if (request.status == 0)receive.handleResponse(request.response, request.packet);

                switch(request.status) {
                    case 409:
                        receive.handleConflict(request.packet);
                    break;
                    case 404:
                        receive.handleUnavailable(request.packet);
                        break;
                    case 400:
                        receive.handleError(request.packet);
                        break;
                    case 200:
                        receive.handleResponse(request.response, request.packet);
                    break;
                    case 0:
                        console.log("Status 0", request.packet);
                    break;
                    default:
                        receive.handleResponse(request.response, request.packet);
                     //   console.log("Default status: ",request.status );
                    break;
                }



            }
        };

        request.onError = function() {
            alert("XHR Error! "+request.packet.packetId)
        };

        request.send(body);
        ongoingRequests[packetId] = request;
    };

    return {
        sendRequest:sendRequest
    }

});