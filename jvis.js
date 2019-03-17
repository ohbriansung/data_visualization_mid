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
                        "priority": 0,
                        "total":0
                    }
                    map[callType]["year"][ye]["quarter"]
                }
            }
        }
        let priority = parseInt(row["Priority"]);

        let quart = row["quarter"];
        let yearDate = quart["year"];
        let quarterDate = quart["quarter"];

        if (priority !=null){
            map[callType]["year"][yearDate]["quarter"][quarterDate]["priority"] +=priority;
        }
        map[callType]["year"][yearDate]["quarter"][quarterDate]["total"]++;
        map[callType]["year"][yearDate]["total"]++;
        map[callType]["total"]++;

    }
    return map
}




var drawTable = function(map) {

    let margin = {
        top: 50,
        right: 45, // leave space for y-axis
        bottom: 80, // leave space for x-axis
        left: 20
    };

    let svg = d3.select("body").select("#vis_j");
    let bounds = svg.node().getBoundingClientRect();
    let plotWidth = bounds.width - margin.right - margin.left;
    let plotHeight = bounds.height - margin.top - margin.bottom;

    let countMin = 0;
    let countMax = getMax(map);

    var x = d3.scaleBand()
        .domain(days)
        .rangeRound([45, plotWidth]);

    var y = d3.scaleLinear()
        .domain([countMin,countMax])
        .range([plotHeight, 0])
        .nice();

}



function getMax(map){
    var max=0
    let values = Object.values(map)
    for(let value in values){
        let val2 = Object.values(values[value])
        for(let v2 in val2){
            let val3 = Object.values(val2[v2])
            for(v3 in val3){
                let total = val3[v3]["total"]
                console.log(total)
                if(max<total){
                    max = total
                }
            }
        }
    }
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

};

d3.csv("data/SF_Fire_2016_To_2018.csv", parser).then(function(d) {
    let getMap = groupByCall(d)
    console.log(getMap)
    getMax(getMap)
    // drawTable(getMap)
})

