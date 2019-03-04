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
