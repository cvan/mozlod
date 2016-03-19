"use strict";

define({
        ABOUT_PAGE:{
            content_div_id:"about_page_content"
        },
        WORLD_DIMENSIONS:{
            x0:-10,
            x1:250,
            y0:0,
            y1:40,
            z0:-10,
            z1:120
        },

        ANALYZER_MODELS: {
            sax:{
                trackId:"saxPlayer",
                pos:[114, 4.902, 108],
                rot:[0, 0, 0]
            },
            drums:{
                trackId:"drumPlayer",
                pos:[109, 4.902, 111],
                rot:[0, 0, 0]
            },
            bass: {
                trackId:"bassPlayer",
                pos:[112, 4.902, 114],
                rot:[0, 0, 0]
            },
            piano: {
                trackId:"pianoPlayer",
                pos:[109, 4.902, 103],
                rot:[0, 0, 0]
            }
        },

        ANIMATED_SCENE: {
            drums: {
                model: 'drums',
                pos: [105.5, 4.9, 111.5],
                rot: [0, Math.PI*0.6, 0],
                scale: [0.07, 0.07, 0.07]
            },
            bass: {
                model: 'bass',
                pos: [110, 6.2, 114],
                rot: [0, Math.PI*0.4, 0],
                scale: [0.07, 0.07, 0.07]
            },
            organ: {
                model: 'organ',
                pos: [112.5, 4.9, 112.5],
                rot: [0, Math.PI*0.8, 0],
                scale: [0.07, 0.07, 0.07]
            },
            saxophone: {
                model: 'saxophone',
                pos: [112, 4.9, 109],
                rot: [0, Math.PI*0.5, 0],
                scale: [0.07, 0.07, 0.07]
            }
        },

        JAZZ_BAND:{
            pianoPlayer: {
                pos:[109, 6, 104.5],
                trackId:"SJ_PIANO"
            },
            saxPlayer: {
                pos:[112, 6, 109],
                trackId:"SJ_SAX"
            },
            drumPlayer: {
                pos:[106, 6, 111],
                trackId:"SJ_DRUMS"
            },
            bassPlayer: {
                pos:[110, 6, 114],
                trackId:"SJ_BASS"
            }
        },

        SCENE: {
            worldbase:{
                model:'resources/Audio Browser Scene.qef',
                pos:[0, 0, 0],
                rot:[0, 0, 0],
                scale:[1, 1, 1],
                doPerlin: true
            },
            organ:{
                model:'resources/Organ.qef',
                pos:[109.5, 4.6, 104],
                rot:[0, Math.PI*1.2, 0],
                scale:[0.07,0.07, 0.07]
            },

            bar:{
                model:'resources/Bar.qef',
                pos:[136, 3, 70],
                rot:[0, 0, 0],
                scale:[0.1, 0.1, 0.1]
            },
             /*

            weaponTent:{
                model:'resources/Weapon tent.qef',
                pos:[161, 3, 40],
                rot:[0, Math.PI, 0],
                scale:[0.1, 0.1, 0.1]
            },
            weaponTent2:{
                model:'resources/Weapon tent 02.qef',
                pos:[152, 3, 45],
                rot:[0, -Math.PI*0.5, 0],
                scale:[0.1, 0.1, 0.1]
            },
            armourTent:{
                model:'resources/Armour tent.qef',
                pos:[168, 3, 56],
                rot:[0, Math.PI*0.5, 0],
                scale:[0.1, 0.1, 0.1]
            },
              */
            fruitTent:{
                model:'resources/Fruit tent.qef',
                pos:[176, 3, 82],
                rot:[0, -Math.PI*0.5, 0],
                scale:[0.1,0.1, 0.1]
            },
            fishMarket:{
                model:'resources/Fish market.qef',
                pos:[183, 3, 126],
                rot:[0, -Math.PI*0.5, 0],
                scale:[0.1,0.1, 0.1]
            },

            bookShop:{
                model:'resources/Book shop.qef',
                pos:[178, 3, 108],
                rot:[0, 0, 0],
                scale:[0.1,0.1, 0.1]
            },
            stage:{
                model:'resources/Stage.qef',
                pos:[104, 4, 118],
                rot:[0, Math.PI*0.5, 0],
                scale:[0.07,0.07, 0.07]
            },

            // crowd:{
            //     model:'resources/Crowd.qef',
            //     pos:[144, 1, 128],
            //     rot:[0, Math.PI*0.5, 0],
            //     scale:[0.1, 0.1, 0.1]
            // },
            // lantern_01:{
            //     model:'resources/Lantern 01.qef',
            //     pos:[174, 3, 85],
            //     rot:[0, Math.PI*0.5, 0],
            //     scale:[0.1,0.1, 0.1]
            // },
            // lantern_02:{
            //     model:'resources/Lantern 02.qef',
            //     pos:[174, 3, 75],
            //     rot:[0, Math.PI*0.5, 0],
            //     scale:[0.1,0.1, 0.1]
            // },
            // lantern_03:{
            //     model:'resources/Lantern 03.qef',
            //     pos:[174, 3, 80],
            //     rot:[0, Math.PI*0.5, 0],
            //     scale:[0.1,0.1, 0.1]
            // },
            // lantern_04:{
            //     model:'resources/Lantern 04.qef',
            //     pos:[174, 3, 70],
            //     rot:[0, Math.PI*0.5, 0],
            //     scale:[0.1,0.1, 0.1]
            // },
            // lantern_05:{
            //     model:'resources/Lantern 05.qef',
            //     pos:[178, 3, 85],
            //     rot:[0, Math.PI*0.5, 0],
            //     scale:[0.1,0.1, 0.1]
            // },
            // lantern_06:{
            //     model:'resources/Lantern 06.qef',
            //     pos:[178, 3, 75],
            //     rot:[0, Math.PI*0.5, 0],
            //     scale:[0.1,0.1, 0.1]
            // },
            // lantern_07:{
            //     model:'resources/Lantern 07.qef',
            //     pos:[178, 3, 80],
            //     rot:[0, Math.PI*0.5, 0],
            //     scale:[0.1,0.1, 0.1]
            // },
            // lantern_08:{
            //     model:'resources/Lantern 08.qef',
            //     pos:[178, 3, 70],
            //     rot:[0, Math.PI*0.5, 0],
            //     scale:[0.1,0.1, 0.1]
            // },
            // lantern_pole:{
            //     model:'resources/Lantern pole.qef',
            //     pos:[183, 3, 70],
            //     rot:[0, Math.PI*0.5, 0],
            //     scale:[0.1,0.1, 0.1]
            // },
            // Wizard:{
            //     model:'resources/Wizard.qef',
            //     pos:[185, 3, 95],
            //     rot:[0, Math.PI*1.5, 0],
            //     scale:[0.1,0.1, 0.1]
            // }
        },

        BLEND_STATES: {
            smoke:{
                blending: 'CustomBlending',
                blendEquation: 'AddEquation',
                blendSrc: 'SrcAlphaFactor',
                blendDst: 'OneMinusSrcAlphaFactor'
            },
            fire:{
                blending: 'CustomBlending',
                blendEquation: 'AddEquation',
                blendSrc: 'SrcAlphaFactor',
                blendDst: 'OneFactor'
            }
        },



        AMBIENT:{

            party_sparks: {

            }
       /*
      */
        },

        STATIONARY:{

            stream_1: {
                particles:"fountain_drops",
                blendState:"smoke",
                pos:[102, 2.2, 120],
                soundLoop:"FOUNTAIN_LOOP"
            },

            stream_2: {
                particles:"fountain_drops",
                blendState:"smoke",
                pos:[113, 2.2, 142],
                soundLoop:"FOUNTAIN_LOOP"
            },
		/*	Reduce performance req's by cutting here
            stream_3: {
                particles:"fountain_drops",
                blendState:"smoke",
                pos:[125, 2.2, 164],
                soundLoop:"FOUNTAIN_LOOP"
            },
            stream_4: {
                particles:"fountain_drops",
                blendState:"smoke",
                pos:[51, 2.2, 70],
                soundLoop:"FOUNTAIN_LOOP"
            },
		*/

			stream_5: {
				particles:"fountain_drops",
				blendState:"smoke",
				pos:[117, 3.2, 10],
				soundLoop:"FOUNTAIN_LOOP"
			}
        /*
*/
        },

        PARTICLES:{
            fountain_drops:{
                name:"fountain_drops",
                targetSpace:"null",
                textures: {
                    PARTICLE_TX:"resources/textures/particles/fieldring.png"
                },
                emitters:[{
                    totalParticlesToSpawn: -1,
                    releaseRatePerSecond : 5,
                    minLifetime : 0.3,
                    maxLifetime : 0.8
                }],
                timeline : [{
                    timeOffset : 0.01,
                    spin : 0,
                    mass : 1,
                    size : 0.0,
                    color : [0.85, 0.90, 1, 0]
                }, {
                    timeOffset : 0.6,
                    spin : 0,
                    size : 0.22,
                    color : [0.85, 0.9, 1.0, 1]
                }, {
                    timeOffset : 0.2,
                    spin : 0,
                    size : 0.4,
                    color : [1,1, 1, 0]
                }]
            },
            music_notes:{
                name:"music_notes",
                targetSpace:"null",
                textures: {
                    PARTICLE_TX:"resources/textures/particles/note.png"
                },
                emitters:[{
                    totalParticlesToSpawn: -1,
                    releaseRatePerSecond : 8,
                    minLifetime : 1.21,
                    maxLifetime : 3.26
                }],
                timeline : [{
                    timeOffset : 0,
                    spin : 0.1,
                    mass : 1,
                    size : 0.06,
                    color : [0.95, 0.95, 1, 0]
                }, {
                    timeOffset : 0.2,
                    spin : -0.2,
                    size : 0.72,
                    color : [0.85, 0.9, 1.0, 1]
                }, {
                    timeOffset : 0.8,
                    spin : 0.3,
                    size : 0.4,
                    color : [1,1, 1, 0]
                }]
            },
            party_sparks:{
                name:"party_sparks",
                targetSpace:"null",
                textures: {
                    PARTICLE_TX:"resources/textures/particles/energybullet.png"
                },
                emitters:[{
                    totalParticlesToSpawn: -1,
                    releaseRatePerSecond : 10,
                    minLifetime : 3.21,
                    maxLifetime : 6.56
                }],
                timeline : [{
                    timeOffset : 0,
                    spin : 0.3,
                    mass : 1,
                    size : 0.06,
                    color : [0.25, 0.95, 0.3, 0]
                }, {
                    timeOffset : 0.1,
                    spin : -0.4,
                    size : 0.72,
                    color : [0.85, 0.9, 0.4, 0.2]
                }, {
                    timeOffset : 0.12,
                    spin : 0.3,
                    size : 0.2,
                    color : [1,1, 0.6, 0.2]
                }, {
                    timeOffset : 0.06,
                    spin : -0.8,
                    size : 0.82,
                    color : [0.85, 0.6, 0.2, 0.4]
                }, {
                    timeOffset : 0.01,
                    spin : 0.3,
                    size : 0.4,
                    color : [1, 0.4, 0.6, 0.2]
                }, {
                    timeOffset : 0.05,
                    spin : -0.7,
                    size : 0.52,
                    color : [0.85, 1.0, 0.3, 0.7]
                }, {
                    timeOffset : 0.04,
                    spin : 0.6,
                    size : 0.2,
                    color : [1,0.4, 0.5, 0.1]
                }, {
                    timeOffset : 0.03,
                    spin : -0.2,
                    size : 0.52,
                    color : [0.35, 0.6, 1.0, 0.2]
                }, {
                    timeOffset : 0.01,
                    spin : 0.3,
                    size : 0.2,
                    color : [0.4, 1, 0.6, 0.2]
                }, {
                    timeOffset : 0.05,
                    spin : -0.6,
                    size : 0.42,
                    color : [0.85, 0.3, 1.0, 0.7]
                }, {
                    timeOffset : 0.04,
                    spin : 0.3,
                    size : 0.1,
                    color : [1, 0.4, 0.2, 0.1]
                }, {
                    timeOffset : 0.03,
                    spin : -0.2,
                    size : 0.52,
                    color : [0.55, 0.3, 1.0, 0.2]
                }, {
                    timeOffset : 0.02,
                    spin : 0.3,
                    size : 0.2,
                    color : [0.3, 0.4, 1.6, 0]
                }

                ]
            }
        }
    }
);
