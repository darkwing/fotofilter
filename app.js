FOTOFILTER = {

	filters: {
		original: {
			name: "Original",
			filter: function(pixels, options, canvas) {
				return FOTOFILTER.getPixels(FOTOFILTER.image, canvas);
			}
		}
	},

	canvas: null, // SET ME
	image: null, // SET ME

	addFilterSet: function(name, filtersObj) {

		for(filter in filtersObj) {
			if(filtersObj.hasOwnProperty(filter)) {
				this.filters[filter] = filtersObj[filter];
			}
		}

	},

	// Retrieves pixels of a given image
	getPixels: function(img, forcedCanvas) {
		var canvas, context;
		if (img.getContext) {
			canvas = img;
			try { context = canvas.getContext("2d"); } catch(e) {}
		}
		if (!context) {
			canvas = forcedCanvas || this.canvas;
			context = canvas.getContext("2d");
			context.drawImage(img, 0, 0);
		}

		return context.getImageData(0, 0, canvas.width, canvas.height);
	},

	// Applies the filter
	applyFilter: function(filter, image, options, subjectCanvas) {
		var args = [this.getPixels(image)], 
			context = (subjectCanvas || this.canvas).getContext("2d");

		for (var i = 2; i < arguments.length; i++) {
			args.push(arguments[i]);
		}

		context.putImageData(filter.apply(null, args), 0, 0);
	}

};