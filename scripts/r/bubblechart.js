function bubblechart(data, svg, selectedgenre) {
  clearSVG(svg);
  // begin sloppy genre encoding
  var dramasum = 0, drama2sum = 0;
  var comedysum = 0, comedy2sum = 0;
  var thrillersum = 0, thriller2sum = 0;
  var actionsum = 0, action2sum = 0;
  var romancesum = 0, romance2sum = 0;
  var adventuresum = 0, adventure2sum = 0;
  var crimesum = 0, crime2sum = 0;
  var scifisum = 0, scifi2sum = 0;
  var horrorsum = 0, horror2sum = 0;
  var famsum = 0, fam2sum = 0;
  var fantasysum = 0, fantasy2sum = 0;
  var anisum = 0, ani2sum = 0;
  var docsum = 0, doc2sum = 0;
  var musicsum = 0, music2sum = 0;
  var warsum = 0, war2sum = 0;

  var genrelist = [];

  data.forEach(function (d) {
    if (selectedgenre == 'NULL') {
      var genres
      try {
        genres = JSON.parse(d.genres)
      } catch {
        genres = d.genres
      }
      //delete d["genres"];
      d.genres = genres;
    }
    var title = d.title;
    var budget = d.budget;
    var revenue = d.revenue;
    d.genres.forEach(function (d) {
      switch (d.name) {
        case "Drama":
          dramasum += budget;
          drama2sum += revenue;
          break;
        case "Comedy":
          comedysum += budget;
          comedy2sum += revenue;
          break;
        case "Thriller":
          thrillersum += budget;
          thriller2sum += revenue;
          break;
        case "Action":
          actionsum += budget;
          action2sum += revenue;
          break;
        case "Romance":
          romancesum += budget;
          romance2sum += revenue;
          break;
        case "Adventure":
          adventuresum += budget;
          adventure2sum += revenue;
          break;
        case "Crime":
          crimesum += budget;
          crime2sum += revenue;
          break;
        case "Science Fiction":
          scifisum += budget;
          scifi2sum += revenue;
          break;
        case "Horror":
          horrorsum += budget;
          horror2sum += revenue;
          break;
        case "Family":
          famsum += budget;
          fam2sum += revenue;
          break;
        case "Fantasy":
          fantasysum += budget;
          fantasy2sum += revenue;
          break;
        case "Animation":
          anisum += budget;
          ani2sum += revenue;
          break;
        case "Documentary":
          docsum += budget;
          doc2sum += revenue;
          break;
        case "Music":
          musicsum += budget;
          music2sum += revenue;
          break;
        case "War":
          warsum += budget;
          war2sum += revenue;
          break;
      }
    });
  });

  var filteredGenre = [];
  data.forEach(function (d) {
    var title = d.title;
    var budget = d.budget;
    var revenue = d.revenue;
    d.genres.forEach(function (d) {
      if (d.name == selectedgenre) {
        filteredGenre.push([title, [budget, revenue]]);
      }
    })
  });

  var genrelist = [
    ['Drama', [dramasum, drama2sum]],
    ['Comedy', [comedysum, comedy2sum]],
    ['Thriller', [thrillersum, thriller2sum]],
    ['Action', [actionsum, action2sum]],
    ['Romance', [romancesum, romance2sum]],
    ['Adventure', [adventuresum, adventure2sum]],
    ['Crime', [crimesum, crime2sum]],
    ['Science Fiction', [scifisum, scifi2sum]],
    ['Horror', [horrorsum, horror2sum]],
    ['Family', [famsum, fam2sum]],
    ['Fantasy', [fantasysum, fantasy2sum]],
    ['Animation', [anisum, ani2sum]],
    //['Documentary', [docsum, doc2sum]],
    //['Music', [musicsum, music2sum]],
    ['War', [warsum, war2sum]]
  ];

  var boundingBox = d3.select(svg).node().getBoundingClientRect();
  var h = boundingBox.height;
  var w = boundingBox.width;

  var colorRevenue = "#bdc9e1";
  var colorBudget = "#74a9cf";

  if (selectedgenre != 'NULL') {
    producebubble(filteredGenre, svg, w / 2, h, colorBudget, colorRevenue, selectedgenre, data);
    drawRadial(data, selectedgenre, svg, h, w);
  } else {
    producebubble(genrelist, svg, w, h, colorBudget, colorRevenue, selectedgenre, data);
  }
  legendBuilder(svg, w, h, colorBudget, colorRevenue);
}

