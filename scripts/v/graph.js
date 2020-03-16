const NUM_MOVIES = 100 // testing constant for speed
var url1 = "./data/tmdb_5000_movies.csv"
var url2 = "./data/tmdb_5000_credits.csv"
var body = d3.select("body")
var w = body.style("width")
w = +w.substring(0, w.length - 2)
var h = body.style("height")
h = +h.substring(0, h.length - 2)
w = w/2// * +d3.select("#graph").style("width").substring(0, 2) / 100
h = h// * +d3.select("#graph").style("height").substring(0, 2) / 100
var keyc = true, keys = true, keyt = true, keyr = true, keyx = true, keyd = true, keyl = true, keym = true, keyh = true, key1 = true, key2 = true, key3 = true, key0 = true
var focus_node = null, highlight_node = null
var text_center = false
var outline = false
var selected = false
var neighbors = []
var min_score = 3
var max_score = 7
var highlight_color = "blue"
var highlight_trans = 0.3
var default_node_color = "#ccc"
var default_link_color = "#888"
var nominal_base_node_size = 8
var nominal_text_size = 10
var max_text_size = 24
var nominal_stroke = 1.5
var max_stroke = 4.5
var max_base_node_size = 36
var min_zoom = 0.1
var max_zoom = 7
var strength = 2
var svg = d3.select("#graph").style("cursor", "move")
var zoom = d3.zoom().scaleExtent([min_zoom, max_zoom])
var moveg = svg.append("g").attr("transform", "translate(0,0)scale(1)")
var g = moveg.append("g").attr("transform", "translate(0,0)scale(1)")
var data = {
    nodes: [],
    links: []
}
var color = d3.scaleLinear()
    .domain([min_score, (min_score + max_score) / 2, max_score])
    .range(["red", "yellow", "green"])
var size = d3.scalePow().exponent(1)
    .domain([1, 100])
    .range([8, 24])
