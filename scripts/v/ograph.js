// load data with queue
var url1 = "./data/tmdb_5000_movies.csv"
var url2 = "./data/tmdb_5000_credits.csv"

var data = {
  nodes: [],
  links: []
}

var linkSetting = "keywords"
var groupSetting = "vote_average"
d3.select("#filter").on("click", () => {
  linkSetting = d3.select("#links")._groups[0][0].value
  groupSetting = d3.select("#groups")._groups[0][0].value
  strength = d3.select("#strength")._groups[0][0].value
  chart(data)
})

d3.csv(url1, movies => {
  d3.csv(url2, creds => {
    var credits = []
    credits = creds
    process(movies, credits)
  })
})
var process = (movies, credits) => {
    var data = {
      nodes: [],
      links: []
    }
  for (var i = 0; i < 100; i++) {
    var credit = credits[i]
    var movie = movies[i]
    // Create and add node
    var node = {
      id: credit['movie_id'],
      title: credit['title'],
      vote_average: movie['vote_average'],
      data: {
        cast: JSON.parse(credit['cast']),
        crew: JSON.parse(credit['crew']),
        genres: JSON.parse(movie['genres']),
        keywords: JSON.parse(movie['keywords'])
      }
    }
    data.nodes.push(node)
    // Add all links from this node to all previous nodes
    for (var j = 0; j < data.nodes.length - 1; j++) {
      var currNode = data.nodes[j]
      var matchingTags = {}
      var linkTypes = Object.keys(node.data)
      for (var k = 0; k < linkTypes.length; k++) {
        var linkType = linkTypes[k]
        matchingTags[linkType] = currNode.data[linkType].filter(oldval =>
          node.data[linkType].some(currval => currval.id == oldval.id)).length
      }
      data.links.push({
        source: node.id,
        target: data.nodes[j].id,
        values: matchingTags,
      })
    }
  }
  this.data = data
  draw(data)
}

var body = d3.select("body")
var width = body.style("width")
width = +width.substring(0, width.length - 2) / 2
var height = body.style("height")
height = +height.substring(0, height.length - 2) / 2
var drag = simulation => {
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  }

  function dragged(d) {
    d.fx = d3.event.x
    d.fy = d3.event.y
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
  }

  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended)
}
// draw
function draw(data) {
  "use strict"
  chart(data)
  console.log("success")
}

var scale = d3.scaleLinear()
  .domain([0, 10])
  .range(["#fff7ec", "#d7301f"])
var color = d => {
  return scale(d.vote_average)
}
var svg = d3.select("#graph")
var link = svg.append("g")
var node = svg.append("g")
var nlink, nnode
var simulation
var strength = 2
const r = 5
var chart = (data) => {
  const links = data.links.filter(d => d.values[linkSetting] > strength).map(d => Object.create(d))
  const nodes = data.nodes.map(d => Object.create(d))

  simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(50))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide(10))

  //var svg = d3.select("#graph").attr("viewBox", [0, 0, width, height])
  //var link = svg.append("g")
  link.remove()
  link = svg.append("g")
  nlink = link
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links, d => d.source + ":::" + d.target)
    .enter().append("line")
    .attr("stroke-width", d => Math.sqrt(d.values[linkSetting]))
  nlink.exit().remove()

  node.remove()
  node = svg.append("g")
  nnode = node
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes).enter().append("circle")
    .attr("r", r)
    .attr("fill", d => color(d))
    .call(drag(simulation))
  nnode.append("title")
    .text(d => d.title)
  nnode.exit().remove()

  simulation.on("tick", () => {
    nlink
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y)

    nnode
      .attr("cx", function (d) { return d.x = Math.max(r, Math.min(width - r, d.x)); })
      .attr("cy", function (d) { return d.y = Math.max(r, Math.min(height - r, d.y)); })
  });

  return svg.node();
}