/******************************************************************************/

function producebubble(data, svg, w, h, colorBudget, colorRevenue, selectedgenre, reprodata) {
  let tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip');
  if (w > h) {
    var d = h;
  } else {
    var d = w;
  }

  var color = d3.scaleOrdinal()
    .range([colorBudget, colorRevenue]),
    diameter = d;
  // "#7b6888", "#a05d56"  "#8a89a6",
  var bubble = d3.pack()
    .size([w, diameter])
    .padding(1.5),
    root = d3.hierarchy({ children: data })
      .sum(function (d) { return d.children ? 0 : d3.sum(d[1]); }),
    arc = d3.arc().innerRadius(0),
    pie = d3.pie();

  var nodeData = bubble(root).children;

  var svg = d3.select(svg);

  var nodes = svg.selectAll("g.node")
    .data(nodeData);

  var nodeEnter = nodes.enter().append("g")
    .attr("class", "node")
    .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

  var arcGs = nodeEnter.selectAll("g.arc")
    .data(function (d) {
      return pie(d.data[1]).map(function (m) { m.r = d.r; return m; });
    });
  var arcEnter = arcGs.enter().append("g").attr("class", "arc");

  arcEnter.append("path")
    .attr('class', 'bubblearc')
    .attr("d", function (d) {
      arc.outerRadius(d.r);
      // arc.innerRadius((d.r)/(3/2));
      return arc(d);
    })
    //    .attr('stroke', 'black')
    //    .attr('stroke-width', '0.5px')
    .style("fill", function (d, i) { return color(i); })
    .on('mouseover', showTooltip)
    .on('mouseleave', hideTooltip)
    .on('click', function (d) {
      hideTooltip();
      if (selectedgenre == 'NULL') {
        if ([d.data] == data[0][1][0] || [d.data] == data[0][1][1]) {
          clearSVG(svg);
          bubblechart(reprodata, '.bubble', 'Drama');
        } else if ([d.data] == data[1][1][0] || [d.data] == data[1][1][1]) {
          clearSVG(svg);
          bubblechart(reprodata, '.bubble', 'Comedy');
        } else if ([d.data] == data[2][1][0] || [d.data] == data[2][1][1]) {
          clearSVG(svg);
          bubblechart(reprodata, '.bubble', 'Thriller');
        } else if ([d.data] == data[3][1][0] || [d.data] == data[3][1][1]) {
          clearSVG(svg);
          bubblechart(reprodata, '.bubble', 'Action');
        } else if ([d.data] == data[4][1][0] || [d.data] == data[4][1][1]) {
          clearSVG(svg);
          bubblechart(reprodata, '.bubble', 'Romance');
        } else if ([d.data] == data[5][1][0] || [d.data] == data[5][1][1]) {
          clearSVG(svg);
          bubblechart(reprodata, '.bubble', 'Adventure');
        } else if ([d.data] == data[6][1][0] || [d.data] == data[6][1][1]) {
          clearSVG(svg);
          bubblechart(reprodata, '.bubble', 'Crime');
        } else if ([d.data] == data[7][1][0] || [d.data] == data[7][1][1]) {
          clearSVG(svg);
          bubblechart(reprodata, '.bubble', 'Science Fiction');
        } else if ([d.data] == data[8][1][0] || [d.data] == data[8][1][1]) {
          clearSVG(svg);
          bubblechart(reprodata, '.bubble', 'Horror');
        } else if ([d.data] == data[9][1][0] || [d.data] == data[9][1][1]) {
          clearSVG(svg);
          bubblechart(reprodata, '.bubble', 'Family');
        } else if ([d.data] == data[10][1][0] || [d.data] == data[10][1][1]) {
          clearSVG(svg);
          bubblechart(reprodata, '.bubble', 'Fantasy');
        } else if ([d.data] == data[11][1][0] || [d.data] == data[11][1][1]) {
          clearSVG(svg);
          bubblechart(reprodata, '.bubble', 'Animation');
        } else if ([d.data] == data[12][1][0] || [d.data] == data[12][1][1]) {
          clearSVG(svg);
          bubblechart(reprodata, '.bubble', 'Documentary');
        } else if ([d.data] == data[13][1][0] || [d.data] == data[13][1][1]) {
          clearSVG(svg);
          bubblechart(reprodata, '.bubble', 'Music');
        } else if ([d.data] == data[14][1][0] || [d.data] == data[14][1][1]) {
          clearSVG(svg);
          bubblechart(reprodata, '.bubble', 'War');
        }
      }
    });

  if (selectedgenre == 'NULL') {
    var labels = nodeEnter.selectAll("text.label")
      .data(function (d) { return [d.data[0]]; });

    labels.enter().append("text")
      .attr('class', 'label')
      .attr('dy', '0.35em')
      .attr('font-size', '10px')
      .style("text-anchor", "middle")
      .text(String);

    svg.append("text")
      .attr('class', 'label')
      .attr('x', 10)
      .attr('y', 20)
      .attr('font-size', '20px')
      .text('Budget and Revenue Across Genres');
  } else {
    svg.append("text")
      .attr('class', 'label')
      .attr('x', 10)
      .attr('y', 20)
      .attr('font-size', '16px')
      .text('Budget and Revenue for ' + selectedgenre + ' Movies');
  }

  function showTooltip(d) {
    tooltip.style('left', (d3.event.pageX + 10) + 'px')
      .style('top', (d3.event.pageY - 25) + 'px')
      .style('display', 'inline-block')
      .html('$' + [d.data]);
  }

  function hideTooltip() {
    tooltip.style('display', 'none');
  }
}

