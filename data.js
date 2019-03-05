var proto1 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
    "data": {"url": "data/Fire_Department_Calls_for_Service_2018.csv"},

    "mark": "bar",
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

var proto2 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
    "data": {"url": "data/Fire_Department_Calls_for_Service_2018.csv"},
    "mark": "line",
    "encoding": {
        "x": {
            "timeUnit": "date",
            "field": "Entry DtTm",
            "type": "ordinal"
        },
        "y": {
            "aggregate":"mean",
            "field": "Station Area",
            "type": "quantitative"
        },
        color:{
            "field":"Unit Type",
            "type": "nominal"
        }

    }

};

var proto3 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
    "data": {"url": "data/response_time_per_weekday.csv"},
    "mark": "bar",

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