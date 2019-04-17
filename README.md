# San Francisco Fire Department Calls for Service (2016 - 2018)

## Website

### Hosted with GitHub [here](https://usf-cs360-spring2019.github.io/midterm-the-data-vizards/index.html).

## Project Theme: Fire

We planned to present some interesting stories regarding *fire-related* incidents in San Francisco happened between 2016 and 2018 by using tools such as D3.js, Tableau and Vega-Lite. Furthermore, we decided that our color scheme should also fit the theme - red. The records provided by Fire Department in San Francisco contained 28,298 rows of data related to our project theme. We found interesting patterns with the geographical records such as Neighborhoods and Station Area. Moreover, we also found interesting time information with the dataset since we were provided the Call Date, Enter Datetime, Receive Datetime, Response Datetime, etc for each record. Other than that, there were records regarding whether there was medical support presented on scene.

## Data Source

[Fire Department Calls for Service, San Francisco](https://data.sfgov.org/Public-Safety/Fire-Department-Calls-for-Service/nuek-vuh3) \(Our dataset was downloaded on 02/18/2019\)

*The original dataset was 1.79 Gb contained with 4,886,220 rows of records and 34 columns.*

## Data Processing

1. Filtered "City" column with key word *San Francisco*.
2. Filtered "Call Date" column to get the year from date string and removed data not in *2016* and *2018*.
3. Filtered "Call Type Group" column with key word *Fire*.
4. Removed unused columns such as "Call Number", "Unit ID", "Incident Number", "Location" and "RowID".
5. Removed "City" and "Call Type Group" columns since we did filtering on those columns and they only remained the records of key words we've used.
6. Aggregated a new column "Time Diff" using "Received DtTm" and "On Scene DtTm", grouped them by "Call Type", "Year", and "Quarter".

\(See [script source code](https://github.com/usf-cs360-spring2019/midterm-the-data-vizards/tree/gh-pages/data)\)

## Author: The Data Vizards

0. Chien-Yu (Brian) Sung
1. Jordan Aldujaili - \[[LinkedIn](https://www.linkedin.com/in/jaldujaili/)\] \[[GitHub](https://github.com/jaldujaili)\]
1. Gudbrand Schistad - \[[LinkedIn](https://www.linkedin.com/in/gudbrand-schistad/)\] \[[GitHub](https://github.com/gudbrandsc)\]

## Acknowledgment

This projecr is for academic purposes only.

## References
0. [University of San Francisco](https://www.usfca.edu/)
1. [Jekyll](https://help.github.com/articles/setting-up-your-github-pages-site-locally-with-jekyll/)
1. [Bulma.io](https://bulma.io/)
1. [FontAwesome](https://fontawesome.com/)
1. [D3.js](https://d3js.org)
1. [Sophie Engle on Observable](https://observablehq.com/@sjengle)
1. [Fire Department Calls for Service](https://data.sfgov.org/Public-Safety/Fire-Department-Calls-for-Service/nuek-vuh3)
