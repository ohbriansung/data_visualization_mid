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
    right: 260,
    bottom: 80,
    left: 85
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
    .attr("transform", translate(0, -6))
    .style("text-anchor", "start")
    .text("Neighborhood");

  // create grid line
  plot.append("line")
    .attr("class", "grid-line")
    .attr("x1", -margin.left + 10)
    .attr("y1", 0)
    .attr("x2", margin.left)
    .attr("y2", 0);

   plot.append("line")
    .attr("class", "grid-line")
    .attr("x1", -margin.left + 10)
    .attr("y1", plotHeight)
    .attr("x2", margin.left)
    .attr("y2", plotHeight);

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
          return {
            "neighborhood": d,
            "day": p,
            "value": map[d]["weekday"][p]
          };
        }
      );
    })
    .enter()
    .append("rect");

  cells.attr("x", function(d) { return x(d["day"]); });
  cells.attr("y", 0); // handled by group transform
  cells.attr("width", x.bandwidth());
  cells.attr("height", y.bandwidth());
  cells.attr("class", "cell");
  cells.style("fill", function(d) { return color(d["value"]); });
  cells.style("stroke", function(d) { return color(d["value"]); });

  // create legend
  let legendWidth = 100;
  let legendHeight = 18;
  let legend = svg.append("g").attr("id", "color-legend");
  legend.attr("transform", translate(
    (plotWidth + margin.left + legendWidth / 2 + 65), 15
  ));

  let legendTitle = legend.append("text")
    .attr("dx", -20)
    .attr("dy", 12)
    .text("Number of Records");

  // create the rectangle
  let colorBox = legend.append("rect")
    .attr("class", "frame")
    .attr("x", 0)
    .attr("y", 12 + 6)
    .attr("width", legendWidth)
    .attr("height", legendHeight);

  let colorDomain = [min, max];
  let percent = d3.scaleLinear().range([0, 100]).domain(colorDomain);

  // create color scheme for each offset
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
    .attr("x", -18)
    .attr("y", 32)
    .style("text-anchor", "start")
    .text(min + 30);

  legend.append("text")
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

  // interaction
  let days = d3.select("g#x-axis-1").selectAll("g.tick");
  let neighborhoods = d3.select("g#y-axis-1").selectAll("g.tick");
  let heats = d3.selectAll("rect.cell");

  days.on("mouseover.brushingDays", function(d) {
    heats.filter(e => (e["day"] != d))
      .transition()
      .style("fill", "#B0B0B0")
      .style("stroke", "#B0B0B0");
  });

  days.on("mouseout.brushingDays", function(d) {
    heats.filter(e => (e["day"] != d))
      .transition()
      .style("fill", e => color(e["value"]))
      .style("stroke", e => color(e["value"]));
  });

  neighborhoods.on("mouseover.brushingNeighborhoods", function(d) {
    heats.filter(e => (e["neighborhood"] != d))
      .transition()
      .style("fill", "#B0B0B0")
      .style("stroke", "#B0B0B0");
  });

  neighborhoods.on("mouseout.brushingNeighborhoods", function(d) {
    heats.filter(e => (e["neighborhood"] != d))
      .transition()
      .style("fill", e => color(e["value"]))
      .style("stroke", e => color(e["value"]));
  });

  heats.on("mouseover.highlight", function(d) {
    let div = d3.select("body").append("div");
    div.attr("id", "details");
    div.attr("class", "tooltip");

    let table = div.append("table")
      .selectAll("tr")
      .data(Object.keys(d))
      .enter()
      .append("tr");

    table.append("th").text(key => key);
    table.append("td").text(key => d[key]);
  });

  heats.on("mousemove.highlight", function(d) {
    let div = d3.select("div#details");
    div.style("left", d3.event.clientX + "px")
    div.style("top",  d3.event.clientY + "px");
  });

  heats.on("mouseout.highlight", function(d) {
    d3.selectAll("div#details").remove();
  });
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
