"use strict";

define(["application/EventManager"],
    function(event) {

        var deviceLabel = "NO DEVICE DETECTED";
        var deviceName = "NONE";
    //    var deviceName = "ANDROID";
        //    var setupHideAddressbar = function (elem) {

        var elem = document.getElementById("body");

        var ua = navigator.userAgent,
            iphone = ~ua.indexOf('iPhone') || ~ua.indexOf('iPod'),
            ipad = ~ua.indexOf('iPad'),
            ios = iphone || ipad,
            android = ~ua.indexOf('Android'),
        // Detect if this is running as a fullscreen app from the homescreen
            fullscreen = window.navigator.standalone,
            lastWidth = 0;

        if (iphone) deviceName = "IPHONE";
        if (android) deviceName = "ANDROID";
        if (ipad) deviceName = "IPAD";
        deviceLabel = deviceName;
        if (fullscreen) deviceLabel += "_FULLSCREEN";
        event.fireEvent(event.list().DEVICE_DETECTED, {device:deviceName});
        event.fireEvent(event.list().ANALYTICS_EVENT, {category:"DEVICE", action:"DETECTION", labels:JSON.stringify(deviceLabel), value:1});

        if (!(ios || android) || !elem) {
            console.log("ios or android not detected");
        }

        if (android) {

        }

        var setElemHeightWidth = function(element, height, top) {

            element.style.height = height;

            var delayedResize = function() {
                window.scrollTo(top, 0);
            };

            setTimeout(function() {
                delayedResize();
            }, 10);

        };

        var configureForIphone = function() {

            var scrollAdd = 0;
            var height = document.documentElement.clientHeight;
            var width = document.documentElement.clientWidth;
            var body = document.getElementById("body");
            body.style.height = "540px";

            var determineOsVersion = function() {
                var match;
                var version;

                function iPhoneOS() {
                    var version = navigator.userAgent.match('iPod') || navigator.userAgent.match('iPhone') ? 1.0 : false;
                    if (match = /iPhone OS (.*) like Mac OS X/.exec(navigator.userAgent)) {
                        version = parseInt(match[1].replace('_', ''), 10) / 100;
                        if (version < 1) {
                            version *= 10;
                        }
                    }

                    return version;
                }

                if (version = iPhoneOS()) {
                    alert ('iPhone OS ' + version);
                } else {
                    alert ('This is not an iPhone');
                }

            }

            /*
             if (height/540 < width/961) { // Less than full screen

             scrollAdd = 60;

             setElemHeightWidth(elem, height+scrollAdd+"px", scrollAdd)

             var targetWidth = Math.round(elem.offsetHeight*(960/540));
             viewport.style.width = targetWidth+"px";
             viewport.style.height = elem.offsetHeight+"px";
             viewport.style.left = Math.round(-0.5 * (targetWidth-elem.offsetWidth))+"px"


             } else if (height < width) {  // full landscape

             setElemHeightWidth(elem, height+"px", scrollAdd)
             var targetWidth = Math.round(elem.offsetHeight*(960/540));
             viewport.style.width = targetWidth+"px";
             viewport.style.height = elem.offsetHeight+"px";
             viewport.style.left = Math.round(-0.5 * (targetWidth-elem.offsetWidth))+"px"

             } else {
             //    alert("Portrait")
             scrollAdd = 0;
             setElemHeightWidth(elem, 100+"%", scrollAdd)
             }
             */

        };



        var setupScroll = function () {
            // Start out by adding the height of the location bar to the width, so that
            // we can scroll past it
            if (ios) {
                resizeIos();
            } else if (android) {
                var add = 0;
                // The stock Android browser has a location bar height of 56 pixels, but
                // this very likely could be broken in other Android browsers.
            }
        };

        var handleResize = function() {
            setTimeout(function() {
                window.scrollTo(0, 0);
            },0);
        };

        var handleClientSetupDone = function() {
            event.fireEvent(event.list().DEVICE_DETECTED, {device:deviceName});

            if (ios) {
                configureForIphone();

                document.ontouchmove = function(e){
                    e.preventDefault();
                };

                document.addEventListener("touchstart", function(e) {
                    e.preventDefault();
                }, false);

                document.ontouchmove = function(e){ e.preventDefault(); };

            };

        };

        //   setupHideAddressbar(document.getElementById("body"));

     //   event.registerListener(event.list().WINDOW_RESIZED, handleResize);
     //   event.registerListener(event.list().CLIENT_READY, handleClientSetupDone);
    });