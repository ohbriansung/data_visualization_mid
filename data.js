var proto1 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
    "width": 960,
    "height": 500,
    "data": {"url": "data/jordan_data.csv"},

    "mark": "bar",
    "title": "Distribution of Call Type and Month",
    "encoding": {
        "x": {
            "timeUnit": "month",
            "field": "Entry DtTm",
            "type": "ordinal",
            "axis": {"title": "Month of the year"}
        },
        "y": {
            "aggregate": "count",
            "type": "quantitative"
        },
        "color": {
            "field": "Unit Type",
            "type": "nominal",
            "legend": {"title": "Call Type Group"}
        }
    }

};

var proto3 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
    "width": 960,
    "height": 500,
    "data": {"url": "data/modified_data.csv"},
    "mark": "line",
    "title": "Distribution of Call Type and Neighborhoods",
    "encoding": {
        "x": {
            "timeUnit": "month",
            "field": "Call Date",
            "type": "ordinal"
        },
        "y": {
            "aggregate":"count",
            "field": "Call Type Group",
            "type": "quantitative",
        },
        color:{
            "field":"Neighborhooods - Analysis Boundaries",
            "type": "nominal",
            "legend": {"title": "Neighborhoods"}
        }

    }
};

var proto5 = {
  "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
  "data": {"url": "data/response_time_per_weekday.csv"},
  "width": 960,
  "height": 500,
  "mark": "bar",

  "title": "Distribution of Response Time and Weekday",
  "encoding": {
    "x": {
      "field": "response_time",
      "aggregate": "mean",
      "type": "quantitative",
      "axis": {"title": "Average Response Time (Second)"}
    },
    "y": {
      "field": "weekday",
      "type": "ordinal",
      "axis": {"title": "Weekday"},
      "sort": {"encoding": "x"}
    }
  }
};
