define([
	// 'js/world/BloxWorld',
	'js/world/WorldData',
	'js/world/ParticleSystemFactory',
	'application/EventManager',
	'goo/math/Vector3',

	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',

	'goo/entities/components/ScriptComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/scripts/WASDControlScript',
	'goo/scripts/MouseLookControlScript',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent',

	'goo/entities/Entity',
	'goo/entities/components/LightDebugComponent',
	'goo/entities/EntityUtils',
	'goo/shapes/ShapeCreator',
	'goo/renderer/Material',
	'goo/renderer/Shader',
	'goo/renderer/MeshData',
	'goo/renderer/TextureCreator',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Util',
	'goo/addons/water/FlatWaterRenderer',

	'goo/entities/systems/ParticlesSystem',
	'goo/entities/components/ParticleComponent',
	'goo/particles/ParticleUtils',
	'goo/particles/ParticleEmitter',

	'goo/renderer/pass/Composer',
	'goo/renderer/pass/RenderPass',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/pass/RenderTarget',
	'goo/renderer/pass/BloomPass',
	'goo/renderer/pass/SSAOPass',
	'goo/math/Vector4',
	'goo/util/rsvp',
	'js/world/Player',
	'js/world/SkyDome',
	'goo/renderer/bounds/BoundingBox',
	'goo/noise/ValueNoise',
	'goo/loaders/DynamicLoader',
	'js/world/Tracer',
	'goo/renderer/shaders/ShaderBuilder',
],
/** @lends */

function(
	// BloxWorld,
	WorldData,
	ParticleSystemFactory,
	event,
	Vector3,

	Camera,
	CameraComponent,
	MeshDataComponent,
	MeshRendererComponent,

	ScriptComponent,
	OrbitCamControlScript,
	WASDControlScript,
	MouseLookControlScript,
	DirectionalLight,
	SpotLight,
	PointLight,
	LightComponent,

	Entity,
	LightDebugComponent,
	EntityUtils,
	ShapeCreator,
	Material,
	Shader,
	MeshData,
	TextureCreator,
	ShaderLib,
	Util,
	FlatWaterRenderer,
	ParticlesSystem,
	ParticleComponent,
	ParticleUtils,
	ParticleEmitter,

	Composer,
	RenderPass,
	FullscreenPass,
	RenderTarget,
	BloomPass,
	SSAOPass,
	Vector4,
	RSVP,
	Player,
	SkyDome,
	BoundingBox,
	ValueNoise,
	DynamicLoader,
	Tracer,
	ShaderBuilder
) {
	"use strict";

	function composeSceneModels(sceneData) {
		var modelList = [];
		for (var index in sceneData) {
			modelList.push([sceneData[index].model, new Vector3(sceneData[index].pos), sceneData[index].rot, new Vector3(sceneData[index].scale), !! sceneData[index].doPerlin]);
		}
		return modelList;
	};

	function WorldEngine(goo, audioEngine) {
		this.audioEngine = audioEngine;
		this.textureCreator = new TextureCreator();
		this.goo = goo;

		goo.renderer.setClearColor(0, 0, 0, 1);

		// this.material = Material.createMaterial(vox);
		this.material = Material.createMaterial(vox2);
		this.materialAnim = Material.createMaterial(anim);

		// Scene render
		// 		var renderPass = new RenderPass(goo.renderSystem.renderList);
		// 		renderPass.clearColor = new Vector4(0.1, 0.1, 0.1, 0.0);

		// 		var ssaoPass = new SSAOPass(goo.renderSystem.renderList);

		// 		// Regular copy
		// 		var shader = Util.clone(ShaderLib.copy);
		// 		var outPass = new FullscreenPass(shader);
		// 		outPass.renderToScreen = true;

		// 		// Create composer with same size as screen
		// 		// var width = window.innerWidth/4;
		// 		// var height = window.innerHeight/4;
		// 		// var composerTarget = new RenderTarget(width, height, {
		// 			// magFilter : 'NearestNeighbor',
		// //				minFilter : 'NearestNeighborNoMipMaps'
		// 		// });

		// 		// var composer = new Composer(composerTarget);
		// 		var composer = new Composer();

		// 		composer.addPass(renderPass);
		// 		composer.addPass(ssaoPass);
		// 		// composer.addPass(outPass);

		// 		goo.renderSystem.composers.push(composer);

		var modelList = composeSceneModels(WorldData.SCENE);
		var promises = [];
		for (var i = 0; i < modelList.length; i++) {
			var model = modelList[i];
			promises.push(this.loadModel(goo, model[0], model[1], model[2], model[3], model[4]));
		}

		var animatedModelList = composeSceneModels(WorldData.ANIMATED_SCENE);
		for (var i = 0; i < animatedModelList.length; i++) {
			var model = animatedModelList[i];
			promises.push(this.loadAnimatedModel(goo, model[0], model[1], model[2], model[3], model[4]));
		}

		RSVP.all(promises).then(function(data) {
			var camera = new Camera(55, 2.35, 0.1, 1000);
			var cameraEntity = goo.world.createEntity('ViewCameraEntity');
			var cameraComponent = new CameraComponent(camera);
			cameraEntity.setComponent(cameraComponent);

			cameraEntity.transformComponent.setTranslation(200, 50, 80);
			cameraEntity.transformComponent.lookAt(new Vector3(110, 0, 80), Vector3.UNIT_Y);

			cameraEntity.addToWorld();

			var baseBloxWorld = data[0];
			for (var i = data.length - 1; i >= 1; i--) {
				var obj = data[i];
				for (var x in obj) {
					delete obj[x];
				}
			};
			var bloxWorld = {
				getBlock: function(x, y, z) {
					if (x < 0 || x >= baseBloxWorld.dims[0] || y < 0 || y >= baseBloxWorld.dims[1] || z < 0 || z >= baseBloxWorld.dims[2]) {
						return 1;
					}
					var index = x + (y + z * baseBloxWorld.dims[1]) * baseBloxWorld.dims[0];
					return baseBloxWorld.voxels[index];
				}.bind(this)
			};
			var player = new Player(goo, bloxWorld, audioEngine);

			var light = new PointLight();
			light.specularIntensity = 0;
			light.color.setd(1, 0.2, 0.01);
			light.range = 60;
			var lightEntity = goo.world.createEntity('light');
			lightEntity.setComponent(new LightComponent(light));
			lightEntity.transformComponent.setTranslation(120, 20, 108);
			lightEntity.addToWorld();
			lightEntity.setComponent(new ScriptComponent({
				run: function(entity) {
					var t = entity._world.time;

					entity.transformComponent.transform.translation.y = 15 + Math.sin(t * 3) * 5;
					entity.transformComponent.setUpdated();
				}
			}));

			var light = new PointLight();
			light.specularIntensity = 0;
			light.color.setd(1, 1, 0.6);
			light.range = 20;
			var lightEntity = goo.world.createEntity('light');
			lightEntity.setComponent(new LightComponent(light));
			lightEntity.transformComponent.setTranslation(150, 10, 110);
			lightEntity.addToWorld();
			lightEntity.setComponent(new ScriptComponent({
				run: function(entity) {
					var t = entity._world.time;

					entity.transformComponent.transform.translation.x = 150 + Math.sin(t * 0.2) * 40;
					entity.transformComponent.transform.translation.z = 110 + Math.cos(t * 0.35) * 40;
					entity.transformComponent.setUpdated();
				}
			}));

			var light = new PointLight();
			light.specularIntensity = 0;
			light.color.setd(1, 1, 0.7);
			light.range = 50;
			var lightEntity = goo.world.createEntity('light');
			lightEntity.setComponent(new LightComponent(light));
			lightEntity.transformComponent.setTranslation(161, 10, 85);
			lightEntity.addToWorld();

			var skyDomeEntity = createSkyDome(goo);
			skyDomeEntity.transformComponent.transform.setRotationXYZ(-Math.PI / 2, 0, 0);
			skyDomeEntity.transformComponent.setUpdated();

			goo.callbacks.push(function(tpf) {
				tpf = Math.min(tpf, 1.0);

				player.update(bloxWorld, tpf);

				camera.translation.copy(player.position);
				camera.translation.y += 3.7;
				camera._direction.copy(player.direction);
				camera._left.copy(player.left);
				camera._up.copy(player.up);
				camera.onFrameChange();

				skyDomeEntity.transformComponent.transform.translation.copy(camera.translation);
				skyDomeEntity.transformComponent.setUpdated();
			});

			goo.startGameLoop();
		}.bind(this)).then(null, function(error) {
			console.error(error.stack);
		});
	}

	WorldEngine.prototype.loadAnimatedModel = function(goo, path, position, rot, scale) {
		var promise = new RSVP.Promise();
		event.fireEvent(event.list().LOAD_PROGRESS, {
			started: 1,
			completed: 0,
			errors: 0
		});
		var loader = new DynamicLoader({
			world: goo.world,
			rootPath: 'resources/goo_data/' + path
		});
		loader.load('Project.project').then(function(configs) {
			var rootEntity = loader.getCachedObjectForRef(path + '/entities/RootNode.entity');
			rootEntity.transformComponent.transform.translation.setv(position);
			rootEntity.transformComponent.transform.rotation.fromAngles(rot[0], rot[1], rot[2]);
			rootEntity.transformComponent.transform.scale.setv(scale);
			rootEntity.transformComponent.setUpdated();

			EntityUtils.traverse(rootEntity, function(entity) {
				if (entity.meshRendererComponent) {
					entity.meshRendererComponent.materials[0].shader = this.materialAnim.shader;
					var material = entity.meshRendererComponent.materials[0];
					material.uniforms.materialAmbient = [0.1, 0.15, 0.3, 1.0];
				}
			}.bind(this));

			promise.resolve(configs);
			event.fireEvent(event.list().LOAD_PROGRESS, {
				started: 0,
				completed: 1,
				errors: 0
			});
		}.bind(this)).then(null, function(error) {
			promise.reject(error);
			event.fireEvent(event.list().LOAD_PROGRESS, {
				started: 0,
				completed: 0,
				errors: 1
			});
		});

		return promise;
	};

	WorldEngine.prototype.loadModel = function(goo, url, position, rot, scale, doPerlin) {
		var promise = new RSVP.Promise();
		event.fireEvent(event.list().LOAD_PROGRESS, {
			started: 1,
			completed: 0,
			errors: 0
		});
		this.loadVoxel(url, doPerlin).then(function(data) {
			// var bloxWorld = new BloxWorld(goo, 1, 1, data.dims, data.types);
			// var rootEntity = bloxWorld.buildEntities(data.voxels);
			// rootEntity.transformComponent.transform.translation.setv(position);
			// rootEntity.transformComponent.transform.rotation.fromAngles(rot[0], rot[1], rot[2]);
			// rootEntity.transformComponent.transform.scale.setv(scale);
			// rootEntity.transformComponent.setUpdated();

			var rootEntity = data.root;
			rootEntity.transformComponent.transform.translation.setv(position);
			rootEntity.transformComponent.transform.rotation.fromAngles(rot[0], rot[1], rot[2]);
			rootEntity.transformComponent.transform.scale.setv(scale);
			rootEntity.transformComponent.setUpdated();

			EntityUtils.traverse(rootEntity, function(entity) {
				if (entity.meshRendererComponent) {
					var material = entity.meshRendererComponent.materials[0];
					material.materialState.ambient = [0.1, 0.15, 0.3, 1.0];
				}
			});

			promise.resolve(data);
			event.fireEvent(event.list().LOAD_PROGRESS, {
				started: 0,
				completed: 1,
				errors: 0
			});
		}).then(null, function(error) {
			promise.reject(error);
			event.fireEvent(event.list().LOAD_PROGRESS, {
				started: 0,
				completed: 0,
				errors: 1
			});
		});
		return promise;
	};

	WorldEngine.prototype.loadVoxel = function(url, doPerlin) {
		var promise = new RSVP.Promise();
		event.fireEvent(event.list().LOAD_PROGRESS, {
			started: 1,
			completed: 0,
			errors: 0
		});
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.onreadystatechange = function() {
			if (request.readyState === 4) {
				if (request.status >= 200 && request.status <= 299) {
					var data = this._loadQEFMesh(request.response, doPerlin);
					// var data = this._loadQEF(request.response);
					promise.resolve(data);
					event.fireEvent(event.list().LOAD_PROGRESS, {
						started: 0,
						completed: 1,
						errors: 0
					});
				} else {
					promise.reject(request.statusText);
					event.fireEvent(event.list().LOAD_PROGRESS, {
						started: 0,
						completed: 0,
						errors: 1
					});
				}
			}
		}.bind(this);
		request.send();

		return promise;
	};

	var meshData = ShapeCreator.createSphere(8, 8, 1);
	var material = Material.createMaterial(Util.clone(ShaderLib.simpleColored), 'BoxMaterial');

	WorldEngine.prototype.createSphereEntity = function(goo, color) {
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
		material.shader.uniforms.color = color;
		material.blendState = WorldData.BLEND_STATES.fire;
		entity.meshRendererComponent.materials.push(material);

		return entity;
	};

	function vertexAO(side1, side2, corner) {
		// return 1.0;
		if (side1 && side2) {
			return 0.5;
		}
		return ((3 - (side1 + side2 + corner)) / 3) * 0.5 + 0.5;
	}

	function addColor(colors, r, g, b, occlusion, lighting) {
		occlusion = 4 - occlusion * 3;
		colors.push(Math.pow(r, occlusion) * lighting[0], Math.pow(g, occlusion) * lighting[1], Math.pow(b, occlusion) * lighting[2]);
		// colors.push(r * occlusion * lighting, g * occlusion * lighting, b * occlusion * lighting, 1);
	}

	var splitreg = /\r?\n/;
	WorldEngine.prototype._loadQEFMesh = function(data, doPerlin) {
		var lines = data.split(splitreg);

		// volume dimensions
		var dims = lines[3].split(' ').map(function(v) {
			return parseInt(v, 10);
		});
		var nTypes = parseInt(lines[4]);

		var headerNLines = 3;

		//==== types ==================================================================
		var typesStart = headerNLines + 2;
		var types = new Array(nTypes);

		for (var i = typesStart, ii = 0; i < typesStart + nTypes; i++, ii++) {
			var lineAr = lines[i].split(' ');
			types[ii] = {
				r: parseFloat(lineAr[0], 10),
				g: parseFloat(lineAr[1], 10),
				b: parseFloat(lineAr[2], 10)
			};
		}

		//==== voxels =================================================================
		var voxelsStart = headerNLines + 2 + nTypes;
		var voxels = [];

		for (var i = voxelsStart; i < lines.length; i++) {
			var lineAr = lines[i].split(' ');
			if (lineAr.length === 5) {
				voxels.push({
					x: parseInt(lineAr[0], 10),
					y: parseInt(lineAr[1], 10),
					z: parseInt(lineAr[2], 10),
					type: parseInt(lineAr[3], 10),
					mask: parseInt(lineAr[4], 10)
				});
			}
		}

		//==== packing ================================================================
		var volume = [];
		for (var i = 0; i < dims[0] * dims[1] * dims[2]; i++) {
			volume[i] = 0;
		}

		for (var i = 0; i < voxels.length; i++) {
			var voxel = voxels[i];
			var x = voxel.x;
			var y = voxel.y;
			var z = voxel.z;
			volume[x + (y + z * dims[1]) * dims[0]] = voxel.type + 1;
		}

		var meshes = [];
		var currentMesh = {
			faceCount: 0,
			vertices: [],
			colors: [],
			normals: [],
			indices: []
		};
		meshes.push(currentMesh);

		var get = function(x, y, z) {
			if (x < 0 || x >= dims[0] || y < 0 || y >= dims[1] || z < 0 || z >= dims[2]) {
				return 0;
			}
			return volume[x + (y + z * dims[1]) * dims[0]] === 0 ? 0 : 1;
		};
		// var set = function(buffer, x, y, z, value) {
		// 	if (x < 0 || x >= dims[0] || y < 0 || y >= dims[1] || z < 0 || z >= dims[2]) {
		// 		return;
		// 	}
		// 	buffer[x + (y + z * dims[1]) * dims[0]] = value;
		// };

		// var tracer = new Tracer({
		// 	getBlock: get
		// });

		var lights = [
			// [1.0,0.7,0.7], //right
			// [1.0,0.7,0.7], //left
			// [0.1,0.2,0.3], //top
			// [0.6,0.2,0.2], //bottom
			// [1.1,1.1,0.9], //front
			// [1.0,0.7,0.7], //back

			// [0.1+sunval,0.2+sunval,0.5], //right
			// [0.1+sunval,0.2+sunval,0.5], //left
			// [0.1+sunval,0.2+sunval,0.5], //top
			// [0.1+sunval,0.2+sunval,0.5], //bottom
			// [0.1+sunval,0.2+sunval,0.5], //front
			// [0.1+sunval,0.2+sunval,0.5], //back

			[1, 1, 1], //right
			[1, 1, 1], //left
			[1, 1, 1], //top
			[1, 1, 1], //bottom
			[1, 1, 1], //front
			[1, 1, 1], //back
		];

		// var minx = 1000, miny = 1000, minz = 1000, maxx = -1000, maxy = -1000, maxz = -1000;
		for (var i = 0; i < voxels.length; i++) {
			var voxel = voxels[i];

			var mask = voxel.mask;
			if (mask === 1) {
				console.log("INVISIBLE");
				continue;
			}

			var x = voxel.x;
			
			var y = voxel.y;
			var z = voxel.z;

			var type = types[voxel.type];
			var r = type.r;
			var g = type.g;
			var b = type.b;

			if (doPerlin) {
				var noise = ValueNoise.evaluate3d(x, y, z, 10) * 0.2 - 0.1;
				r += noise;
				g += noise;
				b += noise;
			}

			var vertices = currentMesh.vertices;
			var colors = currentMesh.colors;
			var normals = currentMesh.normals;
			var indices = currentMesh.indices;

			var occlusion = 1;
			var sunval = y / 200;
			var lighting = 1;
			var suntraceLength = 100;

			if ((mask & 2) === 2) {
				// 	// -> right face visible
				vertices.push(x + 1, y, z);
				vertices.push(x + 1, y, z + 1);
				vertices.push(x + 1, y + 1, z + 1);
				vertices.push(x + 1, y + 1, z);

				lighting = lights[0];
				occlusion = vertexAO(get(x + 1, y, z - 1), get(x + 1, y - 1, z), get(x + 1, y - 1, z - 1));
				addColor(colors, r, g, b, occlusion, lighting)
				occlusion = vertexAO(get(x + 1, y, z + 1), get(x + 1, y - 1, z), get(x + 1, y - 1, z + 1));
				addColor(colors, r, g, b, occlusion, lighting)
				occlusion = vertexAO(get(x + 1, y, z + 1), get(x + 1, y + 1, z), get(x + 1, y + 1, z + 1));
				addColor(colors, r, g, b, occlusion, lighting)
				occlusion = vertexAO(get(x + 1, y, z - 1), get(x + 1, y + 1, z), get(x + 1, y + 1, z - 1));
				addColor(colors, r, g, b, occlusion, lighting)

				normals.push(1, 0, 0);
				normals.push(1, 0, 0);
				normals.push(1, 0, 0);
				normals.push(1, 0, 0);

				var index = currentMesh.faceCount * 4;
				indices.push(index, index + 3, index + 2, index, index + 2, index + 1);
				currentMesh.faceCount++;
			}
			if ((mask & 4) === 4) {
				// -> left face visible
				vertices.push(x, y, z);
				vertices.push(x, y, z + 1);
				vertices.push(x, y + 1, z + 1);
				vertices.push(x, y + 1, z);

				lighting = lights[1];
				occlusion = vertexAO(get(x - 1, y, z - 1), get(x - 1, y - 1, z), get(x - 1, y - 1, z - 1));
				addColor(colors, r, g, b, occlusion, lighting)
				occlusion = vertexAO(get(x - 1, y, z + 1), get(x - 1, y - 1, z), get(x - 1, y - 1, z + 1));
				addColor(colors, r, g, b, occlusion, lighting)
				occlusion = vertexAO(get(x - 1, y, z + 1), get(x - 1, y + 1, z), get(x - 1, y + 1, z + 1));
				addColor(colors, r, g, b, occlusion, lighting)
				occlusion = vertexAO(get(x - 1, y, z - 1), get(x - 1, y + 1, z), get(x - 1, y + 1, z - 1));
				addColor(colors, r, g, b, occlusion, lighting)

				normals.push(-1, 0, 0);
				normals.push(-1, 0, 0);
				normals.push(-1, 0, 0);
				normals.push(-1, 0, 0);

				var index = currentMesh.faceCount * 4;
				indices.push(index, index + 1, index + 2, index, index + 2, index + 3);
				currentMesh.faceCount++;
			}
			if ((mask & 8) === 8) {
				// -> top face visible
				vertices.push(x, y + 1, z);
				vertices.push(x + 1, y + 1, z);
				vertices.push(x + 1, y + 1, z + 1);
				vertices.push(x, y + 1, z + 1);

				lighting = lights[2];
				occlusion = vertexAO(get(x - 1, y + 1, z), get(x, y + 1, z - 1), get(x - 1, y + 1, z - 1));
				addColor(colors, r, g, b, occlusion, lighting)
				occlusion = vertexAO(get(x + 1, y + 1, z), get(x, y + 1, z - 1), get(x + 1, y + 1, z - 1));
				addColor(colors, r, g, b, occlusion, lighting)
				occlusion = vertexAO(get(x + 1, y + 1, z), get(x, y + 1, z + 1), get(x + 1, y + 1, z + 1));
				addColor(colors, r, g, b, occlusion, lighting)
				occlusion = vertexAO(get(x - 1, y + 1, z), get(x, y + 1, z + 1), get(x - 1, y + 1, z + 1));
				addColor(colors, r, g, b, occlusion, lighting)

				normals.push(0, 1, 0);
				normals.push(0, 1, 0);
				normals.push(0, 1, 0);
				normals.push(0, 1, 0);

				var index = currentMesh.faceCount * 4;
				indices.push(index, index + 3, index + 2, index, index + 2, index + 1);
				currentMesh.faceCount++;
			}
			if ((mask & 16) === 16 && y > 2) {
				// -> bottom face visible
				vertices.push(x, y, z);
				vertices.push(x + 1, y, z);
				vertices.push(x + 1, y, z + 1);
				vertices.push(x, y, z + 1);

				lighting = lights[3];
				occlusion = vertexAO(get(x - 1, y - 1, z), get(x, y - 1, z - 1), get(x - 1, y - 1, z - 1));
				addColor(colors, r, g, b, occlusion, lighting)
				occlusion = vertexAO(get(x + 1, y - 1, z), get(x, y - 1, z - 1), get(x + 1, y - 1, z - 1));
				addColor(colors, r, g, b, occlusion, lighting)
				occlusion = vertexAO(get(x + 1, y - 1, z), get(x, y - 1, z + 1), get(x + 1, y - 1, z + 1));
				addColor(colors, r, g, b, occlusion, lighting)
				occlusion = vertexAO(get(x - 1, y - 1, z), get(x, y - 1, z + 1), get(x - 1, y - 1, z + 1));
				addColor(colors, r, g, b, occlusion, lighting)

				normals.push(0, -1, 0);
				normals.push(0, -1, 0);
				normals.push(0, -1, 0);
				normals.push(0, -1, 0);

				var index = currentMesh.faceCount * 4;
				indices.push(index, index + 1, index + 2, index, index + 2, index + 3);
				currentMesh.faceCount++;
			}
			if ((mask & 32) === 32) {
				// -> front face visible
				vertices.push(x, y, z + 1);
				vertices.push(x + 1, y, z + 1);
				vertices.push(x + 1, y + 1, z + 1);
				vertices.push(x, y + 1, z + 1);

				lighting = lights[4];
				occlusion = vertexAO(get(x - 1, y, z + 1), get(x, y - 1, z + 1), get(x - 1, y - 1, z + 1));
				addColor(colors, r, g, b, occlusion, lighting)
				occlusion = vertexAO(get(x + 1, y, z + 1), get(x, y - 1, z + 1), get(x + 1, y - 1, z + 1));
				addColor(colors, r, g, b, occlusion, lighting)
				occlusion = vertexAO(get(x + 1, y, z + 1), get(x, y + 1, z + 1), get(x + 1, y + 1, z + 1));
				addColor(colors, r, g, b, occlusion, lighting)
				occlusion = vertexAO(get(x - 1, y, z + 1), get(x, y + 1, z + 1), get(x - 1, y + 1, z + 1));
				addColor(colors, r, g, b, occlusion, lighting)

				normals.push(1, 0, 0);
				normals.push(1, 0, 0);
				normals.push(1, 0, 0);
				normals.push(1, 0, 0);

				var index = currentMesh.faceCount * 4;
				indices.push(index, index + 1, index + 2, index, index + 2, index + 3);
				currentMesh.faceCount++;
			}
			if ((mask & 64) === 64) {
				// -> back face visible
				vertices.push(x, y, z);
				vertices.push(x + 1, y, z);
				vertices.push(x + 1, y + 1, z);
				vertices.push(x, y + 1, z);

				lighting = lights[5];
				occlusion = vertexAO(get(x - 1, y, z - 1), get(x, y - 1, z - 1), get(x - 1, y - 1, z - 1));
				addColor(colors, r, g, b, occlusion, lighting)
				occlusion = vertexAO(get(x + 1, y, z - 1), get(x, y - 1, z - 1), get(x + 1, y - 1, z - 1));
				addColor(colors, r, g, b, occlusion, lighting)
				occlusion = vertexAO(get(x + 1, y, z - 1), get(x, y + 1, z - 1), get(x + 1, y + 1, z - 1));
				addColor(colors, r, g, b, occlusion, lighting)
				occlusion = vertexAO(get(x - 1, y, z - 1), get(x, y + 1, z - 1), get(x - 1, y + 1, z - 1));
				addColor(colors, r, g, b, occlusion, lighting)

				normals.push(-1, 0, 0);
				normals.push(-1, 0, 0);
				normals.push(-1, 0, 0);
				normals.push(-1, 0, 0);

				var index = currentMesh.faceCount * 4;
				indices.push(index, index + 3, index + 2, index, index + 2, index + 1);
				currentMesh.faceCount++;
			}

			if (currentMesh.faceCount * 4 > 65300) {
				currentMesh = {
					faceCount: 0,
					vertices: [],
					colors: [],
					normals: [],
					indices: []
				};
				meshes.push(currentMesh);
			}
		}

		get = null;
		voxels = null;

		var rootEntity = this.goo.world.createEntity('root');
		rootEntity.addToWorld();

		for (var meshIndex = 0; meshIndex < meshes.length; meshIndex++) {
			var mesh = meshes[meshIndex];
			var faceCount = mesh.faceCount;

			if (faceCount === 0) {
				continue;
			}

			var attributeMap = {
				POSITION: MeshData.createAttribute(3, 'Float'),
				COLOR: MeshData.createAttribute(3, 'Float'),
				NORMAL: MeshData.createAttribute(3, 'Float')
			};
			var meshData = new MeshData(attributeMap, faceCount * 4, faceCount * 6);
			meshData.wireframeData = null;

			meshData.getAttributeBuffer('POSITION').set(mesh.vertices);
			meshData.getAttributeBuffer('COLOR').set(mesh.colors);
			meshData.getAttributeBuffer('NORMAL').set(mesh.normals);
			meshData.getIndexBuffer().set(mesh.indices);

			var entity = this.createChunkEntity(meshData, dims[0] / 2, dims[1] / 2, dims[2] / 2, dims[0] / 2, dims[1] / 2, dims[2] / 2);
			entity.addToWorld();
			rootEntity.transformComponent.attachChild(entity.transformComponent);

			mesh.vertices = null;
			mesh.colors = null;
			mesh.normals = null;
			mesh.indices = null;
		}
		meshes = null;

		var json = {
			dims: dims,
			types: types,
			voxels: volume,
			root: rootEntity
		};

		return json;
	};

	WorldEngine.prototype.createChunkEntity = function(meshData, xCenter, yCenter, zCenter, xExtent, yExtent, zExtent) {
		var world = this.goo.world;

		var entity = world.createEntity();
		var meshDataComponent = new MeshDataComponent(meshData);
		var boundingCenter = new Vector3(xCenter, yCenter, zCenter);
		meshDataComponent.setModelBound(new BoundingBox(boundingCenter, xExtent, yExtent, zExtent), false);
		entity.setComponent(meshDataComponent);

		var meshRendererComponent = new MeshRendererComponent();
		meshRendererComponent.castShadows = true;
		meshRendererComponent.materials.push(this.material);
		entity.setComponent(meshRendererComponent);

		return entity;
	};

	var vox = {
		processors: [
			ShaderBuilder.light.processor
		],
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexColor: MeshData.COLOR,
			vertexNormal: MeshData.NORMAL
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			cameraPosition: Shader.CAMERA,
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec3 vertexColor;',
			'attribute vec3 vertexNormal;',

			'uniform mat4 viewProjectionMatrix;',
			'uniform mat4 worldMatrix;',
			'uniform vec3 cameraPosition;',

			'varying vec3 color;',
			'varying vec3 normal;',
			'varying vec3 viewPosition;',
			'varying vec3 vWorldPos;',

			ShaderBuilder.light.prevertex,
			ShaderBuilder.light.prefragment,

			'void main(void) {',
			'color = vertexColor;',
			'vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
			'vWorldPos = worldPos.xyz;',
			'gl_Position = viewProjectionMatrix * worldPos;',
			'viewPosition = cameraPosition - worldPos.xyz;',
			'normal = normalize((worldMatrix * vec4(vertexNormal, 0.0)).xyz);',
			ShaderBuilder.light.vertex,

			"#if MAX_POINT_LIGHTS > 0",
			"vec3 pointDiffuse  = vec3(0.0);",

			"for (int i = 0; i < MAX_POINT_LIGHTS; i++) {",
			'vec3 lVector = normalize(pointLight[i].xyz - vWorldPos.xyz);',
			"float lDistance = 1.0 - min((length(pointLight[i].xyz - vWorldPos.xyz) / pointLight[i].w), 1.0);",

			// diffuse
			"float dotProduct = dot(normal, lVector);",
			"float pointDiffuseWeight = max(dotProduct, 0.0);",
			"pointDiffuse += materialDiffuse.rgb * pointLightColor[i].rgb * pointDiffuseWeight * lDistance;",
			"}",
			"#endif",

			"vec3 ambient = materialAmbient.rgb;",
			"ambient.r += vWorldPos.y / 200.0;",
			"ambient.b -= vWorldPos.y / 300.0;",
			"ambient.g += vWorldPos.y / 400.0;",
			"color.xyz *= pointDiffuse + ambient;",
			'}'
		].join('\n'),
		fshader: [ //
			'varying vec3 color;',
			'varying vec3 normal;',
			'varying vec3 viewPosition;',
			'varying vec3 vWorldPos;',

			'const float density = 0.005;', //
			'const float LOG2 = 1.442695;', //

			'void main(void) {',
			'	float z = gl_FragCoord.z / gl_FragCoord.w;', //
			'	float fogFactor = exp2( -density * ', //
			'				   density * ', //
			'				   z * ', //
			'				   z * ', //
			'				   LOG2 );', //
			'	fogFactor = clamp(fogFactor, 0.0, 1.0);', //

			'	vec4 final_color = vec4(color, 1.0);',

			'	gl_FragColor = mix(vec4(0.05, 0.1, 0.3, 1.0), final_color, fogFactor );', //
			'}'
		].join('\n')
	};

	var vox2 = {
		processors: [
			ShaderBuilder.light.processor
		],
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexColor: MeshData.COLOR,
			vertexNormal: MeshData.NORMAL
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec4 vertexColor;',
			'attribute vec3 vertexNormal;',

			'uniform mat4 viewProjectionMatrix;',
			'uniform mat4 worldMatrix;',

			'varying vec4 color;',
			'varying vec3 normal;',
			'varying vec3 vWorldPos;',

			ShaderBuilder.light.prevertex,

			'void main(void) {',
			'color = vertexColor;',
			'vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
			'vWorldPos = worldPos.xyz;',
			'gl_Position = viewProjectionMatrix * worldPos;',
			'normal = normalize((worldMatrix * vec4(vertexNormal, 0.0)).xyz);',
			ShaderBuilder.light.vertex,
			'}'
		].join('\n'),
		fshader: [
			'varying vec4 color;',
			'varying vec3 normal;',
			'varying vec3 vWorldPos;',

			'const float density = 0.005;',
			'const float LOG2 = 1.442695;',

			ShaderBuilder.light.prefragment,

			'void main(void) {',
			'	float z = gl_FragCoord.z / gl_FragCoord.w;',
			'	float fogFactor = exp2( -density * ',
			'				   density * ',
			'				   z * ',
			'				   z * ',
			'				   LOG2 );',
			'	fogFactor = clamp(fogFactor, 0.0, 1.0);',

			"#if MAX_POINT_LIGHTS > 0",
			"vec3 pointDiffuse  = vec3(0.0);",

			"for (int i = 0; i < MAX_POINT_LIGHTS; i++) {",
			'vec3 lVector = normalize(pointLight[i].xyz - vWorldPos.xyz);',
			"float lDistance = 1.0 - min((length(pointLight[i].xyz - vWorldPos.xyz) / pointLight[i].w), 1.0);",

			"float dotProduct = dot(normal, lVector);",
			"float pointDiffuseWeight = max(dotProduct, 0.0);",
			"pointDiffuse += materialDiffuse.rgb * pointLightColor[i].rgb * pointDiffuseWeight * lDistance;",
			"}",
			"#endif",

			"vec3 ambient = materialAmbient.rgb;",
			"ambient.r += vWorldPos.y / 200.0;",
			"ambient.b -= vWorldPos.y / 300.0;",
			"ambient.g += vWorldPos.y / 400.0;",

			'	gl_FragColor = mix(vec4(0.05, 0.1, 0.3, 1.0), color * vec4(pointDiffuse + ambient, 1.0), fogFactor );',
			'}'
		].join('\n')
	};

	var anim = {
		processors: [
			ShaderBuilder.uber.processor,
			ShaderBuilder.light.processor,
			ShaderBuilder.animation.processor
		],
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0,
			vertexNormal: MeshData.NORMAL,
			vertexJointIDs: MeshData.JOINTIDS,
			vertexWeights: MeshData.WEIGHTS
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			diffuseMap: Shader.DIFFUSE_MAP,
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec3 vertexNormal;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewProjectionMatrix;',
			'uniform mat4 worldMatrix;',

			'varying vec2 texCoord0;',
			'varying vec4 color;',

			ShaderBuilder.light.prevertex,
			ShaderBuilder.light.prefragment,
			ShaderBuilder.animation.prevertex,

			'void main(void) {',
			'mat4 wMatrix = worldMatrix;',
			ShaderBuilder.animation.vertex,
			'vec4 worldPos = wMatrix * vec4(vertexPosition, 1.0);',
			'vec3 vWorldPos = worldPos.xyz;',
			'gl_Position = viewProjectionMatrix * worldPos;',
			'vec3 normal = normalize((wMatrix * vec4(vertexNormal, 0.0)).xyz);',
			'texCoord0 = vertexUV0;',

			"#if MAX_POINT_LIGHTS > 0",
			"vec3 pointDiffuse  = vec3(0.0);",

			"for (int i = 0; i < MAX_POINT_LIGHTS; i++) {",
			'vec3 lVector = normalize(pointLight[i].xyz - vWorldPos.xyz);',
			"float lDistance = 1.0 - min((length(pointLight[i].xyz - vWorldPos.xyz) / pointLight[i].w), 1.0);",

			"float dotProduct = dot(normal, lVector);",
			"float pointDiffuseWeight = max(dotProduct, 0.0);",
			"pointDiffuse += materialDiffuse.rgb * pointLightColor[i].rgb * pointDiffuseWeight * lDistance;",
			"}",
			"#endif",

			"vec3 ambient = materialAmbient.rgb;",
			"ambient.r += vWorldPos.y / 200.0;",
			"ambient.b -= vWorldPos.y / 300.0;",
			"ambient.g += vWorldPos.y / 400.0;",
			"color.xyz = pointDiffuse + ambient;",
			'}'
		].join('\n'),
		fshader: [ //
			'uniform sampler2D diffuseMap;',

			'varying vec2 texCoord0;',
			'varying vec4 color;',

			'const float density = 0.005;',
			'const float LOG2 = 1.442695;',

			'void main(void) {',
			'	float z = gl_FragCoord.z / gl_FragCoord.w;',
			'	float fogFactor = exp2( -density * ',
			'				   density * ',
			'				   z * ',
			'				   z * ',
			'				   LOG2 );',
			'	fogFactor = clamp(fogFactor, 0.0, 1.0);',

			'	vec4 final_color = color * texture2D(diffuseMap, texCoord0);',

			'	gl_FragColor = mix(vec4(0.05, 0.1, 0.3, 1.0), final_color, fogFactor );',
			'}'
		].join('\n')
	};

	WorldEngine.prototype._loadQEF = function(data) {
		var lines = data.split(/\r?\n/);

		// volume dimensions
		var dims = lines[3].split(' ').map(function(v) {
			return parseInt(v, 10);
		});
		var nTypes = parseInt(lines[4]);

		var headerNLines = 3;

		//==== types ==================================================================
		var typesStart = headerNLines + 2;
		var types = new Array(nTypes);

		for (var i = typesStart, ii = 0; i < typesStart + nTypes; i++, ii++) {
			var lineAr = lines[i].split(' ');
			types[ii] = {
				r: parseFloat(lineAr[0], 10),
				g: parseFloat(lineAr[1], 10),
				b: parseFloat(lineAr[2], 10)
			};
		}

		//==== voxels =================================================================
		var voxelsStart = headerNLines + 2 + nTypes;
		var voxels = [];

		for (var i = voxelsStart; i < lines.length; i++) {
			var lineAr = lines[i].split(' ');
			if (lineAr.length === 5) {
				voxels.push({
					x: parseInt(lineAr[0], 10),
					y: parseInt(lineAr[1], 10),
					z: parseInt(lineAr[2], 10),
					type: parseInt(lineAr[3], 10),
					mask: parseInt(lineAr[4], 10)
				});
			}
		}

		//==== packing ================================================================
		var volume = [];
		for (var i = 0; i < dims[0] * dims[1] * dims[2]; i++) {
			volume[i] = 0;
		}
		for (var i = 0; i < voxels.length; i++) {
			var voxel = voxels[i];
			// volume[voxel.x][voxel.z][voxel.y] = voxel.type + 1;
			volume[voxel.x + (voxel.y + voxel.z * dims[1]) * dims[0]] = voxel.type + 1;
		}

		var json = {
			dims: dims,
			types: types,
			voxels: volume
		};

		return json;
	};

	function createSkyDome(goo) {
		var world = goo.world;

		var entity = world.createEntity('SkyDome');
		var skyDome = new SkyDome(16, 16, 100);
		var meshDataComponent = new MeshDataComponent(skyDome);
		entity.setComponent(meshDataComponent);

		var skyDomeShader = {
			attributes: {
				vertexPosition: MeshData.POSITION,
				colors: MeshData.COLOR
			},
			uniforms: {
				viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
				worldMatrix: Shader.WORLD_MATRIX
			},
			vshader: [
				'attribute vec3 vertexPosition;',
				'attribute vec4 colors;',

				'uniform mat4 viewProjectionMatrix;',
				'uniform mat4 worldMatrix;',

				'varying vec4 color1;',

				'void main(void) {',
				'	color1 = colors;',
				'	gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
				'}'
			].join('\n'),
			fshader: [
				'precision mediump float;',

				'varying vec4 color1;',

				'void main(void)',
				'{',
				'	gl_FragColor = color1;',
				'}'
			].join('\n')
		};

		var meshRendererComponent = new MeshRendererComponent();
		var material = Material.createMaterial(skyDomeShader, 'SkyDomeShader');
		material.setRenderQueue(0);
		material.depthState.enabled = false;
		meshRendererComponent.materials.push(material);
		meshRendererComponent.castShadows = false;
		entity.setComponent(meshRendererComponent);

		entity.addToWorld();

		return entity;
	}

	WorldEngine.prototype.addAnalyzerEntity = function(id, pos, rot, trackId) {
		var analyserRoot = this.addMeshEntity(this.goo, pos, rot);
		analyserRoot.addToWorld();
		var analyzerBars = [];
		for (var i = 0; i < 12; i++) {
			var entity = this.addMeshEntity(this.goo, [0, 0, 2.3 * (6 - i)], [0, 0, 0]);
			analyserRoot.transformComponent.attachChild(entity.transformComponent);
			analyzerBars.push(entity);
			//    entity.addToWorld();
		}

		var analyseMusicCallback = function(values) {
			for (var i = 0; i < analyzerBars.length; i++) {
				analyzerBars[i].transformComponent.transform.scale.setd(1, values[i] * 10, 1);
				analyzerBars[i].transformComponent.setUpdated();
			}
		};
		var audioEngine = this.audioEngine;
		setTimeout(function() {
			audioEngine.registerAnalyseTrackCallback(trackId, analyseMusicCallback);
		}, 1000);
		return analyserRoot;
	};

	WorldEngine.prototype.addMusicEntity = function(id, pos, trackId) {
		var meshData = ShapeCreator.createSphere(8, 8, 0);
		var entity = EntityUtils.createTypicalEntity(this.goo.world, meshData);
		var material = Material.createMaterial(Util.clone(ShaderLib.simpleColored), 'BoxMaterial');
		entity.meshRendererComponent.materials.push(material);

		entity.transformComponent.transform.scale.seta([0.05, 0.1, 0.05]);
		entity.transformComponent.transform.translation.seta(pos);
		entity.transformComponent.transform.rotation.fromAngles(0, -Math.PI * 0.5, 0);


		entity.idForAudioEngine = id;
		this.attachSoundSourceToEntity(this.goo, entity, trackId);
		entity.addToWorld();
		return entity;
	};

	WorldEngine.prototype.addMeshEntity = function(goo, pos, rot) {
		var entity = this.createSphereEntity(goo, [0.2, 0.4, 0.2]);
		entity.transformComponent.transform.scale.seta([0.05, 0.1, 0.05]);
		entity.transformComponent.transform.translation.seta(pos);
		entity.transformComponent.transform.rotation.fromAngles(rot[0], rot[1], rot[2]);
		return entity;
	};

	WorldEngine.prototype.attachSoundSourceToEntity = function(goo, entity, trackId) {
		var audioEngine = this.audioEngine;
		var posV = entity.transformComponent.transform.translation
		var pos = [posV.data[0], posV.data[1], posV.data[2]];
		this.audioEngine.addSoundSourceObject(entity.idForAudioEngine, pos, trackId);

		var updateSoundSourcePosition = function(entity) {
			var posVec = entity.transformComponent.transform.translation;
			var pos = [posVec.data[0], posVec.data[1], posVec.data[2]];
			audioEngine.moveSoundSourceObject(entity.idForAudioEngine, pos, goo.world.tpf);
		};

		entity.setComponent(new ScriptComponent({
			run: function(entity) {
				updateSoundSourcePosition(entity);
				entity.transformComponent.setUpdated();
			}
		}));
		return entity;
	};

	WorldEngine.prototype.buildParticles = function(parentGooEntity, systemParams, emitFunctions, blendState) {
		var entity = this.goo.world.createEntity("particles_" + systemParams.name);
		var settings = {
			offset: [0, 0],
			repeat: [1, 1]
		}
		var texture = this.textureCreator.loadTexture2D(systemParams.textures.PARTICLE_TX, settings);
		ParticleSystemFactory.buildParticleSystem(entity, systemParams, emitFunctions, texture, blendState);

		ParticleSystemFactory.createParticleEmitters(entity, parentGooEntity, systemParams, emitFunctions);

		if (parentGooEntity) {
			parentGooEntity.transformComponent.attachChild(entity.transformComponent);
		}
		entity.addToWorld();
	};

	return WorldEngine;
});