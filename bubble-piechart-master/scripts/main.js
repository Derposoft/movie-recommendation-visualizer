var margin = {top: 10, right: 10, bottom: 10, left: 50};
svgWidth = 1000;
svgHeight = 500;


var dataProcessor = function(d) {
  return {
    budget: parseFloat(d.budget),
    genres: d.genres,
    revenue: parseFloat(d.revenue),
    title: d.title
  };
}

var svgParaChart = d3.select('body')
  .select('.para')
  .attr('width',svgWidth)
  .attr('height',svgHeight)
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("tmdb_5000_movies.csv", function(data) {
  dataset = data.filter(function(d) {
    return (d.budget != 0 && d.revenue != 0);
  });


  parser = d3.timeParse("%m/%d/%Y");


  data.forEach(function(d){
    d['budget'] = parseFloat(d['budget'])
    d['genres']= d['genres']
    d['release_date'] = parser(d['release_date']);
    //console.log(d['release_date'])
    //d['release_date'] = d['release_date'];
    d['id'] = +d['id']
    d['runtime'] = +d['runtime']
    d['vote_average'] = +d['vote_average']
    d['vote_count'] = +d['vote_count']
    d['revenue'] = parseFloat(d['revenue'])
    d['title'] = d['title']
  
  });


  console.log(dataset)
  drawParallelChart(data,svgParaChart)
  bubblechart(data, '.bubble', 'NULL');
});
