

backgroundLineColor = 'rgba(171, 171, 171, 0.5)'
foregroundLineColor = 'rgba(30, 44, 241, 1)'

function drawParallelChart(data,svgParaChart){
	this.data = data
	pDimensions = ['budget', 'release_date', 'runtime','vote_average','vote_count'];


	
	yScales = {}
	for (i in pDimensions){
		if (i == 3){
			yScale = d3.scaleLinear()
			.domain([0,10])
			.range([svgHeight-30,10])
			.nice()
			yScales[pDimensions[i]] = yScale
		}else if(i == 1){
			yScale = d3.scaleTime()
			.domain(d3.extent(data,function(d){
				return d[pDimensions[i]];
			}))
			// .domain()
			.range([svgHeight-30,10])
			.nice()
			yScales[pDimensions[i]] = yScale
		}else{
			yScale = d3.scaleLinear()
			.domain(d3.extent(data,function(d){
				return d[pDimensions[i]];
			}))
			.range([svgHeight-30,10])
			.nice()
			yScales[pDimensions[i]] = yScale
		}
	}
	

	xScale = d3.scalePoint()
		.domain(pDimensions)
		.range([0,svgWidth-200])
		.padding(0.5)

	

	background = svgParaChart.append('g')
				.attr('class','lines')
				.append('g')
				.attr('class','background')
				.selectAll('path')
				.data(data)
				.enter()
				.append('path')
				.attr("d",  path)
			    .style("fill", "none")
			    .style('stroke',backgroundLineColor)
			    .style("opacity", 0.7)
			    .attr('stroke-width',1)
			   	.style('shape-rendering','optimizeSpeed')
	foreground = svgParaChart.select('.lines')
				.append('g')
				.attr('class','foreground')
				.selectAll('path')
				.data(data)
				.enter()
				.append('path')
				.attr("d",  path)
			    .style("fill", "none")
			    .style('stroke',foregroundLineColor)
			    .style("opacity", 0.7)
			    .attr('stroke-width',1)
			   	.style('shape-rendering','optimizeSpeed')
	


	
	brushWidth = 50
	var brushBudget = d3.brushY()
		.extent([[55, 0], [brushWidth+55, svgHeight-30]])
		.on("brush", brushmovedBudget);
	var brushReleaseDate = d3.brushY()
		.extent([[215, 0], [brushWidth+215, svgHeight-30]])
		.on("brush", brushmovedReleaseDate);
	var brushRuntime = d3.brushY()
		.extent([[375, 0], [brushWidth+375, svgHeight-30]])
		.on("brush", brushmovedRuntime);
	var brushVoteAvg = d3.brushY()
		.extent([[535, 0], [brushWidth+535, svgHeight-30]])
		.on("brush", brushmovedVoteAvg);
	var brushVoteCount = d3.brushY()
		.extent([[695, 0], [brushWidth+695, svgHeight-30]])
		.on("brush", brushmovedVoteCount);	
		
	var gBrushBudget = svgParaChart.append("g")
	    .attr("class", "brush")
	    .call(brushBudget);
	var gBrushReleaseDate = svgParaChart.append("g")
	    .attr("class", "brush")
	    .call(brushReleaseDate);
	var gBrushWeight = svgParaChart.append("g")
	    .attr("class", "brush")
	    .call(brushRuntime);
	var gBrushVoteAvg = svgParaChart.append("g")
	    .attr("class", "brush")
	    .call(brushVoteAvg);
	var gBrushVoteCount = svgParaChart.append("g")
	    .attr("class", "brush")
	    .call(brushVoteCount);
    // For each dimension of the dataset I add a 'g' element:
    svgParaChart.selectAll('axis')
    	.data(pDimensions)
    	.enter()
	    .append("g")
	    // I translate this element to its right position on the x axis
	    .attr("transform", function(d) { return "translate(" + xScale(d) + ")"; })
	    // And I build the axis with the call function
	    .each(function(d) { d3.select(this).call(d3.axisLeft().scale(yScales[d])); })
	    // Add axis title
	    .append("text")
	      .style("text-anchor", "middle")
	      .attr('font-weight','bold')
	      .attr('font-size','1.5em')
	      .attr("y", 490)
	      .text(function(d,i){
	      	if(i == 0){
	      		return 'Budget ($)'
	      	}else if(i == 1){
	      		return 'Release Date (Year)'
	      	}else if(i == 2){
	      		return 'Runtime (mins)'
	      	}else if(i == 3){
	      		return 'Vote Average'
	      	}else{
	      		return 'Vote Count'
	      	}
	      })
	      .style("fill", "black")
}

var ranges = {}
function brushmovedBudget() {
	var s = d3.event.selection;
	scaledRange = [yScales['budget'].invert((s[0]))
		,yScales['budget'].invert((s[1]))]
	
	ranges['budget'] = scaledRange
	filter(ranges)
}

function brushmovedReleaseDate() {
	var s = d3.event.selection;
	scaledRange = [yScales['release_date'].invert((s[0]))
		,yScales['release_date'].invert((s[1]))]
	ranges['release_date'] = scaledRange
	filter(ranges)
	
}
function brushmovedRuntime() {
	var s = d3.event.selection;
	scaledRange = [yScales['runtime'].invert((s[0]))
		,yScales['runtime'].invert((s[1]))]
	ranges['runtime'] = scaledRange
	filter(ranges)
}


function brushmovedVoteAvg() {
	var s = d3.event.selection;
	scaledRange = [yScales['vote_average'].invert((s[0]))
		,yScales['vote_average'].invert((s[1]))]
	
	ranges['vote_average'] = scaledRange
	filter(ranges)
}


function brushmovedVoteCount() {
	var s = d3.event.selection;
	scaledRange = [yScales['vote_count'].invert((s[0]))
		,yScales['vote_count'].invert((s[1]))]
	ranges['vote_count'] = scaledRange
	filter(ranges)
}





//THIS IS WHERE THE OUTPUT OF THE FITLER IS
function filter(ranges){
	filteredData = []
	rangeKeys = d3.keys(ranges)
	foreground.style('display',function(d) { 
		check = true;
		for (key of rangeKeys){
			check = check && (ranges[key][0] > d[key] && ranges[key][1] < d[key])
		}
		if (check){
			filteredData.push(d)
			return null
		}
		return 'none'
				
	});

	//FILTERED DATA IS THE OUTPUT
	console.log(filteredData)
	bubblechart(filteredData, '.bubble', 'NULL');

}

function path(d) {
	return d3.line()(pDimensions.map(function(p) { 
		return [xScale(p), yScales[p](d[p])]; 
	}));
}