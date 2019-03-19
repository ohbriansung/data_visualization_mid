const year = [
    "2016",
    "2017",
    "2018"
]

const Q = [
    "Q1",
    "Q2",
    "Q3",
    "Q4"
]

const callType=[
    "Structure Fire",
    "Vehicle Fire",
    "Water Rescue",
    "Outside Fire",
    "Explosion",
    "Marine Fire"
]

function barMap(d) {
    let map = {};
    for (let i = 0; i < d.length; i++) {
        let row = d[i]
        var callType = row["Call Type"];
        if (callType !=="Water Rescue") {
            if (!(callType in map)) {
                map[callType] = {
                    "diff": 0,
                    "total": 0
                }
            }
            let diff = parseInt(row["Time Difference"]);
            map[callType]["total"]++
            map[callType]["diff"] += diff
        }
    }
    let bmap = d3.map()
    let test = {"Explosion":5.09, "Marine Fire":8.27, "Outside Fire":5.03, "Structure Fire":15.69, "Vehicle Fire":4.96};
    for(let key in test){
        if(!(bmap.has(key))){
            let val = test[key]
            // let val = map[key]
            // let pdif = val["diff"]/val["total"]
            bmap.set(key,val )
        }
    }
    return bmap
}

function groupByCall(d){
    let map = {};
    for (let i =0; i<d.length; i++){
        let row = d[i]
        var callType = row["Call Type"];
        if(!(callType in map)){
            map[callType]={
                "year": {},
                "total":0
            };

            for(var y in year){
                var ye = year[y]
                map[callType]["year"][ye] = {
                    "quarter":{},
                    "total":0
                }
                var q
                for(q in Q){
                    map[callType]["year"][ye]["quarter"][Q[q]] ={
                        "time diff": 0,
                        "total":0
                    }
                    map[callType]["year"][ye]["quarter"]
                }
            }
        }
        let diff = parseInt(row["Time Difference"]);

        let quart = row["quarter"];
        let yearDate = quart["year"];
        let quarterDate = quart["quarter"];

        map[callType]["year"][yearDate]["quarter"][quarterDate]["time diff"] +=diff;
        map[callType]["year"][yearDate]["quarter"][quarterDate]["total"]++;
        map[callType]["year"][yearDate]["total"]++;
        map[callType]["total"]++;

    }
    return map
}

function getbarmax(callmap){
    var max = 0;
    Object.values(callmap).forEach(function(arr){
        let total = arr["total"]
        if(max<total){
            max = total
        }
    });
    return max;
}

function getMax(callmap){
    var max=0
    callmap.forEach(function(arr){
        let total = arr["Total"]
        if(max<total){
            max = total
        }
    })
    return max
}

function quarter_of_the_year(date) {
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var qu = Math.ceil(month/3)
    var quarter = "Q"+qu.toString()
    return {year, quarter};
}

var parser = function(row,index){
    if (callType.includes(row["Call Type"])){
        // if (row["On Scene DtTm"]) {


        let out = {};
        let calldate;
        let words = ["Call Type", "Call Date", "Received DtTm", "On Scene DtTm", "Priority"]

        for (i in words) {
            var num;
            var incedentDateParse = d3.timeParse("%m/%d/%Y")
            var incedentDateTimeParse = d3.timeParse("%m/%d/%Y %I:%M:%S %p")
            var word = words[i];
            if (word === "Call Date") {
                num = incedentDateParse(row[word]);
                calldate = num;
            } else if (word === "Received DtTm" || word === "On Scene DtTm") {
                num = incedentDateTimeParse(row[word]);
            } else {
                num = row[word]
            }
            out[word] = num;
        }
        var diffMs = 0
        var diffMins = 0
        if (row["On Scene DtTm"]) {
            diffMs = out["On Scene DtTm"] - out["Received DtTm"];
            diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000)
        }



        out["Time Difference"] = diffMins

        var quarter = quarter_of_the_year(calldate);
        out["quarter"] = quarter
        if( row["On Scene DtTm"]==="06/18/2016 9:11:00 PM"){
            console.log(row)
        }
        return out;

    }
};
function scatterMap(data){
    data.forEach(function(arr){
        console.log(arr)
    })
}
function scatter(row, index){
    // let smap = d3.map();
    if(row[Object.keys(row)[3]]) {

        let out = {}


        out["Call Type"] = row[Object.keys(row)[0]]
        out["Year"] = (row[Object.keys(row)[1]])
        out["Quarter"] = row[Object.keys(row)[2]]
        var timed = ""

        timed = row[Object.keys(row)[3]]
        var timeparse = parseFloat(timed.replace(/[\x00-\x1F\x7F-\x9F]/g, ""))
        out["Time Diff"] = timeparse
        out["Total"] = parseInt(row[Object.keys(row)[4]].replace(/[\x00-\x1F\x7F-\x9F]/g, ""))

        return out
    }


    // for(let key in data.columns){
    //     if(!(smap.has(key))){
    //         let val = test[key]
    //         // let val = map[key]
    //         // let pdif = val["diff"]/val["total"]
    //         bmap.set(key,val )
    //     }
    // }
    // retu
    // let keys = Object.keys(cmap)
    // for(let key in keys){
    //     let ct = keys[key]
    //     if(ct !=="Marine Fire" && ct !=="Explosion") {
    //         for (let ye in year) {
    //             let yea = year[ye]
    //             for (q in Q) {
    //                 let quarter = Q[q]
    //                 let total = cmap[ct]["year"][yea]["quarter"][quarter]["total"]
    //                 let totaldiff = cmap[ct]["year"][yea]["quarter"][quarter]["time diff"]
    //                 let diff = totaldiff / total
    //                 let output = {"Call Type":ct, "Year": yea, "Quarter": quarter, "Total": total, "Time Diff":diff}
    //                 smap.push(output)
    //             }
    //         }
    //     }
    // }
    // return smap

}

