define(["js/world/WorldData", "view/DomUtils", "application/EventManager", "sound/MixTrack", "view/SoundControl"],
    function(WorldData, domUtils, event, MixTrack, SoundControl) {
        "use strict";

        var channels = {};
        var conductButton;
        var showControlsButton;
        var controlsShowing;
        var uiContainer;

        var setupAboutPage = function() {
            var aboutButton = domUtils.createDivElement("body", "about_button", "", "about_button");

            var aboutPage;
            var showAboutPage = function() {
                var contentHtml = domUtils.getElementById(WorldData.ABOUT_PAGE.content_div_id).innerHTML;
                aboutPage = domUtils.createDivElement("body", "about_page", contentHtml, "about_page");
                domUtils.addElementClickFunction(aboutPage, closeAboutPage);
                domUtils.addElementClickFunction(aboutButton, closeAboutPage);
            };

            var closeAboutPage = function() {
                domUtils.removeElement(aboutPage);
                domUtils.addElementClickFunction(aboutButton, showAboutPage);
            };

            domUtils.addElementClickFunction(aboutButton, showAboutPage);
        };

        var addChannel = function(id) {

            var setupCB = function(sound) {
                var mixTrack = new MixTrack(sound.sourceNode.context);
                event.fireEvent(event.list().SEND_SOUND_TO_DESTINATION, {
                    node: mixTrack.panNode
                });
                if (!mixTrack.context.resetTimeTriggeredAt) mixTrack.context.resetTimeTriggeredAt = 0;
                var control = new SoundControl(id, mixTrack);
                setTimeout(function() {
                    control.buildSpectrumUi();
                    channels[id] = control;
                }, 100);
            };

            setTimeout(function() {
                event.fireEvent(event.list().FETCH_SOUND, {
                    soundData: event.sound()[id],
                    callback: setupCB
                });
            }, 100);
        };

        var toggleShowControls = function() {

            if (controlsShowing) {
                uiContainer.style.display = "";
                event.fireEvent(event.list().MIXER_VISIBILITY, {
                    visible: true
                });
            } else {
                uiContainer.style.display = "none";
                event.fireEvent(event.list().MIXER_VISIBILITY, {
                    visible: false
                });
            }

            controlsShowing = !controlsShowing;

        };

        var addBandControls = function() {
            uiContainer = domUtils.createDivElement("simple_ui", "controls_container", "", "controls_container");
            showControlsButton = domUtils.createDivElement("simple_ui", "show_controls_button", "", "show_controls_button");
            domUtils.addElementClickFunction(showControlsButton, toggleShowControls);
            toggleShowControls();
            conductButton = domUtils.createDivElement("simple_ui", "conduct_band_button", "", "conduct_button");

            var startBand = function() {
                event.fireEvent(event.list().CONDUCT_BAND, {
                    state: "start"
                });
                domUtils.addElementClickFunction(conductButton, stopBand);
                domUtils.addElementClass(conductButton, "conduct_button_enabled");
                //        conductButton.innerHTML = "STOP BAND"
            };

            var stopBand = function() {
                event.fireEvent(event.list().CONDUCT_BAND, {
                    state: "stop"
                });
                domUtils.addElementClickFunction(conductButton, startBand);
                domUtils.removeElementClass(conductButton, "conduct_button_enabled");
                //       conductButton.innerHTML = "START BAND"
            };

            domUtils.addElementClickFunction(conductButton, startBand);
            setTimeout(function() {
                startBand();
            }, 1000);
            //    conductButton.innerHTML = "START BAND"
        };

        var setupMix = function() {
            addChannel("SJ_DRUMS");
            addChannel("SJ_BASS");
            addChannel("SJ_SAX");
            addChannel("SJ_PIANO");
        };

        var updateUI = function() {
            for (var index in channels) {
                channels[index].updateTrackUi();
            }
        };

        var handleTick = function() {
            updateUI();
        };

		var isLoaded = false;
		var soundsGTG = false;

		var soundsGTGAndLoaded = function() {
			addBandControls();
			setupAboutPage();
			event.fireEvent(event.list().ADD_JAZZ_BAND, {});

			event.registerListener(event.list().RENDER_TICK, handleTick);

		};

        var handleLoadOk = function() {
			isLoaded = true;
			if (soundsGTG == true) soundsGTGAndLoaded();
        };

		var handleSoundGTG = function() {
			soundsGTG = true;
			if (isLoaded == true) soundsGTGAndLoaded();
		};


        event.registerListener(event.list().LOADING_COMPLETED, handleLoadOk);
		event.registerListener(event.list().SOUNDSCAPE_INITIALIZED, handleSoundGTG);
    });