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
    top: 70,
    right: 250,
    bottom: 80,
    left: 70
  };

  const svg = d3.select("#vis_b1");
  const bounds = svg.node().getBoundingClientRect();
  const plotWidth = bounds.width - margin.right - margin.left;
  const plotHeight = bounds.height - margin.top - margin.bottom;

  // color encoding range
  let min = map[top[0]]["total"];
  let max = 0;
  for (let i = 0; i < top.length; i++) {
    for (let j = 0; j < weekday.length; j++) {
      min = Math.min(min, map[top[i]]["weekday"][weekday[j]]);
      max = Math.max(max, map[top[i]]["weekday"][weekday[j]]);
    }
  }
  let mid = (min + max) / 2 + 200;
  min -= 30;
  let range = [min, mid, max];

  // create x, y, color scales
  let x = d3.scaleBand().domain(weekday).range([0, plotWidth]);
  let y = d3.scaleBand().domain(top).range([0, plotHeight]);
  let color = d3.scaleSequential(d3.interpolateReds).domain(range);

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
  xGroup.attr("class", "axis-heatmap");

  let yGroup = plot.append("g").attr("id", "y-axis-1");
  yGroup.call(yAxis);
  yGroup.attr("transform", translate(margin.left, 0));
  yGroup.attr("class", "axis-heatmap");
  yGroup.selectAll(".tick text").each(neighborhoodFormatter);

  // Y axis name
  plot.append("text")
    .attr("class", "legendText")
    .attr("transform", translate(-5, -5))
    .text("Neighborhood");

  // create one group per row
  let rows = plot.selectAll("g.cell")
    .data(top)
    .enter()
    .append("g");

  rows.attr("class", "cell");
  rows.attr("id", function(d) { return "Neighborhood-" + d; });
  rows.attr("transform", function(d) { return translate(margin.left, y(d)); });

  // create one rect per cell within row group

  let cells = rows.selectAll("rect")
    .data(function(d) {
      return weekday.map(
        function(p) {
          return {"day": p, "value": map[d]["weekday"][p]};
        }
      );
    })
    .enter()
    .append("rect");

  cells.attr("x", function(d) { return x(d["day"]); });
  cells.attr("y", 0); // handled by group transform
  cells.attr("width", x.bandwidth());
  cells.attr("height", y.bandwidth());
  cells.attr("count", function(d) { return d["value"]; });
  cells.style("fill", function(d) { return color(d["value"]); });
  cells.style("stroke", function(d) { return color(d["value"]); });

  // create legend
  let legendWidth = 110;
  let legendHeight = 20;
  let legend = svg.append("g").attr("id", "color-legend");
  legend.attr("transform", translate(plotWidth + margin.left + legendWidth / 2 + 45, 15))

  let legendTitle = legend.append("text")
    .attr("class", "legendText")
    .attr("dx", -20)
    .attr("dy", 12)
    .text("Number of Records");

  // create the rectangle
  let colorBox = legend.append("rect")
    .attr("x", 0)
    .attr("y", 12 + 6)
    .attr("width", legendWidth)
    .attr("height", legendHeight);

  let colorDomain = [min, max];
  let percent = d3.scaleLinear().range([0, 100]).domain(colorDomain);

  // we have to first add gradients
  let defs = svg.append("defs");
  defs.append("linearGradient")
    .attr("id", "gradient")
    .selectAll("stop")
    .data(color.ticks())
    .enter()
    .append("stop")
    .attr("offset", (d => percent(d) + "%"))
    .attr("stop-color", (d => color(d)));
  colorBox.attr("fill", "url(#gradient)");

  legend.append("text")
    .attr("class", "legendText")
    .attr("x", -18)
    .attr("y", 32)
    .style("text-anchor", "start")
    .text(min + 30);

  legend.append("text")
    .attr("class", "legendText")
    .attr("x", legendWidth + 2)
    .attr("y", 32)
    .style("text-anchor", "start")
    .text(max);

  // title
  svg.append("text")
    .attr("text-anchor", "start")
    .attr("class", "title")
    .attr("transform", translate(15, 35))
    .text("Frequency of Fire Incidents in Top 10 Neighborhoods per Weekday");

  // caption
  plot.append("text")
    .attr("text-anchor", "start")
    .attr("class", "captions")
    .attr("dy", "0em")
    .attr("transform", translate(-margin.left + 10, plotHeight + 20))
    .text("Author: Brian Sung");

  plot.append("text")
    .attr("text-anchor", "start")
    .attr("class", "captions")
    .attr("dy", "1em")
    .attr("transform", translate(-margin.left + 10, plotHeight + 20))
    .text("The view is filtered on Neighborhoods, which keeps top 10 of 42 members based on total number of records. The Neighborhoods axis is");

  plot.append("text")
    .attr("text-anchor", "start")
    .attr("class", "captions")
    .attr("dy", "2em")
    .attr("transform", translate(-margin.left + 10, plotHeight + 20))
    .text("sorted by total number of records as well. The color repersents the frequency of fire incidents, the darker ther higher. Weekend, includes");

  plot.append("text")
    .attr("text-anchor", "start")
    .attr("class", "captions")
    .attr("dy", "3em")
    .attr("transform", translate(-margin.left + 10, plotHeight + 20))
    .text("Friday, seems to be the period that incidents happened the most for these neighborhoods.");
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