var linkSetting = "keywords"
var groupSetting = "vote_average"
d3.select("#filter").on("click", () => {
    linkSetting = d3.select("#links")._groups[0][0].value
    groupSetting = d3.select("#groups")._groups[0][0].value
    strength = +d3.select("#strength")._groups[0][0].value
    draw(data)
})
// Read data
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
    for (var i = 0; i < NUM_MOVIES; i++) {
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
                    node.data[linkType].some(currval => currval.id == oldval.id))
            }
            data.links.push({
                source: node.id,
                target: data.nodes[j].id,
                values: matchingTags,
            })
        }
    }
    this.data = data

    // DO I NEED TO PREPROCESS?
    function download(content, fileName, contentType) {
        var a = document.createElement("a")
        var file = new Blob([content], { type: contentType })
        a.href = URL.createObjectURL(file)
        a.download = fileName
        a.click()
    }
    // download(JSON.stringify(data), 'moviegraphdata.json', 'text/json')
    draw(data)
}
function draw(graph) {
    var old_transform = g.attr("transform")
    g.remove()
    g = moveg.append("g").attr("transform", old_transform)
    var linkedByIndex = {}
    var fgraph = {
        nodes: [],
        links: []
    }
    graph.links.forEach(d => { if (d.values[linkSetting].length > strength) fgraph.links.push(d) })
    fgraph.links.forEach(function (d) {
        linkedByIndex[d.source + "," + d.target] = d
        linkedByIndex[d.source.id + "," + d.target.id] = d
    })
    function isConnected(a, b) {
        return linkedByIndex[a.id + "," + b.id] || linkedByIndex[b.id + "," + a.id] || a.index == b.index
    }
    function hasConnections(a) {
        for (var property in linkedByIndex) {
            s = property.split(",")
            if ((s[0] == a.id || s[1] == a.id) && linkedByIndex[property]) return true
        }
        return false
    }
    fgraph.nodes = graph.nodes.filter(d => hasConnections(d))
    var force = d3.forceSimulation()
        .nodes(fgraph.nodes)
        .force("link", d3.forceLink(fgraph.links.slice(0)).id(d => d.id).distance(60))
        .force("charge", d3.forceManyBody())
        .force("togetherness", d3.forceCenter(w / 2, h / 2))
        .force("gravity", d3.forceRadial(100).strength(0.01))
    var link = g.selectAll(".link")
        .data(fgraph.links).enter().append("line")
        .attr("class", "link")
        .style("stroke-width", nominal_stroke)
        .style("stroke", function (d) {
            return default_link_color
        })
    link.exit().remove()
    var node = g.selectAll(".node")
        .data(fgraph.nodes, d => d.id)
        .enter().append("g")
        .attr("class", "node")
        .call(drag(force))
    var tocolor = "fill"
    var towhite = "stroke"
    if (outline) {
        tocolor = "stroke"
        towhite = "fill"
    }
    // draw graph nodes, node text
    var circle = node.append("circle")
        .attr("r", 5)
        .style(tocolor, function (d) {
            return color(d.vote_average)
        })
        .style("stroke-width", nominal_stroke)
        .style(towhite, "white");
    var text = g.selectAll(".text")
        .data(fgraph.nodes)
        .enter().append("text")
        .attr("dy", ".35em")
        .style("font-size", nominal_text_size + "px")
        .style("pointer-events", "none")
    node.exit().remove()

    if (text_center)
        text.text(function (d) { return d.title; })
            .style("text-anchor", "middle");
    else
        text.attr("dx", function (d) { return (size(d.size) || nominal_base_node_size); })
            .text(function (d) { return '\u2002' + d.title; });

    node.on("mouseover", function (d) {
            if (!selected)
                set_highlight(d)
        }).on("mouseout", function (d) {
            if (!selected)
                exit_highlight()
        })
    function exit_highlight() {
        drawRecs([], [], linkSetting)
        highlight_node = null
        if (focus_node === null) {
            svg.style("cursor", "move")
            if (highlight_color != "white") {
                circle.style(towhite, "white").style("opacity", 1)
                text.style("font-weight", "normal")
                link.style("stroke", function (o) { return default_link_color })
            }
        }
    }
    function set_focus(d) {
        if (d === null) {
            circle.style("opacity", 1);
            text.style("opacity", 1);
            link.style("opacity", 1);
        }
        else if (highlight_trans < 1) {
            circle.style("opacity", function (o) {
                return isConnected(d, o) ? 1 : highlight_trans
            });

            text.style("opacity", function (o) {
                return isConnected(d, o) ? 1 : highlight_trans
            });

            link.style("opacity", function (o) {
                return o.source.index == d.index || o.target.index == d.index ? 1 : highlight_trans
            });
        }
    }
    function set_highlight(d) {
        svg.style("cursor", "pointer")
        if (focus_node !== null) d = focus_node
        highlight_node = d

        if (highlight_color != "white") {
            circle.style(towhite, function (o) {
                return isConnected(d, o) ? highlight_color : "white"
            })
            text.style("font-weight", function (o) {
                return isConnected(d, o) ? "bold" : "normal"
            })
            link.style("stroke", function (o) {
                return o.source.index == d.index || o.target.index == d.index ? highlight_color : (default_link_color)
            })
            neighbors = []
            circle.style("opacity", function (o) {
                if (isConnected(d, o) && d !== o) neighbors.push(o)
                return (isConnected(d, o)) ? 1 : highlight_trans
            })
        }
    }
    zoom.on("zoom", function () {
        /*var scale = d3.event.transform.k
        var stroke = nominal_stroke
        if (nominal_stroke * scale > max_stroke) stroke = max_stroke / scale
        link.style("stroke-width", stroke)
        circle.style("stroke-width", stroke)
        var base_radius = nominal_base_node_size
        if (nominal_base_node_size * scale > max_base_node_size) base_radius = max_base_node_size / scale
        if (!text_center) text.attr("dx", function (d) { return (size(d.size) * base_radius / nominal_base_node_size || base_radius); })
        var text_size = nominal_text_size
        if (nominal_text_size * scale > max_text_size) text_size = max_text_size / scale
        text.style("font-size", text_size + "px")*/
        var pos = d3.zoomTransform("#graph")
        pos.x = d3.event.transform.x
        pos.y = d3.event.transform.y

        /*if (pos.k != scale) {
            //pos.k = scale
            moveg.transition().duration(100)
                .attr("transform", "translate(" + d3.event.transform.x + "," + d3.event.transform.y + ")scale(" + scale + ")")

            //g.transition().duration(100).attr("transform", "translate(" + d3.event.transform.x + "," + d3.event.transform.y + ")scale(" + scale + ")")
        }
        else {*/
            moveg.attr("transform", "translate(" + d3.event.transform.x + "," + d3.event.transform.y + ")scale(1" + /*scale*/ + ")")
        //}

    })
    svg.call(zoom).on("dblclick.zoom", null).on("wheel.zoom", null);
    force.on("tick", function () {

        node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
        text.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })

        link.attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; })

        node.attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; })
    })
    var init_x = 0, init_y = 0
    function drag(simulation) {
        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
            init_x = d.x
            init_y = d.y
            if (!selected) {
                focus_node = d;
                set_focus(d)
                set_highlight(d)
            }
        }
        function dragged(d) {
            d.fx = d3.event.x
            d.fy = d3.event.y
        }
        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0)
            if (Math.sqrt(Math.pow(init_x - d.fx, 2) + Math.pow(init_y - d.fy, 2)) < 30) {
                if (selected) {
                    if (d === focus_node) {
                        focus_node = null
                        set_focus(null)
                        exit_highlight()
                        selected = false
                    } else {
                        exit_highlight()
                        focus_node = d
                        set_focus(d)
                        set_highlight(d)
                    }
                } else {
                    focus_node = d
                    set_focus(d)
                    set_highlight(d)
                    selected = true
                }
                var pos = d3.zoomTransform("#graph")
                var dcx = (w / 2) / 1 - (d.x + pos.x) * (1)
                var dcy = (h / 2) / 1 - (d.y + pos.y) * (1)
                g.transition().duration(750).attr("transform", "translate(" + dcx + "," + dcy + ")scale(" + 1 + ")")
                var neighborlinks = []
                neighbors.sort((a, b) => {
                    var alink = linkedByIndex[d.id + "," + a.id] == undefined ? linkedByIndex[a.id + "," + d.id] : linkedByIndex[d.id + "," + a.id]
                    var blink = linkedByIndex[d.id + "," + b.id] == undefined ? linkedByIndex[b.id + "," + d.id] : linkedByIndex[d.id + "," + b.id]
                    var countlinks = link => Object.keys(link.values).map(x => link.values[x].length).reduce((o1, o2) => o1 + o2)
                    return  countlinks(blink) - countlinks(alink)
                })
                neighbors.forEach(o => {
                    neighborlinks.push(linkedByIndex[d.id + "," + o.id] == undefined ? linkedByIndex[o.id + "," + d.id] : linkedByIndex[d.id + "," + o.id])
                })
                drawRecs(neighbors, neighborlinks, linkSetting)
            } else if (!selected) {
                focus_node = null
                set_focus(null)
                exit_highlight()
                selected = false
            }
            d.fx = null
            d.fy = null
        }
        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
    }
}