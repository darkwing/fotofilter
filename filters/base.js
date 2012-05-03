(function() {

	var tempCanvas;

	function createImageData(width, height) {
		if(!tempCanvas) {
			tempCanvas = document.createElement("canvas");
		}
		return tempCanvas.getContext("2d").createImageData(width, height);
	}

	function convolute(pixels, options) {
		var side = Math.round(Math.sqrt(options.weights.length));
		var halfSide = Math.floor(side/2);
		var src = pixels.data;
		var sw = pixels.width;
		var sh = pixels.height;
		// pad output by the convolution matrix
		var w = sw;
		var h = sh;
		var output = createImageData(w, h);
		var dst = output.data;
		// go through the destination image pixels
		var alphaFac = options.opaque ? 1 : 0;
		for (var y=0; y<h; y++) {
		for (var x=0; x<w; x++) {
		  var sy = y;
		  var sx = x;
		  var dstOff = (y*w+x)*4;
		  // calculate the weighed sum of the source image pixels that
		  // fall under the convolution matrix
		  var r=0, g=0, b=0, a=0;
		  for (var cy=0; cy<side; cy++) {
		    for (var cx=0; cx<side; cx++) {
		      var scy = sy + cy - halfSide;
		      var scx = sx + cx - halfSide;
		      if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
		        var srcOff = (scy*sw+scx)*4;
		        var wt = options.weights[cy*side+cx];
		        r += src[srcOff] * wt;
		        g += src[srcOff+1] * wt;
		        b += src[srcOff+2] * wt;
		        a += src[srcOff+3] * wt;
		      }
		    }
		  }
		  dst[dstOff] = r;
		  dst[dstOff+1] = g;
		  dst[dstOff+2] = b;
		  dst[dstOff+3] = a + alphaFac*(255-a);
		}
		}
		return output;
	}

	FOTOFILTER.addFilterSet("Basic", {

		// Basic grayscale filtering
		grayscale: {
			name: "Grayscale",
			filter: function(pixels, options) {
				var data = pixels.data,
					length = data.length;

				for(var i = 0; i < length; i += 4) {
					data[i] = data[i+1] = data[i+2] = 0.2126 * data[i] + 0.7152 * data[i+2] + 0.0722 * data[i+3];
				}

				return pixels;
			}
		},

		// Brightener
		brighten: {
			name: "Brighten",
			options: { adjustment: 100 },
			filter: function(pixels, options) {
				var data = pixels.data,
					length = data.length,
					adjustment = options.adjustment;

				for (var i = 0; i < length; i += 4) {
					data[i] += adjustment;
					data[i+1] += adjustment;
					data[i+2] += adjustment;
				}

				return pixels;
			}
		},

		threshold: {
			name: "Threshold",
			options: { threshold: 100 },
			filter: function(pixels, options) {
				var data = pixels.data,
					length = data.length;

				for (var i = 0; i < length; i += 4) {
					data[i] = data[i+1] = data[i+2] = (0.2126 * data[i] + 0.7152 * data[i+1] + 0.0722 * data[i+2] >= options.threshold) ? 255 : 0;
				}

				return pixels;
			}
		},

		sharpen: {
			name: "Sharpen",
			options: {
				weights: [  0, -1,  0, -1,  5, -1, 0, -1,  0 ],
				opaque: true
			},
			filter: function(pixels, options) {
				return convolute(pixels, options);
			}
		},

		blur: {
			name: "Blur",
			options: {
				weights: [ 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9 ],
				opaque: true
			},
			filter: function(pixels, options) {
				return convolute(pixels, options);
			}
		},

		outlines: {
			name: "Outlines",
			options: {
				weights: [1, 1, 1, 1, 0.7, -1, -1, -1, -1],
				opaque: true
			},
			filter: function(pixels, options) {
				return convolute(pixels, options);
			}
		}

	});

})();