function legendBuilder(svg, w, h, colorBudget, colorRevenue) {
  // background
  d3.select(svg).append('rect')
    .attr('class', 'legend')
    .attr('x', 5)
    .attr('y', h - 65)
    .attr('width', 95)
    .attr('height', 60)
    .attr('opacity', 0.55)
    .style('fill', 'lightgrey');
  // budget
  d3.select(svg).append('rect')
    .attr('class', 'legend')
    .attr('x', 10)
    .attr('y', h - 60)
    .attr('width', 20)
    .attr('height', 20)
    .style('fill', colorBudget);
  d3.select(svg).append('text')
    .attr('class', 'legend')
    .attr('x', 35)
    .attr('y', h - 45)
    .text('Budget');
  // revenue
  d3.select(svg).append('rect')
    .attr('class', 'legend')
    .attr('x', 10)
    .attr('y', h - 30)
    .attr('width', 20)
    .attr('height', 20)
    .style('fill', colorRevenue);
  d3.select(svg).append('text')
    .attr('class', 'legend')
    .attr('x', 35)
    .attr('y', h - 15)
    .text('Revenue');
}

function clearSVG(svg) {
  d3.select('.bubble').selectAll('text.label').remove();
  d3.select('.bubble').selectAll('g').remove();
}

/****************************************************************************/

// below is implementation for radial chart

