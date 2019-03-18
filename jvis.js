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

        // if (priority !=null){
        map[callType]["year"][yearDate]["quarter"][quarterDate]["time diff"] +=diff;
        // }
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
        let total = arr[3]
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
        if (row["On Scene DtTm"]) {


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

            var diffMs = out["On Scene DtTm"] - out["Received DtTm"];
            var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000)
            out["Time Difference"] = diffMins

            var quarter = quarter_of_the_year(calldate);
            out["quarter"] = quarter
            return out;
        }
    }
};

function scatterMap(cmap){
    let smap = [];
    let keys = Object.keys(cmap)
    for(let key in keys){
        let ct = keys[key]
        if(ct !=="Marine Fire" || ct !=="Explosion") {
            for (let ye in year) {
                let yea = year[ye]
                for (q in Q) {
                    let quarter = Q[q]
                    let total = cmap[ct]["year"][yea]["quarter"][quarter]["total"]
                    let totaldiff = cmap[ct]["year"][yea]["quarter"][quarter]["time diff"]
                    let diff = totaldiff / total
                    let output = [ct, yea, quarter, total, diff]
                    smap.push(output)
                }
            }
        }
    }
    return smap

}

var drawBar = function(data,bmap){
    let margin = {
        top: 50,
        right: 45, // leave space for y-axis
        bottom: 80, // leave space for x-axis
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

    let bars = plot.selectAll("rect")
        .data(bmap.entries(), function(d) { return d.key; });

    bars.enter().append("rect")
        .attr("class", "bar")
        .attr("width", callTypeScale.bandwidth())
        .attr("x", function(d) {return callTypeScale(d.key);})
        .attr("y", function(d) {return countScale(d.value);})
        .attr("height", function(d) {return plotHeight - countScale(d.value);})
        .style("fill", function (d) {return color(d.key)})
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

}

var drawPlot = function(data, cmap) {

    let margin = {
        top: 50,
        right: 45, // leave space for y-axis
        bottom: 90, // leave space for x-axis
        left: 20
    };

    let svg = d3.select("body").select("#vis_j");
    let bounds = svg.node().getBoundingClientRect();
    let plotWidth = bounds.width - margin.right - margin.left;
    let plotHeight = bounds.height - margin.top - margin.bottom;

    let countMin = 0;
    let countMax = getMax(cmap);

    var color = d3.scaleOrdinal()
        .domain(cmap.map(function(d){ return d[0];}))
        .range([
            "E03426",
            "F89217",
            "F8B620",
            "FC719E"
        ]);

    let timeMax = d3.max(cmap, function(d){
        return d[4]
    })
    console.log(timeMax)
    var xScale = d3.scaleLinear()
        .domain([0, timeMax])
        .range([0,plotWidth])
        .nice();

    var yScale = d3.scaleLinear()
        .domain([countMin,countMax])
        .range([plotHeight, 0])
        .nice();

    var xAxis = d3.axisBottom().scale(xScale).ticks(5);

    var yAxis = d3.axisLeft().scale(yScale).ticks(6).tickSize(-plotWidth+50);

    const g = svg.append("g").attr("id", "circles")
    g.selectAll("circle")
        .data(cmap)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return xScale(d[4]);
        })
        .attr("cy", function(d) {

            return plotHeight - yScale(d[3]);
        })
        .attr("r", 5)
        .style("fill", function (d) {
            return color(d[0])
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

    // circles.on("mousedown", function (d) {
    //     circles.filter(e=>(d[0] !== e[0])).transition().style("fill", "#bbbbbb");
    // })
    // svg.on("mouseup", function (d){
    //     circles.transition().style("fill", d=> color(d[0]))
    // })

    circles.on("mouseover.tool", function(d){
        console.log()
        let me = d3.select(this);
        let div = d3.select("body").append("div")

        div.attr("id", "details");
        div.attr("class","tooltip");

        let rows= div.append("table")
            .selectAll("tr")
            .data(cmap)
            .enter()
            .append("tr")

        rows.append("th").text(key=>d[0])
        rows.append("td").text(key=>d[1])
    })

    circles.on("mousemove.tool", function(d) {
        let div = d3.select("div#details");

        // get height of tooltip
        let bbox = div.node().getBoundingClientRect();

        div.style("left", d3.event.clientX + "px")
        div.style("top",  (d3.event.clientY - bbox.height) + "px");
    });

    circles.on("mouseout.tool", function(d) {
        d3.selectAll("div#details").remove();
    });

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
        .attr("y", (plotHeight+margin.bottom))
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-family", "'Roboto', sans-serif")
        .text("Time Difference from Call Time to Arrive on Scene (Percent in min)");

}


d3.csv("data/SF_Fire_2016_To_2018.csv", parser).then(function(d) {
    let getMap = groupByCall(d);
    let bMap = barMap(d);
    let sMap = scatterMap(getMap);

    drawPlot(d, sMap);
    drawBar(d, bMap);
})

