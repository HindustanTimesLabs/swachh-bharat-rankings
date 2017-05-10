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