function drawRadial(data, selectedgenre, svg, height, width) {
  var profit1 = 0, profit2 = 0, profit3 = 0, profit4 = 0, profit5 = 0;
  var title1, title2, title3, title4, title5;
  data.forEach(function (d) {
    var title = d.title;
    var budget = d.budget;
    var revenue = d.revenue;
    d.genres.forEach(function (d) {
      if (d.name == selectedgenre) {
        if (((revenue - budget) / 1000) > profit1) {
          profit1 = (revenue - budget) / 1000;
          title1 = title;
        } else if (((revenue - budget) / 1000) > profit2) {
          profit2 = (revenue - budget) / 1000;
          title2 = title;
        } else if (((revenue - budget) / 1000) > profit3) {
          profit3 = (revenue - budget) / 1000;
          title3 = title;
        } else if (((revenue - budget) / 1000) > profit4) {
          profit4 = (revenue - budget) / 1000;
          title4 = title;
        } else if (((revenue - budget) / 1000) > profit5) {
          profit5 = (revenue - budget) / 1000;
          title5 = title;
        }
      }
    })
  });

  var dataset = 'value,name\n' + profit1 + ',' + title1 + '\n'
    + profit2 + ',' + title2 + '\n'
    + profit3 + ',' + title3 + '\n'
    + profit4 + ',' + title4 + '\n'
    + profit5 + ',' + title5;

  if (width > height) {
    var xTranslation = (3 * (width / 4));
    var yTranslation = height / 2;
    var d = height;
  } else {
    var xTranslation = width / 2;
    var yTranslation = 3 * (height / 4);
    var d = width;
  }

  const chartRadius = d / 3;

  const color = d3.scaleOrdinal().range(["#b7dfeb", "#bdc9e1", "#74a9cf", "#0570b0", "#03456b"]);

  let svgRadial = d3.select(svg).append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + xTranslation + ',' + yTranslation + ')');

  d3.select(svg).append('text')
    .attr('class', 'label')
    .attr('x', (width / 2 + chartRadius / 2))
    .attr('y', 20)
    .text('Most Profitable Movies in Genre (in thousands)')

  let tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip');

  const PI = Math.PI,
    arcMinRadius = 40,
    arcPadding = 5,
    labelPadding = -5,
    numTicks = 10;

  var data = d3.csvParse(dataset);
  createRadial(data);

  function createRadial(data) {
    let scale = d3.scaleLinear()
      .domain([0, profit1 * 1.1])
      .range([0, 2 * PI]);

    let ticks = scale.ticks(numTicks).slice(0, -1);
    let keys = data.map((d, i) => d.name);
    //number of arcs
    const numArcs = keys.length;
    const arcWidth = (chartRadius - arcMinRadius - numArcs * arcPadding) / numArcs;

    let arc = d3.arc()
      .innerRadius((d, i) => getInnerRadius(i))
      .outerRadius((d, i) => getOuterRadius(i))
      .startAngle(0)
      .endAngle((d, i) => scale(d))

    let radialAxis = svgRadial.append('g')
      .attr('class', 'r axis')
      .selectAll('g')
      .data(data)
      .enter().append('g');

    radialAxis.append('circle')
      .attr('r', (d, i) => getOuterRadius(i) + arcPadding);

    radialAxis.append('text')
      .attr('font-size', '9px')
      .attr('font-weight', 'bold')
      .attr('x', labelPadding)
      .attr('y', (d, i) => -getOuterRadius(i) + arcPadding)
      .text(d => d.name);

    let axialAxis = svgRadial.append('g')
      .attr('class', 'a axis')
      .selectAll('g')
      .data(ticks)
      .enter().append('g')
      .attr('transform', d => 'rotate(' + (rad2deg(scale(d)) - 90) + ')');

    axialAxis.append('line')
      .attr('x2', chartRadius);

    axialAxis.append('text')
      .attr('x', chartRadius + 10)
      .style('text-anchor', d => (scale(d) >= PI && scale(d) < 2 * PI ? 'end' : null))
      .attr('transform', d => 'rotate(' + (90 - rad2deg(scale(d))) + ',' + (chartRadius + 10) + ',0)')
      .text(d => d);

    //data arcs
    let arcs = svgRadial.append('g')
      .attr('class', 'data')
      .selectAll('path')
      .data(data)
      .enter().append('path')
      .attr('class', 'arc')
      .style('fill', (d, i) => color(i))

    arcs.transition()
      .delay((d, i) => i * 200)
      .duration(1000)
      .attrTween('d', arcTween);

    arcs.on('mousemove', showTooltip)
    arcs.on('mouseout', hideTooltip)


    function arcTween(d, i) {
      let interpolate = d3.interpolate(0, d.value);
      return t => arc(interpolate(t), i);
    }

    function showTooltip(d) {
      tooltip.style('left', (d3.event.pageX + 10) + 'px')
        .style('top', (d3.event.pageY - 25) + 'px')
        .style('display', 'inline-block')
        .html('$' + (d.value / 1000) + 'M');
    }

    function hideTooltip() {
      tooltip.style('display', 'none');
    }

    function rad2deg(angle) {
      return angle * 180 / PI;
    }

    function getInnerRadius(index) {
      return arcMinRadius + (numArcs - (index + 1)) * (arcWidth + arcPadding);
    }

    function getOuterRadius(index) {
      return getInnerRadius(index) + arcWidth;
    }
  }
}
