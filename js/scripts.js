// magic numbers
var margin = {top: 20, bottom: 10, left: 10, right: 10},
	width = 600 - margin.left - margin.right,
	height = 10000 - margin.top - margin.bottom;

var svg = d3.select("#chart").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

// yscale
var yScale = d3.scaleLinear()
		.rangeRound([0, height]);

var t = d3.transition()
		.duration(1000);

d3.queue()
	.defer(d3.csv, "data/data.csv")
	.await(ready);

function ready(error, data){

	// SLIDERS
	var sliders = [
	{
		id: "dox",
		name: "Documentation",
		value: 90
	},
	{
		id: "ground",
		name: "Ground assessment",
		value: 50
	},
	{
		id: "citizen",
		name: "Citizen reports",
		value: 60
	}];

	var sliders_wrapper_width = $("#sliders-wrapper").width(),
		sliders_wrapper_height = 80,
		slider_height = 20,
		slider_wrapper_width = sliders_wrapper_width / sliders.length,
		slider_circle_radius = 20,
		slider_shrink = .8,
		slider_shrink_left = (1 - slider_shrink) / 2,
		slider_shrink_right = slider_shrink + slider_shrink_left,
		slider_width = slider_wrapper_width * slider_shrink,
		slider_padding_left = slider_wrapper_width * slider_shrink_left,
		slider_padding_right = slider_wrapper_width * slider_shrink_right;

	var slider_scale = d3.scaleLinear()
			.range([slider_padding_left, slider_padding_right])
			.domain([0, 100]);

	var sliders_wrapper = d3.select("#sliders-wrapper")
			.attr("width", sliders_wrapper_width)
			.attr("height", sliders_wrapper_height);

	var sw_g_group = [];

	var slider_text = sliders_wrapper.selectAll(".slider-text")
			.data(sliders)
		.enter().append("text")
			.attr("class", "slider-text")
			.attr("x", function(d, i){ return (slider_wrapper_width * i) + (slider_wrapper_width / 2); })
			.attr("y", 0)
			.attr("dy", ".8em")
			.text(function(d){ return d.name; });

	sliders_wrapper.selectAll(".slider-rect")
			.data(sliders)
		.enter().append("rect")
			.attr("class", "slider-rect")
			.attr("x", function(d, i){ return (slider_wrapper_width * i) + slider_padding_left; })
			.attr("y", (sliders_wrapper_height - slider_height) / 2)
			.attr("width", slider_width)
			.attr("height", slider_height)
			.attr("rx", 10)
			.attr("ry", 10);

	var slider_circle = sliders_wrapper.selectAll(".slider-circle")
			.data(sliders)
	
	slider_circle
			.attr("cx", function(d, i){ return slider_scale(d.value) + (slider_wrapper_width * i); })

	slider_circle.enter().append("circle")
			.attr("class", function(d){ return "slider-circle " + d.id; })
			.attr("cx", function(d, i){ return slider_scale(d.value) + (slider_wrapper_width * i); })
			.attr("cy", ((sliders_wrapper_height - slider_height) / 2) + (slider_circle_radius / 2))
			.attr("r", slider_circle_radius)
			.call(d3.drag().on("drag", dragged));

	var slider_circle_text = sliders_wrapper.selectAll(".slider-circle-text")
			.data(sliders)
	
	slider_circle_text
			.attr("x", function(d, i){ return slider_scale(d.value) + (slider_wrapper_width * i); });

	slider_circle_text.enter().append("text")
			.attr("class", function(d){ return "slider-circle-text " + d.id; })
			.attr("x", function(d, i){ return slider_scale(d.value) + (slider_wrapper_width * i); })
			.attr("y", ((sliders_wrapper_height - slider_height) / 2) + (slider_circle_radius / 2))
			.attr("dy", ".3em")
			.text(function(d){ return d.value; })
			.call(d3.drag().on("drag", dragged));

	// convert to numbers
	data.forEach(types);
	function types(d){
		d.dox = +d.dox;
		d.ground = +d.ground;
		d.citizen = +d.citizen;
		d.rank = +d.rank;
		return d;
	}

	// set the y domain
	yScale.domain(d3.extent(data, function(d){ return d.rank; }));

	function update_data(){
		var val_dox = +$(".slider-circle-text.dox").text(),
			val_ground = +$(".slider-circle-text.ground").text(),
			val_citizen = +$(".slider-circle-text.citizen").text();

		// calculate the new score
		data.forEach(calc_total_score);
		function calc_total_score(d){
			d.total_score = (d.dox * val_dox) + (d.ground * val_ground) + (d.citizen * val_citizen);
			d.total_pct = d.total_score / ((val_dox / 100) + (val_ground / 100) + (val_citizen / 100))
			
			return d;
		}

		$(".slider-dox .slider-value").html(val_dox);
		$(".slider-ground .slider-value").html(val_ground);
		$(".slider-citizen .slider-value").html(val_citizen);
	
		// update the rank
		data = _.sortBy(data, "total_score").reverse();
	
		data.forEach(function(d, i){ 
			d.rank = i + 1;
			return d;
		});

		return data;
	}
	
	reorder(update_data());

	function dragged(d, i){

	  var x = d3.mouse(this)[0];

	  var min_x = slider_scale(0) + slider_wrapper_width * i;
	  var max_x = slider_scale(100) + slider_wrapper_width * i;

	  x = x <= min_x ? min_x : x >= max_x ? max_x : x;

	  var val = Math.round(slider_scale.invert(x - slider_wrapper_width * i));

	  sliders_wrapper.select(".slider-circle." + d.id)
	      .attr("cx", x);

	  sliders_wrapper.select(".slider-circle-text." + d.id)
	  		.attr("x", x)
	  		.text(val);

	  reorder(update_data());

	}

	$(".reset-button").click(function(){
		
		sliders.forEach(function(d, i){

			console.log(d);

			sliders_wrapper.select(".slider-circle." + d.id)
	      .attr("cx", slider_scale(d.value) + (slider_wrapper_width * i))

	  	sliders_wrapper.select(".slider-circle-text." + d.id)
	  		.attr("x", slider_scale(d.value) + (slider_wrapper_width * i))
	  		.text(d.value);

		})

		reorder(update_data());
	});


	function reorder(data){

		//JOIN
		var city_label = svg.selectAll(".city-label")
				.data(data, function(d){ return d.city; });

		//EXIT
		city_label.exit()
			// .transition(t)
				.attr("opacity", 1e-6)
				.remove();

		//UPDATE
		city_label
			// .transition(t)
				.attr("y", function(d){ return yScale(d.rank)})
				.text(function(d){ return d.rank + ". " + d.city + " (" + d.total_pct.toFixed(1) + ")"});

		//ENTER
		city_label.enter().append("text")
				.attr("class", "city-label")
				.attr("x", 0)
				.attr("y", function(d){ return yScale(d.rank)})
				.text(function(d){ return d.rank + ". " + d.city + " (" + d.total_pct.toFixed(1) + ")"});


	}



}