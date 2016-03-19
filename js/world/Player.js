define([
    'application/EventManager',
	'goo/math/Vector3',
	'js/world/WalkControlScript',
	'goo/math/MathUtils',
	'goo/renderer/bounds/BoundingBox',
	'goo/shapes/ShapeCreator',
	'goo/entities/EntityUtils',
	'goo/renderer/Material',
	'goo/renderer/Texture',
	'js/world/Tracer',
	'goo/renderer/shaders/ShaderLib'
], function(
    event,
	Vector3,
	WalkControlScript,
	MathUtils,
	BoundingBox,
	ShapeCreator,
	EntityUtils,
	Material,
	Texture,
	Tracer,
	ShaderLib
) {
	"use strict";

	/**
	 * @name Player
	 */
	function Player(goo, bloxWorld, audioEngine) {
        this.audioEngine = audioEngine;
		this.goo = goo;
		this.bloxWorld = bloxWorld;
		var meshData = ShapeCreator.createBox(0.6, 0.6, 1.5);
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
		entity.name = "Box";
		var material = Material.createMaterial(ShaderLib.textured);
		var colorInfo = new Uint8Array([255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255]);
		var texture = new Texture(colorInfo, null, 2, 2);
		texture.minFilter = 'NearestNeighborNoMipMaps';
		texture.magFilter = 'NearestNeighbor';
		texture.generateMipmaps = false;
		material.setTexture('DIFFUSE_MAP', texture);
		entity.meshRendererComponent.materials.push(material);
		// entity.addToWorld(); //dont need it atm
		this.playerEntity = entity;

		this.position = new Vector3(118, 10, 143);
		this.direction = new Vector3().copy(Vector3.UNIT_Z).invert();
		this.up = new Vector3().copy(Vector3.UNIT_Y);
		this.left = new Vector3().copy(Vector3.UNIT_X).invert();
		this.velocity = new Vector3();
		this.acceleration = new Vector3();
		this.dead = false;

		this.walking = true;

		this.jump = false;
		this.time = 0;
		this.stepTime = 1.0 / 100.0;
		this.damping = new Vector3(0.85, 1.0, 0.85);
		this.flightDamping = new Vector3(0.9, 0.9, 0.9);
		this.gravity = -0.5;
		this.jumpForce = 17;

		this.walkControl = new WalkControlScript(goo.renderer.domElement, bloxWorld, this);
		this.tmpVec = new Vector3();

		this.tracer = new Tracer(bloxWorld);

		var width = 0.4;
		var height = 4.0; //1.8
		this.testVecs = [//
		new Vector3(-width, 0.0, -width),//
		new Vector3(width, 0.0, -width),//
		new Vector3(width, 0.0, width),//
		new Vector3(-width, 0.0, width),//
		new Vector3(-width, height, -width),//
		new Vector3(width, height, -width),//
		new Vector3(width, height, width),//
		new Vector3(-width, height, width)//
		];

		this.oldPosition = new Vector3();
		this.moveDir = new Vector3();
		this.testVec = new Vector3();
		this.normalVec = new Vector3();
		this.penetrationVec = new Vector3();

		this.isOnGround = false;
        this.timeSinceStep = 0;
	}

    Player.prototype.emitFootstepSound = function() {
        this.timeSinceStep = 0;
        var pos = this.position;
        var selection = Math.ceil(Math.random()*3);
        event.fireEvent(event.list().ONESHOT_AMBIENT_SOUND, {soundData:event.sound()["STEP_GRAVEL_"+selection], pos:[pos.data[0], pos.data[1]-2, pos.data[2]], vel:[0, 0, 0]})
    };

    Player.prototype.checkWalkSound = function(time) {
        this.timeSinceStep += time;
        if (this.timeSinceStep > 0.15) this.emitFootstepSound()
    };

    Player.prototype.update = function(bloxWorld, tpf) {
		this.time += tpf;

		this.oldPosition.copy(this.position);

		var ticks = 0;
		while (this.time > this.stepTime) {
			this.walkControl.run(this, tpf);

			this.keepAboveGround(bloxWorld);

			this.velocity.add(this.acceleration);
			if (this.walking) {
				this.velocity.y += this.gravity;
				if (this.jump && this.isOnGround) {
					this.velocity.y = this.jumpForce;

				}
			}

			this.tmpVec.copy(this.velocity).mul(this.stepTime);
			this.position.add(this.tmpVec);

			if (this.walking) {
				this.velocity.mul(this.damping);
			} else {
				this.velocity.mul(this.flightDamping);
			}

			this.collide();

			this.time -= this.stepTime;
			ticks++;
			this.jump = false;
		}
		if (ticks > 0) {
			this.acceleration.copy(Vector3.ZERO);
		}
		this.jump = false;

	/*	TODO: Figure out how to enable this for when performance is available
        if (this.walking && this.isOnGround && this.velocity.lengthSquared() > 0.5) {
            this.checkWalkSound(this.time);
        } else {
            this.timeSinceStep = 2;
        }
    */
        this.audioEngine.setListeningPoint(this.position, this.direction, tpf);

    };

	Player.prototype.collide = function() {
		var result = {};
		var bestResult = {
			hit : false,
			length : moveLength,
			oldPos : new Vector3(),
			pos : new Vector3(),
		};

		var testOldPosition = this.oldPosition;
		var testPosition = this.position;
		// TODO
		// var testOldPosition = new Vector3().copy(this.position);
		// this.tmpVec.copy(this.direction).mul(20);
		// var testPosition = new Vector3().copy(this.position).add(this.tmpVec);

		this.isOnGround = false;
		for ( var iterations = 0; iterations < 3; iterations++) {
			this.moveDir.copy(testPosition).sub(testOldPosition);
			var moveLength = this.moveDir.length();
			if (moveLength < MathUtils.EPSILON) {
				break;
			}
			var testDistance = Math.ceil(moveLength) + 1;
			this.moveDir.normalize();

			bestResult.hit = false;
			bestResult.length = moveLength;

			for ( var i = 0; i < this.testVecs.length; i++) {
				this.testVec.set(testOldPosition).add(this.testVecs[i]);

				this.tracer.traceCollision(this.testVec, this.moveDir, testDistance, result);
				if (result.hit && result.length < bestResult.length) {
					bestResult.length = result.length;
					bestResult.oldPos.copy(result.oldPos);
					bestResult.pos.copy(result.pos);
					bestResult.hit = true;
				}
			}

			if (bestResult.hit) {
				this.normalVec.copy(bestResult.oldPos).sub(bestResult.pos);
				if (this.normalVec.x !== 0) {
					this.velocity.x = 0;
				}
				if (this.normalVec.z !== 0) {
					this.velocity.z = 0;
				}
				if (this.normalVec.y !== 0) {
					this.velocity.y = 0;
					if (this.normalVec.y > 0) {
						this.isOnGround = true;
					}
				}

				this.tmpVec.copy(this.moveDir).mul(bestResult.length);
				testOldPosition.add(this.tmpVec);

				var penetration = moveLength - bestResult.length;
				this.penetrationVec.copy(this.moveDir).mul(penetration);
				var dot = this.penetrationVec.dot(this.normalVec);
				this.normalVec.mul(dot);
				this.penetrationVec.sub(this.normalVec);
				testPosition.copy(this.penetrationVec).add(testOldPosition);

				// this.debugs[iterations].transformComponent.transform.translation.copy(testOldPosition);
				// this.debugs[iterations].transformComponent.transform.translation.z += 0.75;
				// this.debugs[iterations].transformComponent.setUpdated();
			} else {
				// this.debugs[iterations].transformComponent.transform.translation.set(0, 0, -10000);
				// this.debugs[iterations].transformComponent.setUpdated();
				break;
			}
		}

		// this.playerEntity.transformComponent.transform.translation.copy(testPosition);
		// this.playerEntity.transformComponent.transform.translation.z += 0.75;
		// this.playerEntity.transformComponent.setUpdated();
	};

	Player.prototype.traceFromViewPoint = function () {
		var viewPoint = new Vector3();
		viewPoint.setv(this.position);
		viewPoint.y += 1.5;
		return this.tracer.traceCollision(viewPoint, this.direction, 100);
	}

	Player.prototype.doJump = function() {
		if (!this.jump && this.isOnGround) {
			this.jump = true;

		/*	More skip this for performance padding
            var pos = this.position.data;
            var selection = Math.ceil(Math.random()*4);
            event.fireEvent(event.list().ONESHOT_AMBIENT_SOUND, {soundData:event.sound()["STEP_ROAD_"+selection], pos:[pos[0], pos[1]-2, pos[2]], vel:[0, 0, 0]});
            setTimeout(function() {
                var selection = Math.ceil(Math.random()*3);
                event.fireEvent(event.list().ONESHOT_AMBIENT_SOUND, {soundData:event.sound()["STEP_GRAVEL_"+selection], pos:[pos[0], pos[1]-2, pos[2]], vel:[0, 0, 0]})
            }, 90+Math.random()*100);
        */
        }
	};

	Player.prototype.keepAboveGround = function(bloxWorld) {
		var X = Math.floor(this.position.x);
		var Y = Math.floor(this.position.y);
		var Z = Math.floor(this.position.z);

		var block = bloxWorld.getBlock(X, Y, Z);
		// document.getElementById('bloxinfo').textContent = X + ',' + Y + ',' + Z + ' - Block: ' + block;
		if (block !== 0) {
			for ( var y = Y; y < Y + 30; y++) {
				block = bloxWorld.getBlock(X, y, Z);
				if (block === 0) {
					this.position.y = y + 0.1;
					// console.log('moved pos up to:' + (z));
					break;
				}
			}
		}
	};

	Player.prototype.switchFly = function() {
		this.walking = !this.walking;
	};

	Player.prototype.normalize = function() {
		this.left.normalize();
		this.up.normalize();
		this.direction.normalize();
	};

	return Player;
});