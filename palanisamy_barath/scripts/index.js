var margin = {top: 10, right: 10, bottom: 10, left: 500};
svgWidth = 1000;
svgHeight = 500;

var svgParaChart = d3.select('body')
	.select('.para')
	.attr('width',svgWidth)
	.attr('height',svgHeight)
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");



var globalData;
d3.csv("tmdb_5000_movies preprocessed.csv", function(data) {
	parser = d3.timeParse("%m/%d/%Y");
	data.forEach(function(d){
		d['budget'] = +d['budget']
		d['release_date'] = parser(d['release_date']);
		//d['release_date'] = d['release_date'];
		d['id'] = +d['id']
		d['runtime'] = +d['runtime']
		d['vote_average'] = +d['vote_average']
		d['vote_count'] = +d['vote_count']
	
	});
	globalData = data

	drawParallelChart(data,svgParaChart)

});







