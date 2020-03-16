var recboard = d3.select("#recs").append("g")
var recbars = recboard.append("g")
//const recdist = 100
const Y_SPACING = 40
const Y_OFFSET_TITLE = 25
const Y_OFFSET = 50
const X_OFFSET = 10
const BAR_HEIGHT = 15
var width = 300
var height = 300

// Prep the tooltip bits, initial display is hidden
var tooltip = d3.select("#vtooltip")
    .attr("fill", "white")
    .style("display", "none")

/*tooltip.append("rect")
    .attr("width", 60 + "px")
    .attr("height", 20 + "px")
    .style("opacity", 0.5)*/

tooltip.append("text")
    .attr("style", "left:30;")
    .attr("dy", ".2em")
    .style("text-anchor", "left")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")

var gtitle = d3.select("#recs").append("text")
    .attr("x", 10 + "px")
    .attr("y", Y_OFFSET_TITLE)
    .attr("font-size", 14)
    .attr("font-weight", 800)
    .text("Select a Movie to view Recommendations")
drawRecs = function(reclist, reclinks, title) {
    if (title !== "")
        gtitle.text("Recommendations for " + title)
    recboard.selectAll("text").remove()
    recboard.selectAll("text").data(reclist, d => d.title).enter().append("text")
        .attr("x", X_OFFSET + "px")
        .attr("y", (d, i) => i * Y_SPACING + Y_OFFSET)
        .attr("font-weight", 800)
        .text(d => d.title)
    
    // Draw bars for each movie

    // set x scale
    var x = d3.scaleLinear()
        .rangeRound([width / 1.5, 0]);

    // set y scale
    var y = d3.scaleBand().domain(reclist.map(d => d.title))
    y.rangeRound([0, y.domain().length * (Y_SPACING)])
        .paddingInner(0.05)
        .align(0.1);

    // set the colors
    var z = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
    for (var i = 0; i < reclinks.length; i++) {
        reclinks[i].i = i
    }
    var keys = reclinks.map(d => Object.keys(d.values))[0]
    if (keys !== undefined) {
        //data.sort(function (a, b) { return b.total - a.total; });
        var ydomain = y.domain()
        for (var i = 0; i < ydomain.length; i++) {
            for (var j = 0; j < keys.length; j++) {
                reclinks[i][keys[j]] = reclinks[i].values[keys[j]].length
            }
        }
        x.domain([0, d3.max(reclinks, d => Object.keys(d.values).map(x => d.values[x].length).reduce((a, b) => a + b))]).nice()
        z.domain(keys)
        //recboard.selectAll("g.rect").remove()
        recboard.selectAll("g").remove()
        recboard
            .selectAll("g")
            .data(d3.stack().keys(keys)(reclinks))
            .enter().append("g")
            .attr("fill", d => z(d.key))
            .selectAll("rect")
            .data(function (d) { return d })
            .enter().append("rect")
            .attr("x", d => x(d[1]) + X_OFFSET * 3)
            .attr("y", d => Y_SPACING * d.data.i + Y_OFFSET + 5)
            .attr("width", d => x(d[0]) - x(d[1]))
            .attr("height", BAR_HEIGHT)
            .on("mouseover", function () { tooltip.style("display", null) })
            .on("mouseout", function () { tooltip.style("display", "none") })
            .on("mousemove", function (d) {
                var xPosition = d3.event.pageX
                var yPosition = d3.event.pageY
                tooltip.style("left", xPosition + "px").style("top", yPosition + "px")
                var currKey
                if (d[0] == 0) currKey = keys[0]
                if (d[0] == d.data[keys[0]]) currKey = keys[1]
                if (d[0] == d.data[keys[0]] + d.data[keys[1]]) currKey = keys[2]
                if (d[0] == d.data[keys[0]] + d.data[keys[1]] + d.data[keys[2]]) currKey = keys[3]
                var commalist = arr => {
                    var res = arr[0].name
                    for (var i = 1; i < arr.length; i++) {
                        res += ", " + arr[i].name
                    }
                    return res
                }
                tooltip.select("text").text(d[1] - d[0] + " matching " + currKey + ": " + commalist(reclinks[d.data.i].values[currKey]))
            })

        // TODO: PUT LEGEND IN RIGHT SPOT
        const LEGEND_OFFSET = 1
        const LEGEND_Y_OFFSET = 40
        var legend = recboard.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice().reverse())
            .enter().append("g")
            .attr("transform", function (d, i) { return "translate(0," + (i * 20 + LEGEND_Y_OFFSET) + ")"; });
        legend.append("rect")
            .attr("x", width - LEGEND_OFFSET)
            .attr("y", 0)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", z);
        legend.append("text")
            .attr("x", width - LEGEND_OFFSET - 5)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function (d) { return d; });

    }
}