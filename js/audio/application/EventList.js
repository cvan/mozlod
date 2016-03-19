"use strict";

define(function() {
    var func = function(){};

    return {
        LOAD_PROGRESS:{type:"LOAD_PROGRESS", eArgs:{started:0, completed:0, errors:0}},
        LOADING_COMPLETED:{type:"LOADING_COMPLETED", eArgs:{started:0, completed:0, errors:0}},
        DEVICE_DETECTED:{type:"DEVICE_DETECTED", eArgs:{device:""}},
        SOUNDSCAPE_INITIALIZED:{type:"SOUNDSCAPE_INITIALIZED", eArgs:{}},
        CLIENT_SETUP_OK:{type:"CLIENT_SETUP_OK", eArgs:{}},
        ANALYTICS_EVENT:{type:"ANALYTICS_EVENT", eArgs:{category:"", action:"", labels:"", value:0}},
        RENDER_TICK:{type:"RENDER_TICK", eArgs:{frameTime:0, lastFrameDuration:0}},
        SEQUENCE_CALLBACK:{type:"SEQUENCE_CALLBACK", eArgs:{callback:func, wait:0}},

        MIXER_VISIBILITY:{type:"MIXER_VISIBILITY", eArgs:{visible:false}},

        PAUSE_UPDATES:{type:"PAUSE_UPDATES", eArgs:{}},
        UNPAUSE_UPDATES:{type:"UNPAUSE_UPDATES", eArgs:{}},

        REGISTER_AUDIO_CONTEXT:{type:"REGISTER_AUDIO_CONTEXT", eArgs:{context:{}, model:""}},

        SEND_SOUND_TO_REVERB:{type:"SEND_SOUND_TO_REVERB", eArgs:{node:{}}},
        SEND_SOUND_TO_LISTENER:{type:"SEND_SOUND_TO_LISTENER", eArgs:{node:{}}},
        SEND_SOUND_TO_MASTER:{type:"SEND_SOUND_TO_MASTER", eArgs:{node:{}}},
        SEND_SOUND_TO_DESTINATION:{type:"SEND_SOUND_TO_DESTINATION", eArgs:{node:{}}},
        MOVE_AUDIO_LISTENER:{type:"MOVE_AUDIO_LISTENER", eArgs:{pos:[], rot:[], vel:[]}},

        ONESHOT_AMBIENT_SOUND:{type:"ONESHOT_AMBIENT_SOUND", eArgs:{soundData:{}, pos:[], vel:[]}},
        LOOP_AMBIENT_SOUND:{type:"LOOP_AMBIENT_SOUND", eArgs:{soundData:{}, pos:[], vel:[]}},

        ONESHOT_SOUND:{type:"ONESHOT_SOUND", eArgs:{soundData:{}, playId:"", callback:func}},
        FETCH_SOUND:{type:"FETCH_SOUND", eArgs:{soundData:{}, callback:func}},
        FETCH_BUFFER:{type:"FETCH_BUFFER", eArgs:{soundData:{}, callback:func}},
        STOP_SOUND:{type:"STOP_SOUND", eArgs:{playId:""}},
        START_SOUND_LOOP:{type:"START_SOUND_LOOP", eArgs:{soundData:{}, loopId:"", callback:func}},
        STOP_SOUND_LOOP:{type:"STOP_SOUND_LOOP", eArgs:{loopId:""}},

        CONDUCT_BAND:{type:"CONDUCT_BAND", eArgs:{state:""}},

        WRITE_SUBTEXT:{type:"WRITE_SUBTEXT", eArgs:{text:""}},
		ADD_JAZZ_BAND:{type:"ADD_JAZZ_BAND", eArgs:{}}
    };
});
