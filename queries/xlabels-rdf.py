from rdflib import Graph, URIRef, BNode, Literal, Namespace
from rdflib.namespace import RDF, RDFS, SDO, SKOS
from pathlib import Path
import csv

SKOSXL = Namespace("ttp://www.w3.org/2008/05/skos-xl#")

g = Graph()

with open(Path(__file__).parent / "xlabels-en.csv") as f:
    data = csv.reader(f)
    for row in data:
        # print(f"{row[0]}, {row[1]}:")

        c = URIRef(row[0])
        lf = Literal(row[1])
        bn = BNode()
        g.add((c, SKOSXL.prefLabel, bn))
        g.add((bn, RDF.type, SKOSXL.Label))
        g.add((bn, SKOSXL.literalForm, lf))
        g.add((bn, SDO.inLanguage, Literal("en")))
        for word in row[2].split(","):
            # print(f"\t{word}")
            g.add((bn, SDO.keywords, Literal(word)))



rdf = g.serialize(format="longturtle").replace("ns1:", "skosxl:")

open(Path(__file__).parent / "xlabels-en.ttl", "w").write(rdf)

# g = Graph().parse(Path(__file__).parent / "chart-xlabels.ttl")
# print(len(g))
#
# q = """
#     PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
#
#     SELECT ?x ?pl
#     WHERE {
#         ?x skos:prefLabel ?pl .
#     }
#     ORDER BY ?pl
#     """
# # for c, pl in g.subject_objects(SKOS.prefLabel):
# #     print(c, pl)
#
# for r in g.query(q):
#     print(f"{r[0]},{r[1]},\"timescale,stratigraphic,longform,shortform\"")