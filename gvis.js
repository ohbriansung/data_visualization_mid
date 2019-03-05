var proto4 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
    "width": 960,
    "height": 500,
    "data": {"url": "data/modified_data.csv"},
    "mark": "bar",
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
}
