import urllib.request
import sys

url = "https://data.giss.nasa.gov/gistemp/graphs/graph_data/Global_Mean_Estimates_based_on_Land_and_Ocean_Data/graph.txt"

with urllib.request.urlopen(url) as response:
    txt = response.read()
    parsedtemp = txt.decode('UTF-8').split()[-1]
    sys.stdout.write(parsedtemp+"\n")
