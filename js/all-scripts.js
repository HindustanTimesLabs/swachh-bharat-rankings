var ww = $(window).width(),
	resp = {};

if (ww <= 768){
	resp.slider_margin_horizontal = 5;
	resp.slider_height = 30;
	resp.slider_handle_width = 20;
	resp.slider_text_disappear = 10;
	resp.empty_option = "-- Select a city --";

	$(".button.special.dox").text("Documentation");
	$(".button.special.ground").text("Assessment");
	$(".button.special.citizen").text("Citizens");
	$(".button.equal").text("Equal");
	$(".hover-tap").text("Tap");

} else {
	resp.slider_margin_horizontal = 12;
	resp.slider_height = 20;
	resp.slider_handle_width = 10;
	resp.slider_text_disappear = 5;
	resp.empty_option = "";

	$(".button.special.dox").text("Documentation only");
	$(".button.special.ground").text("Ground assessment only");
	$(".button.special.citizen").text("Citizen feedback only");
	$(".button.equal").text("All three are equal");
	$(".hover-tap").text("Hover over");
}

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

var slider_margin = {top: 0, right: resp.slider_margin_horizontal, bottom: 0, left: resp.slider_margin_horizontal},
	slider_width = $("#sliders-wrapper").width() - slider_margin.left - slider_margin.right,
	slider_height = resp.slider_height - slider_margin.top - slider_margin.bottom,
	slider_handle_width = resp.slider_handle_width;

var svg_slider = d3.select("#sliders-wrapper").append("svg")
		.attr("width", slider_width + slider_margin.left + slider_margin.right)
		.attr("height", slider_height + slider_margin.top + slider_margin.bottom)
	.append("g")
		.attr("transform", "translate(" + slider_margin.left + "," + slider_margin.top + ")");

var slider_scale = d3.scaleLinear()
		.range([0, slider_width])
		.domain([0, 100])

var colors = ["#334d5c","#45b29d","#df5a49"];

// magic numbers
var margin_scatter = {top: 20, bottom: 25, left: 25, right: 10},
	width_scatter = $("#chart").width() - margin_scatter.left - margin_scatter.right,
	height_scatter = $("#chart").width() - margin_scatter.top - margin_scatter.bottom;

var svg_scatter = d3.select("#chart").append("svg")
		.attr("width", width_scatter + margin_scatter.left + margin_scatter.right)
		.attr("height", height_scatter + margin_scatter.top + margin_scatter.bottom)
	.append("g")
		.attr("transform", "translate(" + margin_scatter.left + ", " + margin_scatter.top + ")");

var color_scale_scatter = chroma.scale(['#e66101','#fdb863','#b2abd2','#5e3c99']).domain([-25, 25]);

var xScale_scatter = d3.scaleLinear()
		.range([0, width_scatter])
		.domain([0, 100]);

var yScale_scatter = d3.scaleLinear()
		.range([height_scatter, 0])
		.domain([0, 100]);

var xAxis_scatter = d3.axisBottom()
		.scale(xScale_scatter)

var yAxis_scatter = d3.axisLeft()
		.scale(yScale_scatter)


var voronoi = d3.voronoi()
		.x(function(d) { return xScale_scatter(d.total_pct); })
		.y(function(d) { return yScale_scatter(d.start_pct); })
		.extent([[0, 0], [width_scatter, height_scatter]]);

var voronoiGroup = svg_scatter.append("g")
		.attr("class", "voronoi");

svg_scatter.append("line")
		.attr("class", "xy-line")
		.attr("x1", 0)
		.attr("x2", width_scatter)
		.attr("y1", height_scatter)
		.attr("y2", 0)
		.style("stroke", "#000");

// magic numbers
var table_body = d3.select("table").append("tbody");

var t = d3.transition()
		.duration(2000);

d3.queue()
	.defer(d3.csv, "data/data.csv")
	.await(ready);

$(".view-select").on("click", function(){
		var type = $(".view-select .booton").attr("mutton");
		console.log(type);

		if (type == "chart"){
			$(".view-select .booton").attr("mutton", "table");
			$(".view-select .booton").text("View table");
			$(".chart-wrapper").show();
			$(".table-wrapper table").hide();

		} else {
			$(".view-select .booton").attr("mutton", "chart");
			$(".view-select .booton").text("View chart");
			$(".chart-wrapper").hide();
			$(".table-wrapper table").show();
		}

	});

