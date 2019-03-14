// vis_b1

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

heatmap = function(map, top) {
  let margin = {
    top: 60,
    right: 250,
    bottom: 80,
    left: 20
  };

  const svg = d3.select("#vis");
  const bounds = svg.node().getBoundingClientRect();
  const plotWidth = bounds.width - margin.right - margin.left;
  const plotHeight = bounds.height - margin.top - margin.bottom;

  let plot = svg.append("g");
  plot.attr("id", "plot");
  plot.attr("transform", translate(margin.left, margin.top));

  let x = d3.scalePoint().range([0, plotWidth]).padding(0.18);
  let y = {};

  let dimensions = d3.keys(data[0]).filter(function(d) {
    if (d == "region" || d == "tier" || d == "par_rank" || d == "k_rank") {
      y[d] = d3.scaleLinear()
          .domain(d3.extent(data, function(p) { return +p[d]; }))
          .range([plotHeight, 0]);

      return true;
    }

    return false;
  }).sort(sortAxis);

  x.domain(dimensions);

  let minimum = getMin(x, dimensions) - margin.left;

  // draw lines and colors
  let background = plot.append("g")
    .attr("class", "line")
    .selectAll("path")
    .data(data)
    .enter().append("path")
    .attr("d", path)
    .attr("stroke", function(d) { return colors[d["tier_name"]]; });

  // draw axises
  let dimension = plot.selectAll(".dimension")
    .data(dimensions)
    .enter().append("g")
    .attr("class", "dimension")
    .attr("transform", function(d) { return translate(x(d) - minimum, 0); });

  // axis titles
  dimension.append("g")
    .attr("class", "axis")
    .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -10)
    .text(function(d) { return d; });

  function path(d) {
    return d3.line()(dimensions.map(function(p) { return [x(p) - minimum, y[p](+d[p])]; }));
  }

  // color encoding for legend
  let color_map = get_colors(tier_map);
  let colorScale = d3.scaleOrdinal().range(color_map).domain(tier_map);

  // legend
  let legend = svg.selectAll(".legend")
		.data(colorScale.domain())
		.enter()
    .append("g")
		.attr("class", "legend")
		.attr("transform", function(d, i) {
      return translate(plotWidth, 15 + i * 20);
    });

	legend.append("rect")
		.attr("width", 18)
		.attr("height", 18)
		.style("fill", colorScale);

	legend.append("text")
    .attr("class", "label")
		.attr("x", 23)
		.attr("y", 12)
		.style("text-anchor", "start")
		.text(function(d, i) { return (i + 1) + " " + d; });

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
}

d3.csv(
  "data/SF_Fire_2016_To_2018.csv"
)
.then(function(d) {
  let map = countDay(d);
  let list  = sortList(map);
  let top = getTop(list, 10);
  //heatmap(map, top);
})
