require.config({
//    baseUrl: "../lib/goojs",
    paths: {
        application: "js/audio/application",
        load: "js/audio/load",
        view: "js/audio/view",
        io: "js/audio/io",
        design: "js/audio/design",
        sound: "js/audio/sound"
    }
});

require([
	'goo/loaders/DynamicLoader',
	'goo/entities/GooRunner',
	'js/audio/AudioEngine',
	'js/world/WorldEngine',
    'js/world/JazzBand',
    'js/world/AmbientEffects'
], function (
	DynamicLoader,
	GooRunner,
	AudioEngine,
	WorldEngine,
    JazzBand,
    AmbientEffects
) {
	'use strict';

	function init() {
		var goo = new GooRunner({
			antialias: true,
			// logo: 'topleft',
			// debugKeys: true,
			// showStats: true,
			manuallyStartGameLoop: true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		var audioEngine = new AudioEngine();
		var worldEngine = new WorldEngine(goo, audioEngine);
        JazzBand.setEngines(worldEngine, audioEngine);
        AmbientEffects.setEngines(worldEngine, audioEngine);
	}

	init();
});
