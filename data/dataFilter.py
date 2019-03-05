import csv


with open('Fire_Department_Calls_for_Service_2018.csv', 'r') as inp, open('modified_data.csv', 'w') as out_2018:
    writer = csv.writer(out_2018)
    header = 0
    for row in csv.reader(inp):
    	if header == 0:
    		writer.writerow(row)
    		header = 1
    	else:
    		if row[22] == "Fire":
		    	if row[28] == 'Bayview Hunters Point':
		    		writer.writerow(row)
		    	elif row[28] == 'Castro/Upper Market':
		    		writer.writerow(row)
		    	elif row[28] == 'Financial District/South Beach':
		    		writer.writerow(row)
		    	elif row[28] == 'Hayes Valley':
		    		writer.writerow(row)
		    	elif row[28] == 'Mission':
		    		writer.writerow(row)
		    	elif row[28] == 'Nob Hill':
		    		writer.writerow(row)
		    	elif row[28] == 'South of Market':
		    		writer.writerow(row)
		    	elif row[28] == 'Sunset/Parkside':
		    		writer.writerow(row)
		    	elif row[28] == 'Tenderloin':
		    		writer.writerow(row)
		    	elif row[28] == 'Western Addition':
		    		writer.writerow(row)
         