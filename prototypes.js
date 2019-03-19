var proto2 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
    "width": 960,
    "height": 500,
    "data": {"url": "data/jordan_data.csv"},
    "mark": "line",
    "encoding": {
        "x": {
            "timeUnit": "date",
            "field": "Entry DtTm",
            "type": "ordinal"
        },
        "y": {
            "aggregate": "mean",
            "field": "Station Area",
            "type": "quantitative"
        },
        "color": {
            "field": "Unit Type",
            "type": "nominal"
        }
    }
};
