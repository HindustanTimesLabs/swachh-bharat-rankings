// magic numbers
var margin_scatter = {top: 20, bottom: 25, left: 25, right: 10},
	width_scatter = 500 - margin_scatter.left - margin_scatter.right,
	height_scatter = 500 - margin_scatter.top - margin_scatter.bottom;

var svg_scatter = d3.select("#chart").append("svg")
		.attr("width", width_scatter + margin_scatter.left + margin_scatter.right)
		.attr("height", height_scatter + margin_scatter.top + margin_scatter.bottom)
	.append("g")
		.attr("transform", "translate(" + margin_scatter.left + ", " + margin_scatter.top + ")");

var color_scale_scatter = chroma.scale(['#e66101','#fdb863','#444','#b2abd2','#5e3c99']).domain([-10,10]);

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

svg_scatter.append("line")
		.attr("class", "xy-line")
		.attr("x1", 0)
		.attr("x2", width_scatter)
		.attr("y1", height_scatter)
		.attr("y2", 0)
		.style("stroke", "#000");

// d3.queue()
// 		.defer(d3.csv, "data/data.csv")
// 		.await(ready);

// function ready(error, data){
// 	if (error) throw error;

// 	console.log(data);

// }