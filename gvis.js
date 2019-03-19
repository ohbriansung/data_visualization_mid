
var lineOpacity = "0.75";
var lineOpacityHover = "0.95";
var otherLinesOpacityHover = "0.2";
var lineOpacityFull = "1.0";

var lineStroke = "1.25px";
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
    "Outer Richmond": "#003f5c",
    "Mission": "#ffa600",
    "Financial District/South Beach": "#665191",
    "Tenderloin": "#AF2116",
    "South of Market": "#FF9D9A",
    "Bayview Hunters Point": "#E15759",
    "Sunset/Parkside": "#D37295",
    "Lakeshore": "#ff7c43",
    "Presidio": "#2f4b7c",
    "Bernal Heights": "#a05195",
}




translate = function(a, b) {
    return "translate(" + a + ", " + b + ")";
}
// load data and trigger draw
d3.csv(
    "data/SF_Fire_2016_To_2018.csv"
)
    .then(function(d) {
        let map = countDay(d);
        let list = sortList(map);
        let top = getTop(list, 10);
        multiLineMap(map, top);
        drawStackBar(map,top);
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
        top:    95,
        right:  160,
        bottom: 110,
        left:   80
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



    myLines = svg.selectAll("path.line");
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

    y = 30;
    for (var i in top10Neighborhood) {
        svg.append("rect")
            .attr("x", 810)
            .attr("y", y)
            .attr("width", 10)
            .attr("height", 10)
            .attr("class", "legend")
            .attr("id", i) //TODO used in dots
            .style("fill", top10Neighborhood[i]);
        y += 15;
    }
    var y = 37;
    for (var i in top10Neighborhood) {
        svg.append("text")
            .attr("x", 825)
            .attr("y", y)
            .attr("text-anchor", "right")
            .attr("class", "legend-text")
            .attr("id", i) //TODO used in dots
            .style("font-size", "8px")
            .text(i);
        y += 15;
    }
    myLegend = svg.selectAll(".legend");

    myLegend.on("mouseover.brush4", function(d) {
        myLines.filter(e => (this.id !== e.neighborhood))
            .transition()
            .style("opacity", otherLinesOpacityHover);
        myLines.filter(e => (this.id === e.neighborhood))
            .raise()
            .style("stroke-width", lineStrokeHover)
            .style("opacity", lineOpacityHover);
        svg.append("text")
            .attr("class", "title-text")
            .style("fill", top10Neighborhood[this.id])
            .text(this.id)
            .attr("text-anchor", "middle")
            .attr("x", (plotWidth+margin.left+margin.right)/2)
            .attr("y", 0 + margin.top);
        myDots
            .style("opacity", otherLinesOpacityHover)
    });


    myLegend.on("mouseout.brush4", function(d) {
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

    myLegendText = svg.selectAll(".legend-text");

    myLegendText.on("mouseover.brush5", function(d) {
        myLines.filter(e => (this.id !== e.neighborhood))
            .transition()
            .style("opacity", otherLinesOpacityHover);
        myLines.filter(e => (this.id === e.neighborhood))
            .raise()
            .style("stroke-width", lineStrokeHover)
            .style("opacity", lineOpacityHover);
        svg.append("text")
            .attr("class", "title-text")
            .style("fill", top10Neighborhood[this.id])
            .text(this.id)
            .attr("text-anchor", "middle")
            .attr("x", (plotWidth+margin.left+margin.right)/2)
            .attr("y", 0 + margin.top);
        myDots
            .style("opacity", otherLinesOpacityHover)
    });

    myLegendText.on("mouseout.brush5", function(d) {
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





    svg.append("text")
        .attr("x", 810)
        .attr("y", 20)
        .attr("text-anchor", "left")
        .style("font-size", "13px")
        .text("Neighborhood");

    // title
    svg.append("text")
        .attr("text-anchor", "start")
        .attr("class", "title")
        .attr("transform", "translate(15, 35)")
        .text("Frequency of Fire Incidents in Top 10 Neighborhoods per month");

    // create grid line
    plot.append("line")
        .attr("class", "grid-line")
        .attr("x1", -margin.left + 15)
        .attr("y1", -50)
        .attr("x2", margin.left + plotWidth - 90)
        .attr("y2", -50);

    plot.append("line")
        .attr("class", "grid-line")
        .attr("x1", -margin.left + 12)
        .attr("y1", plotHeight +40)
        .attr("x2", margin.left + plotWidth - 60)
        .attr("y2", plotHeight + 40);

    // Y axis name
    plot.append("text")
        .attr("class", "legendText")
        .attr("transform", "translate(-56, -29)")
        .style("text-anchor", "start")
        .text("Number of");

    // Y axis name
    plot.append("text")
        .attr("class", "legendText")
        .attr("transform", "translate(-45, -14)")
        .style("text-anchor", "start")
        .text("Records");

    // caption
    plot.append("text")
        .attr("text-anchor", "start")
        .attr("class", "captions")
        .attr("dy", "0em")
        .attr("transform", translate(-margin.left + 10, plotHeight + 55))
        .text("Author: Gudbrand Schistad");


    plot.append("text")
        .attr("text-anchor", "start")
        .attr("class", "captions")
        .attr("dy", "1.2em")
        .attr("transform", translate(-margin.left + 10, plotHeight + 55))
        .text("The data is filtered on 10 out of 42 neighborhoods with the highest total record count. Every line represents a neighborhood and has a unique ");

    plot.append("text")
        .attr("text-anchor", "start")
        .attr("class", "captions")
        .attr("dy", "2.4em")
        .attr("transform", translate(-margin.left + 10, plotHeight + 55))
        .text("color to easily differentiation between the lines. Each line marker represents the neighborhood record count for that month. ");

    plot.append("text")
        .attr("text-anchor", "start")
        .attr("class", "captions")
        .attr("dy", "3.6em")
        .attr("transform", translate(-margin.left + 10, plotHeight + 55))
        .text("");

}

var drawStackBar = function(map, top) {

    var margin = {
        top:    100,
        right:  160,
        bottom: 120,
        left:   60
    };


    var svg = d3.select("body").select("svg#vis_g2");
    const bounds = svg.node().getBoundingClientRect();
    const plotWidth = bounds.width - margin.right - margin.left;
    const plotHeight = bounds.height - margin.top - margin.bottom;


    var yScale = d3.scaleLinear()
        .domain([0, 1800])
        .range([plotHeight, 0])
        .nice();

    var xScale = d3.scaleBand()
        .domain(gmonths)
        .range([0, plotWidth])
        .paddingInner(0.1);

    var plot = svg.select("g#plot");

    if (plot.size() < 1) {
        plot = svg.append("g")
            .attr("id", "plot")
            .attr("height", "200")

            .attr("transform", "translate("+ margin.left + ","+ margin.top + ")");
    }

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    var xPos = plotHeight;

    var stack = d3.stack()
        .keys(top)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    var colorScale = d3.scaleOrdinal()
        .domain(top)
        .range(d3.schemePaired);

    var grid = d3.axisLeft(yScale)
        .tickFormat("")
        .tickSize(-plotHeight);





    let stackMod = d3.map();
    for (let i = 0; i < gmonths.length; i++) {
        let curr = {};

        for (let j = 0; j < top.length; j++) {
            curr[top[j]] =  map[top[j]]["months"][gmonths[i]];
        }

        stackMod.set(i, curr,);
    }

    console.log(xScale(gmonths[1]))


var series = stack(stackMod.values());
    plot.selectAll("g.bar")
        .data(series)
        .enter()
        .append("g")
        .attr("class", "bar")
        .each(function(d) {
            d3.select(this)
                .selectAll("rect")
                .data(d)
                .enter()
                .append("rect")
                .attr("id", d.key)
                .attr("width", xScale.bandwidth()-20)
                .attr("height", d => yScale(d[0]) - yScale(d[1]))
                .attr("x", (d, i) =>  xScale(gmonths[stackMod.keys()[i]]) + 10 )
                .attr("y", d => yScale(d[1]))
                .style("fill", top10Neighborhood[d.key])
                .attr("opacity", lineOpacity)

        });


    plot.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate("+ 0 +", " + xPos + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("y", 10)
        .attr("x", 10)
        .style("text-anchor", "end");

    plot.append("g")
        .attr("id", "y-axis")
        .attr("transform", "translate(" + 0 + ", 0)")
        .call(yAxis);

    myBars = svg.selectAll(".bar rect");
    var tooltip = d3.select("body").append("div").attr("class", "toolTipBar");


    myBars.on("mouseover.brush3", function(d) {
        let me = d3.select(this);
        me.transition().style("opacity", lineOpacityFull)
        myBars.filter(e => (d !== e)).transition().style("opacity", otherLinesOpacityHover)

        tooltip.style("left", d3.event.pageX - 50 + "px")
            .style("top", d3.event.pageY - 70 + "px")
            .style("display", "inline-block")
            .html((this.id) + "<br>" + (d[1]-d[0]));

    });

    myBars.on("mousemove.brush3", function(d) {
        let me = d3.select(this);
        tooltip.style("left", d3.event.pageX - 90 + "px")
            .style("top", d3.event.pageY - 70 + "px")
            .style("display", "inline-block")
            .style("color", "white")
            .text(this.id + ": " +(d[1]-d[0]))

    });

    myBars.on("mouseout.brush3", function(d) {
        myBars.transition().style("opacity",lineOpacity);
        tooltip.style("display", "none")
    });


    y = 30;
    for (var i in top10Neighborhood) {
        svg.append("rect")
            .attr("x", 810)
            .attr("y", y)
            .attr("width", 10)
            .attr("height", 10)
            .attr("class", "legend")
            .attr("id", i)
            .style("fill", top10Neighborhood[i]);
        y += 15;
    }

    var y = 37;
    for (var i in top10Neighborhood) {
        svg.append("text")
            .attr("x", 825)
            .attr("y", y)
            .attr("text-anchor", "right")
            .style("font-size", "8px")
            .text(i);
        y += 15;
    }

    // title
    svg.append("text")
        .attr("text-anchor", "start")
        .attr("class", "title")
        .attr("transform", "translate(15, 35)")
        .text("Frequency of Fire Incidents in Top 10 Neighborhoods per month");

    // create grid line
    plot.append("line")
        .attr("class", "grid-line")
        .attr("x1", -margin.left + 15)
        .attr("y1", -50)
        .attr("x2", margin.left + plotWidth - 60)
        .attr("y2", -50);

    plot.append("line")
        .attr("class", "grid-line")
        .attr("x1", -margin.left + 15)
        .attr("y1", plotHeight + 40)
        .attr("x2", margin.left + plotWidth - 60)
        .attr("y2", plotHeight + 40);


    // Y axis name
    plot.append("text")
        .attr("class", "legendText")
        .attr("transform", "translate(-56, -29)")
        .style("text-anchor", "start")
        .text("Number of");

    // Y axis name
    plot.append("text")
        .attr("class", "legendText")
        .attr("transform", "translate(-45, -14)")
        .style("text-anchor", "start")
        .text("Records");
    // caption
    plot.append("text")
        .attr("text-anchor", "start")
        .attr("class", "captions")
        .attr("dy", "0em")
        .attr("transform", translate(-margin.left + 10, plotHeight + 55))
        .text("Author: Gudbrand Schistad");


    plot.append("text")
        .attr("text-anchor", "start")
        .attr("class", "captions")
        .attr("dy", "1.2em")
        .attr("transform", translate(-margin.left + 10, plotHeight + 55))
        .text("Count of Number of Records for each Month. Color shows details about Neighborhooods. The view is filtered Neighborhooods,");

    plot.append("text")
        .attr("text-anchor", "start")
        .attr("class", "captions")
        .attr("dy", "2.4em")
        .attr("transform", translate(-margin.left + 10, plotHeight + 55))
        .text("which keeps the top 10 of 42 members based on the Neighborhooods total count of records. Each bar represents the toatal number of");

    plot.append("text")
        .attr("text-anchor", "start")
        .attr("class", "captions")
        .attr("dy", "3.6em")
        .attr("transform", translate(-margin.left + 10, plotHeight + 55))
        .text("records for that month.");
}
