# This script converts .csv files in the csv/ folder to RDF files in the Turtle format,
# ending .ttl, in the rdf/ folder

# This script also created the compounded RDF file xlsx.ttl file in this folder.

from rdflib import Graph, URIRef, BNode, Literal, Namespace
from rdflib.namespace import RDF, SDO
from pathlib import Path
import csv

SKOSXL = Namespace("ttp://www.w3.org/2008/05/skos-xl#")
CSV_DIR = Path(__file__).parent / "csv"
TTL_DIR = Path(__file__).parent / "rdf"

g2 = Graph()

for f in CSV_DIR.glob("*.csv"):
    f: Path
    g = Graph()
    g.bind("skosxl", SKOSXL)

    data = csv.reader(open(f))
    data.__next__()  # skip header
    for row in data:
        c = URIRef(row[0])
        lf = Literal(row[1])
        bn = BNode()
        g.add((c, SKOSXL.prefLabel, bn))
        g.add((bn, RDF.type, SKOSXL.Label))
        g.add((bn, SKOSXL.literalForm, lf))
        lang = f.name.replace(".csv", "")
        g.add((bn, SDO.inLanguage, Literal(lang)))
        for word in row[2].split(","):
            g.add((bn, SDO.keywords, Literal(word)))

    g.serialize(destination=TTL_DIR / f.name.replace(".csv", ".ttl"), format="turtle")
    g2 += g

g2.serialize(destination=Path(__file__).parent / "xlsx.ttl", format="turtle")
