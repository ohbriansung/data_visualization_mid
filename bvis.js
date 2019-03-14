const weekday = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
]

translate = function(a, b) {
  return "translate(" + a + ", " + b + ")";
}

countDay = function(d) {
  let map = {};

  for (let i = 0; i < d.length; i++) {
    let row = d[i];
    let neighborhood = row["Neighborhooods - Analysis Boundaries"];

    if (!(neighborhood in map))  {
      map[neighborhood] = {
        "weekday": {},
        "total": 0
      };

      for (let j = 0; j < weekday.length; j++) {
        let day = weekday[j];
        map[neighborhood]["weekday"][day] = 0;
      }
    }

    let parts = row["Call Date"].split('/');
    let date = new Date(parts[2], parts[0] - 1, parts[1]);
    let day = weekday[date.getDay() % 7];
    map[neighborhood]["weekday"][day]++;
    map[neighborhood]["total"]++;
  }

  return map;
}

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

  return top;
}

neighborhoodFormatter = function(d) {
  let length = d.length;

  if (length > 25) {
    let label = d3.select(this);
    label.text("");
    let text1 = d.substr(0, 24);
    let text2 = d.substr(25);

    let firstLine = label.append("tspan").text(text1);
    let secondLine = label.append("tspan").text(text2);

    firstLine.attr("x", "-6");
    firstLine.attr("y", "-0.5em");
    secondLine.attr("x", "-6");
    secondLine.attr("dy", "1em");
  }
}

heatmap = function(map, top) {
  const margin = {
    top: 60,
    right: 250,
    bottom: 80,
    left: 60
  };

  const svg = d3.select("#vis_b1");
  const bounds = svg.node().getBoundingClientRect();
  const plotWidth = bounds.width - margin.right - margin.left;
  const plotHeight = bounds.height - margin.top - margin.bottom;

  // color encoding range
  let min = map[top[top.length - 1]]["total"] - 30;
  let max = map[top[0]]["total"] + 30;
  let mid = (min + max / 2);
  let range = [min, mid, max];

  // create x, y, color scales
  let x = d3.scaleBand().domain(weekday).range([0, plotWidth]);
  let y = d3.scaleBand().domain(top).range([0, plotHeight]);
  let color = d3.scaleSequential(d3.interpolateRed).domain(range);

  //  create plot
  let plot = svg.append("g");
  plot.attr("id", "plot1");
  plot.attr("transform", translate(margin.left, margin.top));

  // create x and y  axis
  let xAxis = d3.axisTop(x).tickPadding(0);
  let yAxis = d3.axisLeft(y).tickPadding(0);

  let xGroup = plot.append("g").attr("id", "x-axis-1");
  xGroup.call(xAxis);
  xGroup.attr("transform", translate(margin.left, 0));
  xGroup.attr("class", "axis");

  let yGroup = plot.append("g").attr("id", "y-axis-1");
  yGroup.call(yAxis);
  yGroup.attr("transform", translate(margin.left, 0));
  yGroup.attr("class", "axis");
  yGroup.selectAll(".tick text").each(neighborhoodFormatter);
/*
  // title
  svg.append("text")
    .attr("text-anchor", "start")
    .attr("class", "title")
    .attr("transform", translate(15, 35))
    .text("Parents’ and Children’s Income Distributions by College Tier");

  // caption
  plot.append("text")
    .attr("text-anchor", "start")
    .attr("class", "captions")
    .attr("dy", "0em")
    .attr("transform", translate(-5, plotHeight + 30))
    .text("Author: Brian Sung");

  plot.append("text")
    .attr("text-anchor", "start")
    .attr("class", "captions")
    .attr("dy", "1em")
    .attr("transform", translate(-5, plotHeight + 30))
    .text("You can see in the chart, children attending high-tier schools come from families with better income. For example, all families with children go to schools between");

  plot.append("text")
    .attr("text-anchor", "start")
    .attr("class", "captions")
    .attr("dy", "2em")
    .attr("transform", translate(-5, plotHeight + 30))
    .text("tier 1 to tier 4 have income rank above 0.65. We can also tell from the chart that children's earning might not be greater than their parents' even if they go to a tier 1");

  plot.append("text")
    .attr("text-anchor", "start")
    .attr("class", "captions")
    .attr("dy", "3em")
    .attr("transform", translate(-5, plotHeight + 30))
    .text("school. However, this could be a result of fewer years of experience. Furthermore, we can see tier 1 schools are mostly located in West (more solid line).");
    */
}

d3.csv(
  "data/SF_Fire_2016_To_2018.csv"
)
.then(function(d) {
  let map = countDay(d);
  let list  = sortList(map);
  let top = getTop(list, 10);
  heatmap(map, top);
})
