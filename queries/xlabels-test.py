from rdflib import Graph, URIRef, BNode, Literal, Namespace
from rdflib.namespace import RDF, RDFS, SDO, SKOS
from pathlib import Path


g = Graph().parse(Path(__file__).parent / "xlabels-en.ttl")

q = """
    PREFIX skosxl: <ttp://www.w3.org/2008/05/skos-xl#>
    PREFIX schema: <https://schema.org/>
    
    SELECT ?c ?lf
    WHERE {
        ?c skosxl:prefLabel [
            a skosxl:Label ;
                schema:inLanguage "en" ;
                schema:keywords "stratigraphic" , "shortform" ;
                skosxl:literalForm ?lf ;
            ] ;
        .
    }
    ORDER BY ?c
    """

for r in g.query(q):
    print(r)
