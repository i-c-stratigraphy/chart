# This script creates a CSV file in the csv/ folder per language/dialect sheet
# in the chart-source.xlsx Excel file

from pathlib import Path
import pandas as pd
from rdflib import Graph, URIRef, Literal, BNode, Namespace
from rdflib.namespace import RDF, SDO, SKOS

XKOS = Namespace("http://www.w3.org/2008/05/skos-xl#")

namespaces = {
    "dcterms":  "http://purl.org/dc/terms/",
    "gssp":     "http://resource.geosciml.org/ontology/gssp/",
    "gts":      "http://resource.geosciml.org/ontology/timescale/gts#",
    "ischart":  "http://resource.geosciml.org/classifier/ics/ischart/",
    "strat":    "http://resource.geosciml.org/ontology/stratigraphy/",
    "schema":   "https://schema.org/",
    "vis":      "http://resource.geosciml.org/ontology/ics-visual-chart/",
}

# load existing content
g = Graph()

xls = pd.ExcelFile(Path(__file__).parent / "multilang/source-multilang.xlsx")

for sheet_name in xls.sheet_names:
    if sheet_name not in ["README", "default", "languages"]:
        print(f"Sheet: {sheet_name}")
        df = pd.read_excel(xls, sheet_name=sheet_name)

        for i, row in df.iterrows():
            if row.IRI not in [
                "vis:mainBlurb",
            ]:
                if not pd.isna(row.IRI):
                    parts = row.IRI.split(":")
                    iri = URIRef(namespaces[parts[0]] + parts[1])
                    #assert iri in g.subjects(), f"IRI {iri} not in graph"
                    if not pd.isna(row.Language):
                        pl = Literal(row.Language, lang=sheet_name)
                        g.add((iri, SKOS.prefLabel, pl))

for k, v in namespaces.items():
    g.bind(k, v)
g.serialize(destination=str(Path(__file__).parent / "multilang/chart-multilang.ttl"), format="longturtle")
print(len(g))