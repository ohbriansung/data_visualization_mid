import csv

with open('Fire_Department_Calls_for_Service_2018.csv', 'r') as inp\
    , open('jordan_data.csv', 'w') as out:
    header = ['Unit Type', 'Entry DtTm', 'Station Area']
    csv_writer = csv.DictWriter(out, fieldnames=header)
    csv_writer.writeheader()

    csv_reader = csv.DictReader(inp)
    for row in csv_reader:
        try:
            csv_writer.writerow({
                'Unit Type': row['Unit Type'],
                'Entry DtTm': row['Entry DtTm'],
                'Station Area': row['Station Area']
            })
        except Exception:
            continue