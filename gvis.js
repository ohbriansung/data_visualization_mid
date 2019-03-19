
var lineOpacity = "0.75";
var lineOpacityHover = "0.85";
var otherLinesOpacityHover = "0.1";
var lineStroke = "1px";
var lineStrokeHover = "2.5px";

const gmonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Des"
]
const top10Neighborhood = {
    "Bayview Hunters Point": "#f30e0b",
    "Mission": "#ff649e",
    "Financial District/South Beach": "#ff8d00",
    "Tenderloin": "#ffb400",
    "South of Market": "#000000",
    "Outer Richmond": "#4dd37a",
    "Sunset/Parkside": "#ba76d3",
    "Lakeshore": "#00d3ca",
    "Presidio": "#00d34a",
    "Bernal Heights": "#0501d3",
}





// load data and trigger draw
d3.csv(
    "data/SF_Fire_2016_To_2018.csv"
)
    .then(function(d) {
        // heatmap
        let map = countDay(d);
        let list = sortList(map);
        let top = getTop(list, 10);
        multiLineMap(map, top);
    })

sortList = function(map) {
    let list = [];

    Object.keys(map).forEach((key) => list.push(key));
    list.sort((a, b) => map[b]["total"] - map[a]["total"]);

    return list;
}

getTop = function(list, num) {
    let top = [];

    for (let i = 0; i < num; i++) {
        top.push(list[i]);
    }

    topNeighborhood = top;
    return top;
}

countDay = function(d) {
    let map = {};

    for (let i = 0; i < d.length; i++) {
        let row = d[i];
        let neighborhood = row["Neighborhooods - Analysis Boundaries"];

        if (!(neighborhood in map))  {
            map[neighborhood] = {
                "months": {},
                "total": 0
            };

            for (let j = 0; j < gmonths.length; j++) {
                let month = gmonths[j];
                map[neighborhood]["months"][month] = 0;
            }
        }

        let parts = row["Call Date"].split('/');
        let date = new Date(parts[2], parts[0] - 1, parts[1]);

        let currMonth = gmonths[date.getMonth()];
        map[neighborhood]["months"][currMonth]++;
        map[neighborhood]["total"]++;
    }

    return map;
}
multiLineMap = function(map, top) {
    const svg = d3.select("svg#vis_g");
    console.assert(svg.size() == 1);

    let margin = {
        top:    60,
        right:  15,
        bottom: 90,
        left:   60
    };

    // now we can calculate how much space we have to plot
    let bounds = svg.node().getBoundingClientRect();
    let plotWidth = bounds.width - margin.right - margin.left;
    let plotHeight = bounds.height - margin.top - margin.bottom;

    // color encoding range
    let min = map[top[0]]["total"];
    let max = 0;
    for (let i = 0; i < top.length; i++) {
        for (let j = 0; j < gmonths.length; j++) {
            min = Math.min(min, map[top[i]]["months"][gmonths[j]]);
            max = Math.max(max, map[top[i]]["months"][gmonths[j]]);
        }
    }
    let mid = (min + max) / 2 + 200;
    let range = [min, mid, max];


    let countScale = d3.scaleLinear()
        .domain([min, max])
        .rangeRound([plotHeight, 0])
        .nice();

    let monthScale = d3.scaleBand()
        .domain(gmonths) // all letters (not using the count here)
        .rangeRound([0, plotWidth])
        .paddingInner(0.1); // space between bars

    let plot = svg.select("g#plot");

    if (plot.size() < 1) {
        plot = svg.append("g").attr("id", "plot");

        plot.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    }

    var xAxis = d3.axisBottom(monthScale);
    var yAxis = d3.axisLeft(countScale);


    plot.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0, " + plotHeight + ")")
        .call(xAxis);

    plot.append("g")
        .attr("id", "y-axis")
        .attr("transform", "translate(" + 0 + ", " + 0 + ")")
        .call(yAxis);

    var valueline = d3.line()
        .x(function(d) { return monthScale(gmonths[d.key])+35; })
        .y(function(d) { return countScale(d.value); });


    for (let i = 0; i < top.length; i++) {
        let dataPoints = [];

        for (let j = 0; j < gmonths.length; j++) {
            let key = j;
            let value =  map[top[i]]["months"][gmonths[j]];
            dataPoints.push({key, value});
        }
        plot.append("path")
            .attr("class", "line")
            .attr("d", valueline(dataPoints))
            .data(function(d) {
                return gmonths.map(
                    function(p) {
                        return {
                            "neighborhood": top[i],
                        };
                    }
                );
            })
            .attr("stroke", top10Neighborhood[top[i]]) //TODO make function for name color her
            .attr("stroke-width", lineStroke)
            .attr("fill", "none")
            .attr("opacity", lineOpacity)
            .enter();

        myDots = plot.selectAll("dot")
            .data(dataPoints)
            .enter()
            .append("circle")
            .style("fill", top10Neighborhood[top[i]])
            .style("opacity", lineOpacity)
            .attr("r", 3.5)
            .attr("id", top[i])
            .attr("cx", function(d) {
                return monthScale(gmonths[d.key]) + 35})
            .attr("cy", function(d) { return countScale(d.value);});
    }



    myLines = svg.selectAll("path");

    myDots = svg.selectAll("circle");

    let div = d3.select("body").append("div")
        .attr("class", "gtooltip")
        .style("display", "none");

    myLines.on("mouseover.brush1", function(d) {
        let me = d3.select(this);
        myLines.filter(e => (d !== e))
            .transition()
            .style("opacity", otherLinesOpacityHover);
        me.raise()
            .style("stroke-width", lineStrokeHover)
            .style("opacity", lineOpacityHover);
        svg.append("text")
            .attr("class", "title-text")
            .style("fill", top10Neighborhood[d.neighborhood])
            .text(d.neighborhood)
            .attr("text-anchor", "middle")
            .attr("x", (plotWidth+margin.left+margin.right)/2)
            .attr("y", 0 + margin.top);
        myDots
            .style("opacity", otherLinesOpacityHover)
    });

    myLines.on("mouseout.brush1", function(d) {
        d3.select(this)
            .style("stroke-width", lineStroke)
            .style("opacity", lineOpacity);

        myLines
            .transition()
            .style("stroke", d =>
                top10Neighborhood[d])
            .style("stroke-width", lineStroke)
            .style("opacity", lineOpacity);
        svg.select(".title-text").remove();
        myDots
            .style("opacity", lineOpacity)
    });


    myDots.on("mouseover.brush2", function(d) {
        div.style("display", "inline");
        let me = d3.select(this);
        me.raise()
            .style("stroke-width", lineStrokeHover)
            .style("r", 6)
            .style("opacity", lineOpacityHover);

    });

    myDots.on("mousemove.brush2", function(d) {
        let me = d3.select(this);
        div
            .text(d.value)
            .style("left", (d3.event.pageX-10) + "px")
            .style("top", (d3.event.pageY-40) + "px")
            .style("color", top10Neighborhood[this.id]);

    });

    myDots.on("mouseout.brush2", function(d) {
        div.style("display", "none");
        myDots
            .style("stroke-width", lineStroke)
            .style("r", 3.5)
            .style("opacity", lineOpacity);
    });



}