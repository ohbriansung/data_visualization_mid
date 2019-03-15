function groupByCall(d){
    let map = {};
    var row;
    for (row in d){
        var callType = row["Call Type"];
        if(map.has(callType)){

        }else{
            map.set(callType, )
        }
    }



}

var drawBarChart = function(d) {

    if (count.length === 0) {
        return
    }
    let svg = d3.select("body").select("svg");


    let margin = {
        top: 50,
        right: 45, // leave space for y-axis
        bottom: 80, // leave space for x-axis
        left: 20
    };

    let bounds = svg.node().getBoundingClientRect();
    let plotWidth = bounds.width - margin.right - margin.left;
    let plotHeight = bounds.height - margin.top - margin.bottom;
}

function quarter_of_the_year(date)
{
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var quarter = Math.ceil(month/3)
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
    // let getMap = groupByCall(d)
    drawTable(d)
})

