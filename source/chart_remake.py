from pathlib import Path
import pandas as pd
from rdflib import Graph, URIRef, Literal, BNode, Namespace
from rdflib.namespace import RDF, SDO, SKOS


prefixes = {
    "dcterms":  "http://purl.org/dc/terms/",
    "gssp":     "http://resource.geosciml.org/ontology/gssp/",
    "gts":      "http://resource.geosciml.org/ontology/timescale/gts#",
    "ischart":  "http://resource.geosciml.org/classifier/ics/ischart/",
    "strat":    "http://resource.geosciml.org/ontology/stratigraphy/",
    "schema":   "https://schema.org/",
    "vis":      "http://resource.geosciml.org/ontology/ics-visual-chart/",
}

VIS = Namespace("http://resource.geosciml.org/ontology/ics-visual-chart/")

def load_nolabels(g):
    print("Loading chart without labels")
    g.parse(Path(__file__).parent / "chart-nolabels.ttl")


def make_labels(g):
    """Read the multilang.xlsx labels source and produce RDF"""
    print("Making labels")

    xls = pd.ExcelFile(Path(__file__).parent / "multilang.xlsx")

    for sheet_name in xls.sheet_names:
        if sheet_name not in ["README", "languages", "prefixes"]:
            print(f"Sheet: {sheet_name}")
            df = pd.read_excel(xls, sheet_name=sheet_name)

            for i, row in df.iterrows():
                if not pd.isna(row.IRI):
                    # ICS' org names
                    if row.IRI == "dcterms:created":
                        g.add((URIRef("https://linked.data.gov.au/org/ics"), SDO.alternateName,
                               Literal(row.Language, lang=sheet_name)))

                    parts = row.IRI.split(":")
                    iri = URIRef(prefixes[parts[0]] + parts[1])
                    # assert iri in g.subjects(), f"IRI {iri} not in graph"
                    if not pd.isna(row.Language):
                        pl = Literal(row.Language, lang=sheet_name)
                        g.add((iri, SKOS.prefLabel, pl))

    g.serialize(destination=Path(__file__).parent / "interim/chart-labels.ttl", format="longturtle")


def make_definitions(g):
    """make definitions from template"""
    print()
    print("Making definitions")

    q = """
        PREFIX ischart: <http://resource.geosciml.org/classifier/ics/ischart/>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX time: <http://www.w3.org/2006/time#>
        PREFIX vis: <http://resource.geosciml.org/ontology/ics-visual-chart/>
        
        INSERT {
            ?element skos:definition ?definition .
        }
        WHERE {
            {
                # get all the time periods and their beginning and end times
                SELECT ?element ?hasBeginning ?hasEnd
                WHERE {
                    ?element 
                        a skos:Concept ;
                        time:hasBeginning/ischart:inMYA ?hasBeginning ;
                        time:hasEnd/ischart:inMYA ?hasEnd ;
                    .
                }
                
            }
            vis:definitionTemplate skos:prefLabel ?definitionTemplate .
            
            BIND(REPLACE(REPLACE(?definitionTemplate, "{hasBeginning}", STR(?hasBeginning)), "{hasEnd}", STR(?hasEnd)) AS ?definition)
        }
        """

    print(f"Began with {len(g)} triples...")
    g.update(q)
    print(f"Ended with {len(g)} triples.")

    g.serialize(destination=Path(__file__).parent / "interim/chart-definitions.ttl", format="longturtle")


def remove_definition_template(g):
    print()
    print("Removing definition templates")
    for s, p, o in g.triples((VIS.definitionTemplate, None, None)):
        g.remove((s, p, o))


if __name__ == '__main__':
    Path("interim").mkdir(parents=True, exist_ok=True)

    g = Graph()

    for k, v in prefixes.items():
        g.bind(k, v)

    load_nolabels(g)
    make_labels(g)
    make_definitions(g)
    remove_definition_template(g)

    print()
    print("Making complete chart")
    g.serialize(destination=Path(__file__).parent.parent / "chart.ttl", format="longturtle")