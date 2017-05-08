// magic numbers
var margin = {top: 20, bottom: 10, left: 10, right: 10},
	width = 600 - margin.left - margin.right,
	height = 10000 - margin.top - margin.bottom;

var svg_table = d3.select("#table").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

// yscale
var yScale = d3.scaleLinear()
		.rangeRound([0, height]);

var t = d3.transition()
		.duration(2000);

d3.queue()
	.defer(d3.csv, "data/data.csv")
	.await(ready);

function ready(error, data){

	// SLIDERS
	var sliders = [
	{
		id: "dox",
		name: "Documentation",
		value: 45
	},
	{
		id: "ground",
		name: "Ground assessment",
		value: 25
	},
	{
		id: "citizen",
		name: "Citizen reports",
		value: 30
	}];

	// scatter plot, set the axes
	svg_scatter.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height_scatter + ")")
	    .call(xAxis_scatter)

	// scatter plot, set the axes
	svg_scatter.append("g")
	    .attr("class", "y axis")
	    // .attr("transform", "translate(0," + height_scatter + ")")
	    .call(yAxis_scatter)

	// SLIDER
	var slider_margin = {top: 0, right: 12, bottom: 0, left: 12},
		slider_width = $("#sliders-wrapper").width() - slider_margin.left - slider_margin.right,
		slider_height = 40 - slider_margin.top - slider_margin.bottom,
		slider_handle_width = 10;

	var svg_slider = d3.select("#sliders-wrapper").append("svg")
			.attr("width", slider_width + slider_margin.left + slider_margin.right)
			.attr("height", slider_height + slider_margin.top + slider_margin.bottom)
		.append("g")
			.attr("transform", "translate(" + slider_margin.left + "," + slider_margin.top + ")");

	var slider_scale = d3.scaleLinear()
			.range([0, slider_width])
			.domain([0, 100])
	
	var colors = ["#334d5c","#45b29d","#df5a49"]

	function draw_slider_bars(sliders, transition){

		// JOIN
		var slider_bar = svg_slider.selectAll(".slider-bar")
				.data(sliders, function(d){ return d.id; });
		
		var slider_handle = svg_slider.selectAll(".slider-handle")
				.data(sliders, function(d){ return d.id; });

		var slider_bar_text = svg_slider.selectAll(".slider-bar-text")
				.data(sliders, function(d){ return d.id; })


		// UPDATE
		if (transition){

			slider_bar
				.transition(t)
					.attr("width", function(d){ return slider_scale(d.value); })
					.attr("x", function(d, i){ return slider_scale(compute_offset(d, i)); })
			
			slider_handle
				.transition(t)
					.attr("x", function(d,i){ return i != 0 ? slider_scale(compute_offset(d,i)) - (slider_handle_width / 2) : -10000000; })

			slider_bar_text
				.transition(t)
					.attr("x", function(d, i){ return compute_text_offset(d, i, sliders); })
					.text(function(d){ return d.value + "%" });

		} else {

			slider_bar
					.attr("width", function(d){ return slider_scale(d.value); })
					.attr("x", function(d, i){ return slider_scale(compute_offset(d, i)); })

			slider_handle
					.attr("x", function(d,i){ return i != 0 ? slider_scale(compute_offset(d,i)) - (slider_handle_width / 2) : -10000000; })

			slider_bar_text
					.attr("x", function(d, i){ return compute_text_offset(d, i, sliders); })
					.text(function(d){ return d.value + "%" });

		}
		
		// ENTER
		slider_bar.enter().append("rect")
				.attr("class", "slider-bar")
				.attr("width", function(d){ return slider_scale(d.value); })
				.attr("height", slider_height)
				.attr("x", function(d, i){ return slider_scale(compute_offset(d, i)); })
				.attr("fill", function(d, i){ return colors[i]});

		slider_handle.enter().append("rect")
				.attr("class", function(d){ return "slider-handle " + d.id })
				.attr("width", slider_handle_width)
				.attr("height", slider_height)
				.attr("x", function(d,i){ return i != 0 ? slider_scale(compute_offset(d,i)) - (slider_handle_width / 2) : -10000000; })
				.call(d3.drag().on("drag", dragged));

		slider_bar_text.enter().append("text")
				.attr("class", "slider-bar-text")
				.attr("x", function(d, i){ return compute_text_offset(d, i, sliders); })
				.attr("dy", ".4em")
				.attr("y", slider_height / 2)
				.text(function(d){ return d.value + "%" })

	}

	draw_slider_bars(sliders, false);

	function compute_offset(d, i){
		var arr = [];
		for (var i0 = 0; i0 < i; i0++){
			arr.push(sliders[i0].value)
		}
		return d3.sum(arr);
	}

	function compute_text_offset(d, i, data){
		// console.log(data);
		if (i == 0){
			return slider_scale(d.value / 2);
		} else if (i == 1){
			return slider_scale(data[i - 1].value) + slider_scale(d.value / 2);
		} else if (i == 2){
			return slider_scale(data[i- 1].value) + slider_scale(data[i - 2].value) + slider_scale(d.value / 2);
		}
	}

	// convert to numbers
	data.forEach(types);
	function types(d){
		d.dox = +d.dox;
		d.ground = +d.ground;
		d.citizen = +d.citizen;
		d.rank = +d.rank;
		d.start_pct = +d.start_pct;
		d.start_rank = +d.start_rank;
		return d;
	}

	// set the y domain
	yScale.domain(d3.extent(data, function(d){ return d.rank; }));

	function update_data(sliders){

		var val_dox = sliders[0].value,
			val_ground = sliders[1].value,
			val_citizen = sliders[2].value;

		// calculate the new score
		data.forEach(calc_total_score);
		function calc_total_score(d){
			d.total_score = (d.dox * val_dox) + (d.ground * val_ground) + (d.citizen * val_citizen);
			d.total_pct = d.total_score / ((val_dox / 100) + (val_ground / 100) + (val_citizen / 100))
			
			return d;
		}

		// update the rank
		data = _.sortBy(data, "total_score").reverse();
	
		data.forEach(function(d, i){ 
			d.rank = i + 1;
			return d;
		});

		return data;
	}
	
	reorder(update_data(sliders), false);

	function compute_slider_values(d, i, val){

		if (d.id == "ground"){
			sliders[0].value = val;
			sliders[1].value = 100 - val - sliders[2].value;
		} else {
			sliders[1].value = val - sliders[0].value;
			sliders[2].value = 100 - val;
		}

		draw_slider_bars(sliders, false);
	}

	// what happens you when drag shit
	function dragged(d, i){

		$(".button").removeClass("active");

	  var x = d3.mouse(this)[0];

	  var slider_name = i == 1 ? "left" : "right";

	  var min_x = slider_name == "left" ? slider_scale(0) : slider_scale(sliders[0].value);
	  var max_x = slider_name == "left" ? slider_scale(100 - sliders[2].value) : slider_scale(100);

	  x = x <= min_x ? min_x : x >= max_x ? max_x : x;

	  var val = Math.round(slider_scale.invert(x));

	  // recompute those values
	  compute_slider_values(d, i, val);

	  svg_slider.select(".slider-handle." + d.id)
	  		.attr("x", x - slider_handle_width / 2)

	  reorder(update_data(sliders), false);

	}

	var buttons = {
		"reset": [45,25,30],
		"dox": [100, 0, 0],
		"ground": [0, 100, 0],
		"citizen": [0, 0, 100],
		"equal": [33,34,33]
	}

	$(".button").click(function(){

		$(".button").removeClass("active");
		$(this).addClass("active");

		var button_name = $(this).attr("data-button")
		
		if (button_name == "dox"){
			d3.select(".slider-handle.ground").moveToFront();
			d3.selectAll(".slider-bar-text").moveToFront();
		} else if (button_name == "citizen"){
			d3.select(".slider-handle.citizen").moveToFront();
			d3.selectAll(".slider-bar-text").moveToFront();
		}

		buttons[button_name].forEach(function(d, i){
			sliders[i].value = d;			
		});

		draw_slider_bars(sliders, true);

		reorder(update_data(sliders), true);
	});

	function calc_percentages(){

		var arr =  [
			{
				id: "dox",
				val: +$(".slider-circle-text.dox").text()
			},
			{
				id: "ground",
				val: +$(".slider-circle-text.ground").text()
			},
			{
				id: "citizen",
				val: +$(".slider-circle-text.citizen").text()
			}
		];

		var sum = d3.sum(arr, function(d){ return d.val; })

		arr.forEach(function(d){
			d.pct = Math.round(d.val / sum * 100);
			return d;
		});

		return arr;
	}

	function reorder(data, transition){

		//JOIN
		var city_label = svg_table.selectAll(".city-label")
				.data(data, function(d){ return d.city; });

		var city_dot = svg_scatter.selectAll(".city-dot")
				.data(data, function(d){ return d.city; });

		//EXIT
		city_label.exit()
			// .transition(t)
				.attr("opacity", 1e-6)
				.remove();

		//UPDATE
		if (transition){
			city_label
				.transition(t)
					.attr("y", function(d){ return yScale(d.rank)})
					.text(function(d){ return d.rank + ". " + d.city + " (" + d.total_pct.toFixed(1) + ")"});

			city_dot
				.transition(t)
					.attr("cx", function(d,){ return xScale_scatter(d.total_pct); });

		} else {
			city_label
					.attr("y", function(d){ return yScale(d.rank)})
					.text(function(d){ return d.rank + ". " + d.city + " (" + d.total_pct.toFixed(1) + ")"});

			city_dot
					.attr("cx", function(d,){ return xScale_scatter(d.total_pct); });			
		}

		//ENTER
		city_label.enter().append("text")
				.attr("class", "city-label")
				.attr("x", 0)
				.attr("y", function(d){ return yScale(d.rank)})
				.text(function(d){ return d.rank + ". " + d.city + " (" + d.total_pct.toFixed(1) + ")"});

		city_dot.enter().append("circle")
				.attr("class", "city-dot")
				.attr("r", 3)
				.attr("cx", function(d){ return xScale_scatter(d.total_pct); })
				.attr("cy", function(d){ return yScale_scatter(d.start_pct); })

				// .attr("x", function(d){ return d.})


	}



}