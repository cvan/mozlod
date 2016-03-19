define(['goo/renderer/MeshData', 'goo/util/Enum', 'goo/math/Vector3', 'goo/math/Vector4', 'goo/math/MathUtils'],
/** @lends Sphere */
function(MeshData, Enum, Vector3, Vector4, MathUtils) {
	"use strict";

	/**
	 * @class SkyDome represents a 3D object with all points equi-distance from a center point.
	 * @property {Integer} zSamples Number of segments.
	 * @property {Integer} radialSamples Number of slices.
	 * @property {Float} radius Radius.
	 * @property {Boolean} viewInside Inward-facing normals, for skydomes.
	 * @constructor
	 * @description Creates a new sphere.
	 * @param {Integer} zSamples Number of segments.
	 * @param {Integer} radialSamples Number of slices.
	 * @param {Float} radius Radius.
	 */

	function SkyDome(zSamples, radialSamples, radius) {
		this.zSamples = zSamples !== undefined ? zSamples : 8;
		this.radialSamples = radialSamples !== undefined ? radialSamples : 8;
		this.radius = radius !== undefined ? radius : 0.5;

		this.midColor = new Vector4(0.1, 0.3, 0.6, 1.0);
		this.topColor = new Vector4(0.0, 0.04, 0.12, 1.0);
		this.tmpColor = new Vector4();

		this.viewInside = false;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.COLOR]);
		var verts = (this.zSamples - 1) * (this.radialSamples + 1) + 1;
		var tris = 3 * ((this.zSamples - 2) * this.radialSamples * 2 + this.radialSamples);

		MeshData.call(this, attributeMap, verts, tris);

		this.rebuild();
	}

	SkyDome.prototype = Object.create(MeshData.prototype);

	var gradient = [];
	gradient.push(new Vector4(1, 1, 0.0, 1.0));
	gradient.push(new Vector4(0.5, 0.1, 0.0, 1.0));
	gradient.push(new Vector4(0.05, 0.15, 0.25, 1.0));
	gradient.push(new Vector4(0.05, 0.15, 0.25, 1.0));
	gradient.push(new Vector4(0.0, 0.1, 0.2, 1.0));
	gradient.push(new Vector4(0.0, 0.07, 0.14, 1.0));
	gradient.push(new Vector4(0.0, 0.04, 0.12, 1.0));

	/**
	 * @description Builds or rebuilds the mesh data.
	 * @returns {Sphere} Self for chaining.
	 */
	SkyDome.prototype.rebuild = function() {
		var vbuf = this.getAttributeBuffer(MeshData.POSITION);
		var colors = this.getAttributeBuffer(MeshData.COLOR);
		var indices = this.getIndexBuffer();

		// generate geometry
		var fInvRS = 1.0 / this.radialSamples;
		var fYFactor = 1.0 / (this.zSamples - 1);

		// Generate points on the unit circle to be used in computing the mesh
		// points on a sphere slice.
		var afSin = [];
		var afCos = [];
		for ( var iR = 0; iR < this.radialSamples; iR++) {
			var fAngle = MathUtils.TWO_PI * fInvRS * iR;
			afCos[iR] = Math.cos(fAngle);
			afSin[iR] = Math.sin(fAngle);
		}
		afSin[this.radialSamples] = afSin[0];
		afCos[this.radialSamples] = afCos[0];

		// generate the dome itself
		var i = 0;
		var tempVa = new Vector3();
		var tempVb = new Vector3();
		var tempVc = new Vector3();
		for ( var iY = 0; iY < this.zSamples - 1; iY++) {
			var fYFraction = fYFactor * iY; // in (0,1)
			var fY = this.radius * fYFraction;

			// compute center of slice
			var kSliceCenter = tempVb.set(0, 0, 0);
			kSliceCenter.z += fY;

			// compute radius of slice
			var fSliceRadius = Math.sqrt(Math.abs(this.radius * this.radius - fY * fY));

				var gradientMax = gradient.length - 1;
				var sliceFrom = Math.floor(fYFraction * gradient.length);
				var sliceTo = Math.min(sliceFrom + 1, gradientMax);
				var from = gradient[sliceFrom];
				var to = gradient[sliceTo];

				var fract = (fYFraction - (sliceFrom/gradient.length)) * gradient.length;

			// compute slice vertices
			var iSave = i;
			for ( var iR = 0; iR < this.radialSamples; iR++) {
				var fRadialFraction = iR * fInvRS; // in [0,1)
				var kRadial = tempVc.set(afCos[iR], afSin[iR], 0);
				Vector3.mul(kRadial, fSliceRadius, tempVa);

				vbuf[i * 3 + 0] = kSliceCenter.x + tempVa.x;
				vbuf[i * 3 + 1] = kSliceCenter.y + tempVa.y;
				vbuf[i * 3 + 2] = kSliceCenter.z + tempVa.z;

				this.tmpColor.copy(from).lerp(to, fract);

				// this.tmpColor.copy(this.midColor).lerp(this.topColor, Math.sqrt(fYFraction));
				colors[i * 4 + 0] = this.tmpColor.r;
				colors[i * 4 + 1] = this.tmpColor.g;
				colors[i * 4 + 2] = this.tmpColor.b;
				colors[i * 4 + 3] = 1;

				i++;
			}

			copyInternal3(vbuf, iSave, i);
			copyInternal4(colors, iSave, i);

			i++;
		}

		// pole
		vbuf[i * 3 + 0] = 0;
		vbuf[i * 3 + 1] = 0;
		vbuf[i * 3 + 2] = this.radius;
		var col = gradient[gradient.length - 1];
		colors[i * 4 + 0] = col.r;
		colors[i * 4 + 1] = col.g;
		colors[i * 4 + 2] = col.b;
		colors[i * 4 + 3] = 1;

		// allocate connectivity
		// Generate only for middle planes
		var index = 0;
		for ( var plane = 1; plane < this.zSamples - 1; plane++) {
			var bottomPlaneStart = (plane - 1) * (this.radialSamples + 1);
			var topPlaneStart = plane * (this.radialSamples + 1);
			for ( var sample = 0; sample < this.radialSamples; sample++) {
				indices[index++] = bottomPlaneStart + sample;
				indices[index++] = topPlaneStart + sample;
				indices[index++] = bottomPlaneStart + sample + 1;
				indices[index++] = bottomPlaneStart + sample + 1;
				indices[index++] = topPlaneStart + sample;
				indices[index++] = topPlaneStart + sample + 1;
			}
		}

		// pole triangles
		var bottomPlaneStart = (this.zSamples - 2) * (this.radialSamples + 1);
		for ( var samples = 0; samples < this.radialSamples; samples++) {
			indices[index++] = bottomPlaneStart + samples;
			indices[index++] = this.vertexCount - 1;
			indices[index++] = bottomPlaneStart + samples + 1;
		}

		return this;
	};

	function copyInternal3(buf, from, to) {
		buf[to * 3 + 0] = buf[from * 3 + 0];
		buf[to * 3 + 1] = buf[from * 3 + 1];
		buf[to * 3 + 2] = buf[from * 3 + 2];
	}

	function copyInternal4(buf, from, to) {
		buf[to * 4 + 0] = buf[from * 4 + 0];
		buf[to * 4 + 1] = buf[from * 4 + 1];
		buf[to * 4 + 2] = buf[from * 4 + 2];
		buf[to * 4 + 3] = buf[from * 4 + 3];
	}

	return SkyDome;
});