var drawBar = function(data,bmap){
    let margin = {
        top: 50,
        right: 45, // leave space for y-axis
        bottom: 100, // leave space for x-axis
        left: 20
    };

    let svg = d3.select("body").select("#vis_j2");
    let bounds = svg.node().getBoundingClientRect();
    let plotWidth = bounds.width - margin.right - margin.left;
    let plotHeight = bounds.height - margin.top - margin.bottom;

    let countMin = 0;
    let countMax = d3.max(bmap.values())

    var color = d3.scaleOrdinal()
        .domain(bmap.entries().map(function(d){
            return d["key"];
        }))
        .range([
            "E377C2",
            "EB6E49",
            "E03426",
            "F1CE63",
            "F9A750"
        ]);

    let countScale = d3.scaleLinear()
        .domain([countMin, countMax])
        .range([plotHeight,0])
        .nice();

    let callTypes = bmap.keys().sort();

    let callTypeScale = d3.scaleBand()
        .domain(callTypes) // all letters (not using the count here)
        .rangeRound([50, plotWidth])
        .paddingInner(0.3);

    var plot = svg.select("g#plot");


    if (plot.size() < 1) {
        plot = svg.append("g")
            .attr("id", "plot");
        plot.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    }

    let xAxis = d3.axisBottom(callTypeScale);
    let yAxis = d3.axisLeft(countScale).ticks(9).tickSize(-plotWidth+50);

    if (plot.select("g#y-axis").size() < 1) {
        let xGroup = plot.append("g").attr("id", "x-axis");

        xGroup.call(xAxis);
        xGroup.attr("transform", "translate(0," + plotHeight + ")");

        let yGroup = plot.append("g").attr("id", "y-axis");
        yGroup.call(yAxis);
        yGroup.attr("transform", "translate(" + 45 + ",0)");

    } else {
        plot.select("g#y-axis").call(yAxis);
    }


    var tooltip = d3.select("body").append("div").attr("class", "toolTipBar");

    let bars = plot.selectAll("rect")
        .data(bmap.entries(), function(d) { return d.key; });

    bars.enter().append("rect")
        .attr("class", "bar")
        .attr("width", callTypeScale.bandwidth())
        .attr("x", function(d) {return callTypeScale(d.key);})
        .attr("y", function(d) {return countScale(d.value);})
        .attr("height", function(d) {return plotHeight - countScale(d.value);})
        .style("fill", function (d) {return color(d.key)})
        .on("mouseon.tool", function(d){

            tooltip.style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 70 + "px")
                .style("display", "inline-block")
                .html((d.key) + "<br>" + (d.value));
        })
        .on("mousemove.tool", function(d){
            tooltip.style("left", d3.event.pageX - 90 + "px")
                .style("top", d3.event.pageY - 70 + "px")
                .style("display", "inline-block")
                .style("color", "white")
                .text("Time Difference: " +d.value +"%" )

        })
        .on("mouseout.tool", function(d){ tooltip.style("display", "none")})
        .on("mouseenter", function (d, i) {
            d3.select(this).attr("opacity", "0.5")
        })
        .on("mouseleave", function (d, i) {
            d3.select(this).attr("opacity", "1")
        })
        // .on("mouseon.highlight", function(d){
        //     console.log(this)
        //     d3.select(this).transition().style("fill", "red");
        // })
        // .on("mouseout.highlight", function(d){
        //     d3.select(this).transition().style("fill", d=>color(d.key))
        // })

        .each(function(d, i, nodes) {
            // console.log("Added bar for:", d.key);
        });

    bars.transition()
        .attr("y", function(d) { return countScale(d.value); })
        .attr("height", function(d) { return plotHeight - countScale(d.value); });

    bars.exit()
        .each(function(d, i, nodes) {
            // console.log("Removing bar for:", d.key);
        })
        .transition()
        .attr("y", function(d) { return countScale(countMin); })
        .attr("height", function(d) { return plotHeight - countScale(countMin); })
        .remove();

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y",  10)
        .attr("x",0 - (plotHeight / 2)-50)
        .attr("dy", ".5em")
        .style("text-anchor", "middle")
        .style("font-size", "10pt")
        .style("font-family", "'Roboto', sans-serif")
        .text("Time Difference from Call Time to Arrive on Scene");

    svg.append("text")
        .attr("x", (margin.right+10))
        .attr("y", (margin.top/2+5))
        .attr("text-anchor", "start")
        .style("font-size", "28px")
        // .style("font-weight", "bold")
        .style("font-family", "'Roboto', sans-serif")
        .text("Response Time for Fire Related Incidents");

    svg.append("text")
        .attr("x", (margin.right))
        .attr("y", (plotHeight+margin.bottom-0))
        .attr("text-anchor", "start")
        .style("font-size", "13px")
        .style("font-family", "'Roboto', sans-serif")
        .style("opacity",".7")
        .text("By Jordan");

    svg.append("text")
        .attr("x", (margin.right))
        .attr("y", (plotHeight+margin.bottom+15))
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .style("font-family", "'Roboto', sans-serif")
        .style("opacity",".7")
        .text("Time Diff for each Call Type.  Color shows details about Call Type. The view is filtered on Call Type and Time Diff. The Call Type filter keeps Explosion, Marine Fire,");

    svg.append("text")
        .attr("x", (margin.right))
        .attr("y", (plotHeight+margin.bottom+30))
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .style("font-family", "'Roboto', sans-serif")
        .style("opacity",".7")
        .text("Outside Fire, Structure Fire and Vehicle Fire. The Time Diff filter keeps non-Null values only.");


}

