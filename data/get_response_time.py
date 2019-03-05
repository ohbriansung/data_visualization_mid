import sys
import csv
from datetime import datetime as dt

datetime_format = '%m/%d/%Y %I:%M:%S %p'
date_format = '%m/%d/%Y'

with open('Fire_Department_Calls_for_Service_2018.csv', 'r') as inp\
    , open('response_time_per_weekday.csv', 'w') as out:
    header = ['weekday', 'response_time']
    csv_writer = csv.DictWriter(out, fieldnames=header)
    csv_writer.writeheader()

    csv_reader = csv.DictReader(inp)
    for row in csv_reader:
        try:
            receive = dt.strptime(row['Received DtTm'], datetime_format)
            response = dt.strptime(row['Response DtTm'], datetime_format)
            weekday = dt.strptime(row['Call Date'], date_format).strftime("%A")
            second = (response - receive).total_seconds()
            csv_writer.writerow({'weekday': weekday, 'response_time': second})
        except Exception:
            continue
