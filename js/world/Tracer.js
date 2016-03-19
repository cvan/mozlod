define([
	'goo/math/Vector3',
	'goo/math/MathUtils'
], function(
	Vector3,
	MathUtils
) {
	"use strict";

	/**
	 * @name Tracer
	 */
	// REVIEW: Some documentation and nicer variable names would be nice
	function Tracer(provider, hitTester) {
		this.provider = provider;
		this.hitTester = hitTester || function(blockId) {
			return blockId !== 0;
		};

		this.mult = 1;
		this.tmax = new Vector3();
		this.tdelta = new Vector3();
		this.newPos = new Vector3();
	}

	Tracer.prototype.traceCollision = function(curpos, raydir, iterations, result) {
		result = result || {};

		this.tmax.set(0, 0, 0);
		this.tdelta.set(0, 0, 0);

		this.mult = 1;
		var back = false;

		if (!result.pos) {
			result.pos = new Vector3();
		}
		if (!result.oldPos) {
			result.oldPos = new Vector3();
		}
		result.hit = false;
		result.length = 0;

		// if (curpos.y < 0) {
		// return;
		// }
		// if (maxHeight > 0 && curpos.y >= maxHeight - 1 && raydir.y >= 0) {
		// return;
		// }

		// if (maxHeight > 0 && curpos.y >= maxHeight - 1) {
		// final float diff = maxHeight - 1 - curpos.y;
		// final float t = diff / raydir.y;
		// newPos.set(raydir).multiplyLocal(t).addLocal(curpos);
		// curpos = newPos;
		// }

		var X = Math.floor(curpos.x);
		var Y = Math.floor(curpos.y);
		var Z = Math.floor(curpos.z);

		var block1 = this.provider.getBlock(X, Y, Z);
		if (block1 !== 0 && this.hitTester(block1)) {
			raydir = new Vector3(raydir).invert();
			this.mult = -1;
			back = true;
		}

		var stepX, stepY, stepZ;
		var cbx, cby, cbz;

		if (raydir.x > 0.0) {
			stepX = 1;
			cbx = X + 1;
		} else {
			stepX = -1;
			cbx = X;
		}
		if (raydir.y > 0.0) {
			stepY = 1;
			cby = Y + 1;
		} else {
			stepY = -1;
			cby = Y;
		}
		if (raydir.z > 0.0) {
			stepZ = 1;
			cbz = Z + 1;
		} else {
			stepZ = -1;
			cbz = Z;
		}

		if (raydir.x !== 0) {
			var rxr = 1.0 / raydir.x;
			this.tmax.x = (cbx - curpos.x) * rxr;
			this.tdelta.x = stepX * rxr;
		} else {
			this.tmax.x = 1000000;
		}
		if (raydir.y !== 0) {
			var ryr = 1.0 / raydir.y;
			this.tmax.y = (cby - curpos.y) * ryr;
			this.tdelta.y = stepY * ryr;
		} else {
			this.tmax.y = (1000000);
		}
		if (raydir.z !== 0) {
			var rzr = 1.0 / raydir.z;
			this.tmax.z = (cbz - curpos.z) * rzr;
			this.tdelta.z = stepZ * rzr;
		} else {
			this.tmax.z = (1000000);
		}

		var oldX = X, oldY = Y, oldZ = Z;

		for ( var i = 0; i < iterations; i++) {
			if (this.tmax.x < this.tmax.y) {
				if (this.tmax.x < this.tmax.z) {
					X = X + stepX;
					var block = this.provider.getBlock(X, Y, Z);
					var isHit = block !== 0 && this.hitTester(block);
					if (back && !isHit || !back && isHit) {
						this.gatherMin(result, this.tmax, X, Y, Z, oldX, oldY, oldZ);
						result.hit = true;
						return result;
					}
					this.tmax.x = (this.tmax.x + this.tdelta.x);
				} else {
					Z = Z + stepZ;
					var block = this.provider.getBlock(X, Y, Z);
					var isHit = block !== 0 && this.hitTester(block);
					if (back && !isHit || !back && isHit) {
						this.gatherMin(result, this.tmax, X, Y, Z, oldX, oldY, oldZ);
						result.hit = true;
						return result;
					}
					this.tmax.z = (this.tmax.z + this.tdelta.z);
				}
			} else {
				if (this.tmax.y < this.tmax.z) {
					Y = Y + stepY;
					// if (maxHeight > 0 && Y >= maxHeight - 1) {
					// return;
					// }
					var block = this.provider.getBlock(X, Y, Z);
					var isHit = block !== 0 && this.hitTester(block);
					if (back && !isHit || !back && isHit) {
						this.gatherMin(result, this.tmax, X, Y, Z, oldX, oldY, oldZ);
						result.hit = true;
						return result;
					}
					this.tmax.y = (this.tmax.y + this.tdelta.y);
				} else {
					Z = Z + stepZ;
					var block = this.provider.getBlock(X, Y, Z);
					var isHit = block !== 0 && this.hitTester(block);
					if (back && !isHit || !back && isHit) {
						this.gatherMin(result, this.tmax, X, Y, Z, oldX, oldY, oldZ);
						result.hit = true;
						return result;
					}
					this.tmax.z = (this.tmax.z + this.tdelta.z);
				}
			}

			oldX = X;
			oldY = Y;
			oldZ = Z;
		}

		return result;
	};

	Tracer.prototype.gatherMin = function(result, tmax, X, Y, Z, oldX, oldY, oldZ) {
		result.oldPos.set(oldX, oldY, oldZ);
		result.pos.set(X, Y, Z);

		var min = tmax.x;
		if (tmax.y < min) {
			min = tmax.y;
		}
		if (tmax.z < min) {
			min = tmax.z;
		}

		var epsilon = 0.01;

		var length = min * this.mult;
		if (length > 0) {
			length = Math.max(length - epsilon, 0.0);
		} else if (length < 0) {
			length = Math.min(length - epsilon, 0.0);
		}

		result.length = length;
	};

	return Tracer;
});