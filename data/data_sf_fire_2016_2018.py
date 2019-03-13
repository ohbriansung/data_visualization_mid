import csv


with open('Fire_Department_Calls_for_Service.csv', 'r') as inp\
    , open('SF_Fire_2016_To_2018.csv', 'w') as out:
    header = [
        'Call Type',
        'Call Date',
        'Watch Date',
        'Received DtTm',
        'Entry DtTm',
        'Dispatch DtTm',
        'Response DtTm',
        'On Scene DtTm',
        'Transport DtTm',
        'Hospital DtTm',
        'Call Final Disposition',
        'Available DtTm',
        'Station Area',
        'Original Priority',
        'Priority',
        'Final Priority',
        'ALS Unit',
        'Number of Alarms',
        'Unit Type',
        'Unit sequence in call dispatch',
        'Fire Prevention District',
        'Supervisor District',
        'Neighborhooods - Analysis Boundaries',
    ]
    writer = csv.DictWriter(out, fieldnames=header)
    writer.writeheader()

    reader = csv.DictReader(inp)
    for row in reader:
        if row['City'] == 'San Francisco' \
            and 2016 <= int(row['Call Date'][-4:]) <= 2018 \
            and row['Call Type Group'] == 'Fire':
            try:
                pending = {}
                for key in header:
                    pending[key] = row[key]
                writer.writerow(pending)
            except Exception:
                continue