function ready(error, data){

	// create select
	$(".city-search select").append("<option value=''>" + resp.empty_option + "</option>")
	var cities = data.map(function(d){ return d.city }).sort();
	cities.forEach(function(d){
		$(".city-search select").append("<option>" + d + "</option>");
	});
	$(".city-search select").chosen({
		allow_single_deselect: true,
		width: "100%"
	});
	// var selectize = $s[0].selectize; // This stores the selectize object to a variable (with name 'selectize')

	// scatter plot, set the axes
	svg_scatter.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height_scatter + ")")
	    .call(xAxis_scatter)
	  .append("text")
	  	.attr("class", "l")
	  	.attr("x", width_scatter)
	  	.attr("y", -5)
	  	.attr("text-anchor", "end")
	   	.text("Your score");

	// scatter plot, set the axes
	svg_scatter.append("g")
	    .attr("class", "y axis")
	    .call(yAxis_scatter)
	  .append("text")
	  	.attr("class", "l")
	  	.attr("x", 5)
	  	.attr("y", 5)
	  	.attr("text-anchor", "start")
	   	.text("Government's score");

	function draw_slider_bars(sliders, transition){

		// JOIN
		var slider_bar = svg_slider.selectAll(".slider-bar")
				.data(sliders, function(d){ return d.id; });
		
		var slider_handle = svg_slider.selectAll(".slider-handle")
				.data(sliders, function(d){ return d.id; });

		var slider_bar_text = svg_slider.selectAll(".slider-bar-text")
				.data(sliders, function(d){ return d.id; });

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
					.style("opacity", function(d, i){ return d.value <= resp.slider_text_disappear ? 0 : 1; })
					.text(function(d, i){ return d.value <= resp.slider_text_disappear ? "" : d.value + "%"; });

		} else {

			slider_bar
					.attr("width", function(d){ return slider_scale(d.value); })
					.attr("x", function(d, i){ return slider_scale(compute_offset(d, i)); })

			slider_handle
					.attr("x", function(d,i){ return i != 0 ? slider_scale(compute_offset(d,i)) - (slider_handle_width / 2) : -10000000; })

			slider_bar_text
					.attr("x", function(d, i){ return compute_text_offset(d, i, sliders); })
					.style("opacity", function(d, i){ return d.value <= 5 ? 0 : 1; })
					.text(function(d, i){ return d.value <= 5 ? "" : d.value + "%"; });

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
				.text(function(d){ return d.value <= 5 ? "" : d.value + "%" })
				// .call(d3.drag().on("drag", dragged));

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
		d.old_rank = +d.rank;
		d.new_rank = +d.rank;
		d.start_pct = +d.start_pct;
		d.start_rank = +d.start_rank;
		d.slug = slugify(d.city);
		return d;
	}

	// set the y domain
	// yScale.domain(d3.extent(data, function(d){ return d.rank; }));

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
			d.new_rank = i + 1;
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

	$(".presets .button").click(function(){

		$(".presets .button").removeClass("active");

		var button_name = $(this).attr("data-button")
		
		if (button_name != "reset"){
			$(this).addClass("active");
		}

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
		var table_row = table_body.selectAll("tr")
				.data(data) // no key here because we need to make new ones every time as part of re-order

		var city_dot = svg_scatter.selectAll(".city-dot")
				.data(data, function(d){ return d.city; });

		var scatter_voronoi = voronoiGroup.selectAll("path")
				.data(voronoi(data).polygons(), function(d){ return d.data.city; })

		//EXIT

		//UPDATE

		// unnecessary to transition the voronoi or table row regardless
		scatter_voronoi
				.attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; });

		table_row
					.attr("class", function(d){ return "table-row " + slugify(d.city); })
					.html(make_row);

		if (transition){

			city_dot
				.transition(t)
					.attr("cx", function(d){ return xScale_scatter(d.total_pct); })
					.attr("fill", function(d){ return color_scale_scatter(d.total_pct - d.start_pct)});

		} else {

			city_dot
					.attr("cx", function(d){ return xScale_scatter(d.total_pct); })
					.attr("fill", function(d){ return color_scale_scatter(d.total_pct - d.start_pct)});
		}

		//ENTER
		table_row.enter().append("tr")
				.attr("class", function(d){ return "table-row " + slugify(d.city); })
				.html(make_row)

		city_dot.enter().append("circle")
				.attr("class", function(d){ return "city-dot " + slugify(d.city); })
				.attr("r", 4)
				.attr("cx", function(d){ return xScale_scatter(d.total_pct); })
				.attr("cy", function(d){ return yScale_scatter(d.start_pct); })
				.attr("fill", function(d){ return color_scale_scatter(d.total_pct - d.start_pct)})
				.on("mouseover", mouseover)
				.on("mouseout", mouseout)

		scatter_voronoi.enter().append("path")
				.attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
				.on("mouseover", function(d){ mouseover(d.data); })
				.on("mouseout", mouseout)
				
		function make_row(d){
			var change = d.old_rank - d.new_rank;
			change = change > 0 ? "<i style='color:#91cf60' class='fa fa-caret-up' aria-hidden='true'></i></sub> " + change : change == 0 ? change : "<i style='color:#fc8d59' class='fa fa-caret-down' aria-hidden='true'></i></sub> " + (change * -1)
			return "<td>" + d.city + "</td><td>" + d.new_rank + "</td><td>" + d.old_rank + "</td><td>" + change + "</td>";
		}

		if ($(".city-dot").hasClass("highlight")){
			var cls = $(".city-dot.highlight").attr("class");
			var w = _.where(data, {slug: cls.split(" ")[1].split(" ")[0]});
			mouseover(w[0]);
			$(".table-row").hide();
			$(".table-row." + slugify(w[0].city)).show();
		}

	}

	function mouseover(d, update_selectize){

		$(".scatter-line").remove();
		$(".scatter-line-text").remove();

		$(".city-dot").removeClass("highlight");
		$(".city-dot." + slugify(d.city)).addClass("highlight");

		$(".table-row").hide();
		$(".table-row." + slugify(d.city)).show();

		var x_val = xScale_scatter(d.total_pct);
		var y_val = yScale_scatter(d.start_pct);

		// x line
		svg_scatter.append("line")
				.attr("class", "scatter-line x")
				.attr("x1", x_val)
				.attr("x2", x_val)
				.attr("y1", y_val)
				.attr("y2", height_scatter)

		// y line
		svg_scatter.append("line")
				.attr("class", "scatter-line y")
				.attr("x1", 0)
				.attr("x2", x_val)
				.attr("y1", y_val)
				.attr("y2", y_val);

		svg_scatter.append("text")
				.attr("class", "scatter-line-text")
				.attr("x", x_val)
				.attr("y", y_val)
				.attr("dy", "-0.5em")
				.attr("text-anchor", x_val < width_scatter / 2 ? "start" : "end")
				.text(d.city)

		d3.select(".city-dot." + slugify(d.city)).moveToFront();

		if (!update_selectize || ww <= 768){
			$(".city-search select").val(d.city).trigger("chosen:updated");
		}
	}	

	function mouseout(){

		// what am i on top of?
		var x = event.clientX, y = event.clientY,
			elementMouseIsOver = document.elementFromPoint(x, y);

		var cl = $(elementMouseIsOver).attr("class");
		cl = cl == undefined ? "" : cl;
		if (cl != "scatter-line-text" && (cl.split(" ")[0] != "scatter-line")){
			$(".scatter-line").remove();
			$(".scatter-line-text").remove();
			$(".city-dot").removeClass("highlight");

			var node_name = $(elementMouseIsOver)[0] == undefined ? "" : $(elementMouseIsOver)[0].nodeName ;
		
			if (node_name == "TD" || node_name == "TBODY" || node_name == "text" || node_name == "svg" || node_name == "DIV" || node_name == "" || node_name == "P" || node_name == "SPAN"){
				$(".table-row").show();
				$(".city-search select").val("").trigger("chosen:updated");
			}
			
		}

	}

	// on change of selection
	$(".city-search select").change(function(){
		var value = $(this).val();
		var w = _.where(data, {city: value});
		
		if (w.length == 0){
			$(".table-row").show();
			mouseout();	
		} else {
			mouseover(w[0], true);			
		}

	});

	if (ww <= 768){
		$(".chart-wrapper").hide();
	}

}

function slugify(text)
{
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}
