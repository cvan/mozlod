define(['goo/math/Vector3', 'goo/math/Matrix3x3'], function(Vector3, Matrix3x3) {
	"use strict";

	/**
	 * Creates a new WalkControlScript
	 *
	 * @name WalkControlScript
	 */
	function WalkControlScript(domElement, bloxWorld, player) {
		this.domElement = domElement !== undefined ? domElement : document;
		if (domElement) {
			this.domElement.setAttribute('tabindex', -1);
		}

		this.movementSpeed = 1.9;
		this.rollSpeed = 0.005;
		this.movementSpeedMultiplier = 1.0;

		this.mouseStatus = 0;
		this.moveState = {
			up : 0,
			down : 0,
			left : 0,
			right : 0,
			forward : 0,
			back : 0,
			pitchUp : 0,
			pitchDown : 0,
			yawLeft : 0,
			yawRight : 0,
			rollLeft : 0,
			rollRight : 0
		};
		this.moveVector = new Vector3(0, 0, 0);
		this.rotationVector = new Vector3(0, 0, 0);

		this.loc = new Vector3();
		this._workerMatrix = new Matrix3x3();

		this.handleEvent = function(event) {
			if (typeof this[event.type] === 'function') {
				this[event.type](event);
			}
		};

		this.keyUpOrDown = function(event) {
			if (event.altKey) {
				console.log(player.position.data)
				return;
			}
			var keydown = event.type === "keydown" ? 1 : 0;

			// event.preventDefault();
			switch (event.keyCode) {
				case 16: /* shift */
					this.movementSpeedMultiplier = event.type === "keydown" ? 0.1 : 1;
					break;

				case 87: /* W */
					this.moveState.forward = keydown;
					break;
				case 83: /* S */
					this.moveState.back = keydown;
					break;

				case 65: /* A */
					this.moveState.left = keydown;
					break;
				case 68: /* D */
					this.moveState.right = keydown;
					break;

				case 82: /* R */
					this.moveState.up = keydown;
					break;
				case 70: /* F */
					if( event.type === "keyup")
						this.switchFly = true;
					// this.moveState.down = keydown;
					break;
				case 71: /* G */
					if( event.type === "keyup")
						this.fullscreen();
					// this.moveState.down = keydown;
					break;
				case 72: /* H */
					console.log(player.position.data);
					break;

				case 38: /* up */
					this.moveState.forward = keydown;
					break;
				case 40: /* down */
					this.moveState.back = keydown;
					break;
				case 37: /* left */
					this.moveState.yawRight = keydown*4;
					break;
				case 39: /* right */
					this.moveState.yawLeft = keydown*4;
					break;

				case 81: /* Q */
					this.moveState.yawRight = keydown*4;
					break;
				case 69: /* E */
					this.moveState.yawLeft = keydown*4;
					break;

				case 32: /* Spacebar */
					this.moveState.space = keydown;
					break;
			}

			this.updateMovementVector();
			this.updateRotationVector();
		};

		var that = this;
		this.mousedown = function(event) {
			this.mouseDownX = event.pageX;
			this.mouseDownY = event.pageY;
			this.mouseStatus = 1;
			var result = player.traceFromViewPoint();
			if(!result.hit)
				return;
			if( event.button == 0) {
				var x = result.pos[0];
				var y = result.pos[1];
				var z = result.pos[2];
				// bloxWorld.setBlock(x, y, z, 0);
				// socket.emit('delete', {x: x,y: y,z: z});
			} else if( event.button == 2) {
				var x = result.oldPos[0];
				var y = result.oldPos[1];
				var z = result.oldPos[2];
				// bloxWorld.setBlock(x, y, z, 1);
				// socket.emit('add', {x: x,y: y,z: z,type: Math.floor(Math.random() * 10)});
			}
		};
		this.mouseup = function(event) {
			this.mouseStatus = 0;
			this.moveState.yawLeft = 0;
			this.moveState.pitchDown = 0;
			this.updateRotationVector();
		};

		this.fullscreen = function() {
			document.body.webkitRequestFullscreen();
			document.body.lock = domElement.requestPointerLock || domElement.mozRequestPointerLock || domElement.webkitRequestPointerLock;
			document.body.lock();
			domElement.locked = true;
		};

		this.mousemove = function(event) {
			if(domElement.locked) {
				this.moveState.yawLeft = event.movementX;
				this.moveState.pitchDown = event.movementY;
				this.updateRotationVector();
				this.moveState.yawLeft = 0;
				this.moveState.pitchDown = 0;
			} else if(this.mouseStatus) {
				if (this.mouseDownX !== undefined) {
					this.moveState.yawLeft = event.pageX - this.mouseDownX;
					this.moveState.pitchDown = event.pageY - this.mouseDownY;

					this.updateRotationVector();
				}

				this.mouseDownX = event.pageX;
				this.mouseDownY = event.pageY;
			}
		};

		this.updateMovementVector = function() {
			var forward = this.moveState.forward || this.autoForward && !this.moveState.back ? 1 : 0;

			this.moveVector.x = -this.moveState.left + this.moveState.right;
			this.moveVector.y = -forward + this.moveState.back;
			this.moveVector.z = -this.moveState.down + this.moveState.up;
		};

		this.updateRotationVector = function() {
			this.rotationVector.x = -this.moveState.pitchDown + this.moveState.pitchUp;
			this.rotationVector.y = -this.moveState.rollRight + this.moveState.rollLeft;
			this.rotationVector.z = -this.moveState.yawRight + this.moveState.yawLeft;
		};

		this.getContainerDimensions = function() {
			if (this.domElement != document) {
				return {
					size : [this.domElement.offsetWidth, this.domElement.offsetHeight],
					offset : [this.domElement.offsetLeft, this.domElement.offsetTop]
				};
			} else {
				return {
					size : [window.innerWidth, window.innerHeight],
					offset : [0, 0]
				};
			}
		};

		function bind(scope, fn) {
			return function() {
				fn.apply(scope, arguments);
			};
		}

		// document.body.addEventListener('mousedown', bind(this, this.mousedown), false);
		// document.body.addEventListener('mousemove', bind(this, this.mousemove), false);
		// this.domElement.addEventListener('click', function() {
		// 	if(!that.domElement.locked)
		// 		that.fullscreen();
		// }, false);
		this.domElement.addEventListener('mousemove', bind(this, this.mousemove), false);
		this.domElement.addEventListener('mousedown', bind(this, this.mousedown), false);
		this.domElement.addEventListener('mouseup', bind(this, this.mouseup), false);

		this.domElement.addEventListener('keyup', bind(this, this.keyUpOrDown), false);
		this.domElement.addEventListener('keydown', bind(this, this.keyUpOrDown), false);

		this.updateMovementVector();
		this.updateRotationVector();
	}

	WalkControlScript.prototype.run = function(player, tpf) {
		if (this.switchFly) {
			player.switchFly();
			this.switchFly = false;
		}

		var moveMult = this.movementSpeed * this.movementSpeedMultiplier;
		// var rotMult = tpf * this.rollSpeed * this.movementSpeedMultiplier;
		var rotMult = this.rollSpeed * this.movementSpeedMultiplier;

		this.loc.copy(Vector3.ZERO);
		if (this.moveVector.x !== 0 || this.moveVector.y !== 0) {
			if (this.moveVector.y === -1) {
				this.loc.add(player.direction);
			} else if (this.moveVector.y === 1) {
				this.loc.sub(player.direction);
			}
			if (this.moveVector.x === -1) {
				this.loc.add(player.left);
			} else if (this.moveVector.x === 1) {
				this.loc.sub(player.left);
			}
			if (player.walking) {
				this.loc.y = 0;
			}
			this.loc.normalize();
			player.acceleration.copy(this.loc).mul(moveMult);
		}

		var dx = -this.rotationVector.z;
		var dy = -this.rotationVector.x;

		if (dx != 0) {
			this._workerMatrix.fromAngleNormalAxis(rotMult * dx, 0, 1, 0);
			this._workerMatrix.applyPost(player.left);
			this._workerMatrix.applyPost(player.direction);
			this._workerMatrix.applyPost(player.up);
		}

		if (dy != 0) {
			this._workerMatrix.fromAngleNormalAxis(rotMult * dy, player.left.x, player.left.y, player.left.z);
			this._workerMatrix.applyPost(player.left);
			this._workerMatrix.applyPost(player.direction);
			this._workerMatrix.applyPost(player.up);
		}

		if (this.moveState.space) {
			player.doJump();
		}

		player.normalize();

		if (this.mouseStatus > 0 || this.domElement.locked) {
			this.moveState.yawLeft = 0;
			this.moveState.pitchDown = 0;
			this.updateRotationVector();
		}
	};

	return WalkControlScript;
});