var drawPlot = function(data) {

    let margin = {
        top: 40,
        right: 45, // leave space for y-axis
        bottom: 110, // leave space for x-axis
        left: 200
    };

    let svg = d3.select("body").select("#vis_j");
    let bounds = svg.node().getBoundingClientRect();
    let plotWidth = bounds.width - margin.right - margin.left;
    let plotHeight = bounds.height - margin.top - margin.bottom;

    let countMin = 0;
    let countMax = getMax(data);

    var color = d3.scaleOrdinal()
        .domain(data.map(function(d){
            return d["Call Type"];
        }))
        .range([
            "FC719E",
            "F89217",
            "F8B620",
            "E03426"
        ]);

    let timeMax = d3.max(data, function(d){
        return d["Time Diff"]
    })
    // let timeMax = 35;

    console.log(timeMax)

    var xScale = d3.scaleLinear()
        .domain([0, timeMax])
        .range([0,plotWidth-margin.right])
        .nice();

    var yScale = d3.scaleLinear()
        .domain([countMin,countMax])
        .range([plotHeight, 0])
        .nice();

    var xAxis = d3.axisBottom().scale(xScale).ticks(5).tickSize(-plotHeight);

    var yAxis = d3.axisLeft().scale(yScale).ticks(6).tickSize(-plotWidth+45);

    const g = svg.append("g").attr("id", "circles")
    g.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return xScale(d["Time Diff"])+margin.right;
        })
        .attr("cy", function(d) {
            return margin.top+yScale(d["Total"]);
        })
        .attr("r", 5)
        .style("fill", function (d) {
            return color(d["Call Type"])
    });

    svg.append("g").attr("id","annotation")

    let circles = d3.select("g#circles").selectAll("circle");
    circles.on("mouseover.highlight", function(d){
        d3.select(this)
            .raise()
            .style("stroke", "red")
            .style("stroke-width", 2)
    })

    circles.on("mouseout.highlight", function(d){
        d3.select(this).style("stroke", null)
    })

    circles.on("mouseover.tool", function(d){
        let me = d3.select(this);
        let div = d3.select("body").append("div")

        div.attr("id", "details");
        div.attr("class","toolTipBar");

        let rows= div.append("table")
            .selectAll("tr")
            .data(Object.keys(d))
            .enter()
            .append("tr")

        rows.append("th").text(function (p,i) {
            return p
        })
        rows.append("td").text(function(p,i){
            return d[p]
        })
    })

    circles.on("mousemove.tool", function(d) {
        let div = d3.select("div#details");
        div.style("left", d3.event.pageX + 5 + "px")
        div.style("top",  d3.event.pageY + 5 + "px");
    });

    circles.on("mouseout.tool", function(d) {
        d3.selectAll("div#details").remove();
    });

    var leg = [
        "Water Rescue",
        "Structure Fire",
        "Vehicle Fire",
        "Outside Fire"
        ]

    var legend = svg.selectAll(".legend")
        .data(leg).enter()
        .append("g")
        .attr("class","legend")
        .attr("transform", "translate(" + 750 + "," + 80+ ")")

    legend.append("rect")
        .attr("x", 0)
        .attr("y", function(d, i) {
            return 20 * i;
        })
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", function(d) {
            return color(d)
        });


    legend.append("text")
        .attr("x", 25)
        .attr("text-anchor", "start")
        .attr("dy", "1em")
        .attr("y", function(d, i) { return 20 * i; })
        .text(function(d) {
            return d;
        })
        .attr("font-size", "12px");


    legend.append("text")
        .attr("x",31)
        .attr("dy", "-.2em")
        .attr("y",-10)
        .text("Call Type")
        .attr("font-size", "17px");

    //x axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate("+(margin.right+15)+"," + (plotHeight+margin.top) + ")")
        .call(xAxis);

    //y axis
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" +(margin.right+15) + ", " +margin.top+")")
        .call(yAxis);

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y",  10)
        .attr("x",0 - (plotHeight / 2)-50)
        .attr("dy", ".5em")
        .style("text-anchor", "middle")
        .style("font-size", "10pt")
        .style("font-family", "'Roboto', sans-serif")
        .text("Number of Records");

    svg.append("text")
        .attr("x", (plotWidth / 1.8))
        .attr("y", (plotHeight+margin.top+30))
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-family", "'Roboto', sans-serif")
        .text("Time Difference from Call Time to Arrive on Scene (Percent in minutes)");

    svg.append("text")
        .attr("x", (margin.right+10))
        .attr("y", (margin.top/2+5))
        .attr("text-anchor", "start")
        .style("font-size", "28px")
        // .style("font-weight", "bold")
        .style("font-family", "'Roboto', sans-serif")
        .text("Top 4 Fire Related Incidents Response Time per Quarter");

    svg.append("text")
        .attr("x", (margin.right))
        .attr("y", (plotHeight+margin.bottom-25))
        .attr("text-anchor", "start")
        .style("font-size", "13px")
        .style("font-family", "'Roboto', sans-serif")
        .style("opacity",".7")
        .text("By Jordan");

    svg.append("text")
        .attr("x", (margin.right))
        .attr("y", (plotHeight+margin.bottom-5))
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .style("font-family", "'Roboto', sans-serif")
        .style("opacity",".7")
        .text("Time Diff vs. sum of Number of Records.  Color shows details about Call Type.  Details are shown for Call Date Quarter.");

    svg.append("text")
        .attr("x", (margin.right))
        .attr("y", (plotHeight+margin.bottom+15))
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .style("font-family", "'Roboto', sans-serif")
        .style("opacity",".7")
        .text("The data is filtered on distinct count of On Scene DtTm, which keeps non-Null values only. The view is filtered on Call Type,");

    svg.append("text")
        .attr("x", (margin.right))
        .attr("y", (plotHeight+margin.bottom+35))
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .style("font-family", "'Roboto', sans-serif")
        .style("opacity",".7")
        .text("which keeps Outside Fire, Structure Fire, Vehicle Fire and Water Rescue.");


}

d3.csv("data/TimeDiff.csv",scatter).then(function(d){
    drawPlot(d);
})
d3.csv("data/SF_Fire_2016_To_2018.csv", parser).then(function(d) {
    let getMap = groupByCall(d);
    let bMap = barMap(d);

    drawBar(d, bMap);
})

