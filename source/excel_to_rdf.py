# This script creates a CSV file in the csv/ folder per language/dialect sheet
# in the chart-source.xlsx Excel file

from pathlib import Path
import pandas as pd
from rdflib import Graph, URIRef, Literal, BNode, Namespace
from rdflib.namespace import RDF, SDO, SKOS

XKOS = Namespace("http://www.w3.org/2008/05/skos-xl#")

namespaces = {
    "gssp":     "http://resource.geosciml.org/ontology/gssp/",
    "gts":      "http://resource.geosciml.org/ontology/timescale/gts#",
    "ischart":  "http://resource.geosciml.org/classifier/ics/ischart/",
    "strat":    "http://resource.geosciml.org/ontology/stratigraphy/",
    "vis":      "http://resource.geosciml.org/ontology/ics-visual-chart/",
}

# load existing content
g = Graph().parse(Path(__file__).parent / "chart-multilang.ttl")

xls = pd.ExcelFile(Path(__file__).parent / "chart-source-master.xlsx")

for sheet_name in xls.sheet_names:
    if sheet_name not in ["README", "default", "en", "it", "es-ES"]:
        print(f"Sheet: {sheet_name}")
        df = pd.read_excel(xls, sheet_name=sheet_name)
        csv_file_name = f"{sheet_name}.csv"

        for i, row in df.iterrows():
            parts = row.IRI.split(":")
            iri = URIRef(namespaces[parts[0]] + parts[1])
            assert iri in g.subjects(), f"IRI {iri} not in graph"
            pl = Literal(row.Language, lang=sheet_name)
            g.add((iri, SKOS.prefLabel, pl))

print(g.serialize(destination="chart-multilang.ttl", format="longturtle"))