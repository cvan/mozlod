define(["view/DomUtils", "application/EventManager"],
    function(domUtils, event) {
    "use strict";

        var SoundControl = function(soundId, mixTrack) {
            this.id = soundId;
            this.mixTrack = mixTrack;
            this.elements = {};
            this.channels = {};
            this.buildControlUi(soundId);
        };

        SoundControl.prototype.fetch = function() {
            var control = this;
            var mixTrack = this.mixTrack;
            var mixSoundCallback = function(sound, channel) {
                var source = sound.sourceNode;
				source.loop = true;
                mixTrack.addSourceNode(source);
            };

            var fetchCallback = function(sound) {
                mixSoundCallback(sound, control.id);
            };

            event.fireEvent(event.list().FETCH_SOUND, {soundData:event.sound()[this.id], callback:fetchCallback});
        /*
            this.playButton.innerHTML = "--";
            this.playButton.play = control.play;
            domUtils.disableElementInteraction(this.playButton);

            this.playButton.innerHTML = "CONNECT";

            var play = function() {
                control.play();
            };

            domUtils.addElementClickFunction(this.playButton, play);
        */
        };

        SoundControl.prototype.play = function() {
            this.fetch();
            var control = this;
            var mixTrack = this.mixTrack;
            mixTrack.startSources(mixTrack.context.currentTime);
            domUtils.disableElementInteraction(this.playButton);
            var stop = function() {
                control.stop();
            };
            domUtils.addElementClass(this.playButton, this.id+"_on");
            domUtils.addElementClickFunction(this.playButton, stop);
        };

        SoundControl.prototype.stop = function() {
            var control = this;
            var mixTrack = this.mixTrack;
            mixTrack.stopSources();
            domUtils.disableElementInteraction(this.playButton);
            var play = function() {
                control.play();
            };
            domUtils.removeElementClass(this.playButton, this.id+"_on");
            domUtils.addElementClickFunction(this.playButton, play);
        };


        SoundControl.prototype.buildControlUi = function(soundId) {
            var channels = this.channels;
            this.channels[soundId] = {};
            var mixTrack = this.mixTrack;

            var container = domUtils.createDivElement("controls_container", "mix_channel_"+soundId, "", "channel_box");
            this.playButton = domUtils.createDivElement(container.id, container.id+"_play", "", this.id);


            var control = this;

            var play = function() {
                control.play();
            };

            domUtils.addElementClickFunction(this.playButton, play);

            var filterButton = domUtils.createDivElement(container.id, container.id+"_rnd", "", "filter_button");
            var filterOn = false;

            var toggleFilter = function() {
                if (filterOn) {
                    mixTrack.setFilterFreqValue(24000);
                    mixTrack.setFilterQValue(1);
                    domUtils.removeElementClass(filterButton, "filter_button_on");
                } else {
                    mixTrack.setFilterFreqValue(1000);
                    mixTrack.setFilterQValue(12);
                    domUtils.addElementClass(filterButton, "filter_button_on");

                }
                filterOn = !filterOn;

            };
            domUtils.addElementClickFunction(filterButton, toggleFilter);

            var gainButton = domUtils.createDivElement(container.id, container.id+"_gain_btn", "", "gain_box");
       //     gainButton.innerHTML = "GAIN";

            var gainKnob = domUtils.createDivElement(gainButton.id, gainButton.id+"_lvl", "", "gain_level");
            var gainLevel = 1;

            var changeGain = function() {
                gainLevel += 0.5;
                mixTrack.setTrackGain(gainLevel);
                gainKnob.style.top = 90 - (gainLevel*60)+"%";
                if (gainLevel > 1) gainLevel = 0;
            };

            domUtils.addElementClickFunction(gainButton, changeGain);
            changeGain();

        /*

            var randomButton = domUtils.createDivElement(container.id, container.id+"_rnd", "", "mix_button");
            randomButton.innerHTML = "RANDOM";


            var setRandomMixValues = function(trackId) {
                mixTrack.setTrackGain(1.5 - Math.random(), 0.1+Math.random()*0.5);
                mixTrack.setTrackPan(1 - Math.random()*2, Math.random()*0.5);
                mixTrack.setFilterQValue(Math.random()*20, Math.random()*0.5);
                mixTrack.setFilterFreqValue(Math.random()*24000, Math.random()*0.5);
            };

            var randomizeMix = function(id) {
                var triggerRandom = function() {
                    setRandomMixValues(id);
                    seqRnd();
                };

                var seqRnd = function() {
                    event.fireEvent(event.list().SEQUENCE_CALLBACK, {callback:triggerRandom, wait:500})
                };
                seqRnd();
            };

            var randomMixTrack = function() {
                randomizeMix(soundId)
            };

            domUtils.addElementClickFunction(randomButton, randomMixTrack);
            */

        /*

            var header = domUtils.createDivElement(container.id, container.id+"_header", soundId, "mix_header");
            this.elements.time = domUtils.createDivElement(container.id, container.id+"_header", "Context Time", "mix_header");
            this.elements.time.style.textAlign = "left";
            var a = domUtils.createDivElement(container.id, container.id+"_gain", "Gain:", "mix_prop");
    //        var b = domUtils.createDivElement(container.id, container.id+"_pan", "Pan:", "mix_prop");
            var c = domUtils.createDivElement(container.id, container.id+"_freq", "Filter Hz:", "mix_prop");
            var d = domUtils.createDivElement(container.id, container.id+"_Q", "Filter Q:", "mix_prop");
            this.elements.spec = domUtils.createDivElement(container.id, container.id+"_spec", "", "mix_prop");

            var elements = this.elements;
            var addValueElems = function() {
                elements.gain = domUtils.createDivElement(a.id, container.id+"gain_value", "", "mix_value");
    //            elements.pan = domUtils.createDivElement(b.id, container.id+"pan_value", "", "mix_value");
                elements.freq =  domUtils.createDivElement(c.id, container.id+"freq_value", "", "mix_value");
                elements.q = domUtils.createDivElement(d.id, container.id+"q_value", "", "mix_value");

                domUtils.addElementClickFunction(a,  function(){mixTrack.setTrackGain(Math.random())});
    //            domUtils.addElementClickFunction(b,  function(){mixTrack.setTrackPan(2*Math.random()-1)});
                domUtils.addElementClickFunction(c,  function(){toggleFilter()});
                domUtils.addElementClickFunction(d,  function(){toggleFilter()});
            };

            var resetTime = function() {
                mixTrack.context.resetTimeTriggeredAt = mixTrack.context.currentTime;
            };

            domUtils.addElementClickFunction(this.elements.time, resetTime);

            this.spectrumBars = [];
            setTimeout(function() {
                addValueElems()
            });
            */
        };

        SoundControl.prototype.buildSpectrumUi = function() {
            var specBars = this.elements.spec;
            for (var i = 0; i < this.mixTrack.analyzerBars; i++) {
                var barContainer = domUtils.createDivElement(specBars.id, specBars.id+"_container_"+i, "", "mix_spectrum_bar_container");
                var bar = domUtils.createDivElement(barContainer.id, specBars.id+"_"+i, "", "mix_spectrum_bar");
                this.spectrumBars.push(bar);
            }
        };

        var uiValue = function(float) {
            return Math.round(float*1000)/1000;
        };

        SoundControl.prototype.updateTrackUi = function() {

            var mixTrack = this.mixTrack;
            var spectrum = mixTrack.sampleMixAnalyser();
    //         return;

    //         //    console.log(this.elements)

    //         var spectrumBars = this.spectrumBars;

    //         for (var i = 0; i < spectrumBars.length; i++) {
    //             spectrumBars[i].style.height = spectrum[i]*100 + "%";
    //         }

    //         this.elements.time.innerHTML = Math.round((this.mixTrack.context.currentTime - this.mixTrack.context.resetTimeTriggeredAt) * 1000) / 1000;
    //         this.elements.gain.innerHTML = uiValue(mixTrack.getTrackGain());
    // //        this.elements.pan.innerHTML  = mixTrack.getTrackPan();
    //         this.elements.freq.innerHTML = Math.round(mixTrack.getFilterFreqValue());
    //         this.elements.q.innerHTML    = uiValue(mixTrack.getFilterQValue());
        };

        return SoundControl;
    });
