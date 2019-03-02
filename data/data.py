import csv


with open('Fire_Department_Calls_for_Service.csv', 'r') as inp\
, open('Fire_Department_Calls_for_Service_2018.csv', 'w') as out_2018:
    writer_2018 = csv.writer(out_2018)
    header = 0

    for row in csv.reader(inp):
        # remove the first 3 and the last 2 columns
        row = row[3:-2]

        if header == 0:
            writer_2018.writerow(row)
            header = 1
        elif row[13] == "San Francisco":
            # only includes San Francisco records in 2018
            year = int(row[1][-4:])

            if year == 2018:
                writer_2018.writerow(row)
