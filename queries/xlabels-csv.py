from rdflib import Graph, URIRef, BNode, Literal, Namespace
from rdflib.namespace import RDF, RDFS, SKOS
from pathlib import Path


g = Graph().parse(Path(__file__).parent.parent / "chart.ttl")
print(len(g))

q = """
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    
    SELECT ?x ?al
    WHERE {
        ?x skos:altLabel ?al .
        
        FILTER (lang(?al) = "nl")
    }
    ORDER BY ?pl
    """
# for c, pl in g.subject_objects(SKOS.prefLabel):
#     print(c, pl)

for r in g.query(q):
    print(f"{r[0]},{r[1]},\"timescale,stratigraphic,longform,shortform\"")