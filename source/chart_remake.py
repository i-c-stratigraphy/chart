from pathlib import Path
import pandas as pd
from rdflib import Graph, URIRef, Literal, BNode, Namespace, DCTERMS
from rdflib.namespace import RDF, SDO, SKOS

CS = URIRef("https://data.stratigraphy.org/def/chart")
GSSP = Namespace("https://data.stratigraphy.org/data/gssps/")
GTS = Namespace("http://resource.geosciml.org/ontology/timescale/gts#")
STRAT = Namespace("https://data.stratigraphy.org/data/strat/")
VIS = Namespace("https://data.stratigraphy.org/data/vis/")

prefixes = {
    "cs":       str(CS),
    "dcterms":  "http://purl.org/dc/terms/",
    "gssp":     str(GSSP),
    "gts":      str(GTS),
    "gtsd":     "https://data.stratigraphy.org/data/gts/",
    "strat":    str(STRAT),
    "schema":   "https://schema.org/",
    "vis":      str(VIS),
}


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
        PREFIX gtsd: <https://data.stratigraphy.org/data/gts/>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX time: <http://www.w3.org/2006/time#>
        PREFIX vis: <https://data.stratigraphy.org/data/vis/>
        
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
                        time:hasBeginning/gtsd:inMYA ?hasBeginning ;
                        time:hasEnd/gtsd:inMYA ?hasEnd ;
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


def make_vocpub_version(g):
    print()
    print("Making VocPub version")

    for p, o in g.predicate_objects(VIS.ChartTitle):
        g.add((CS, SKOS.prefLabel, o))
        g.remove((VIS.ChartTitle, p, o))

    g.remove((CS, SKOS.definition, None))
    for p, o in g.predicate_objects(VIS.mainBlurb):
        g.add((CS, SKOS.definition, o))
        g.remove((VIS.mainBlurb, p, o))

    g.remove((CS, SDO.copyrightNotice, None))
    for p, o in g.predicate_objects(SDO.copyrightNotice):
        g.add((CS, SDO.copyrightNotice, o))

    subjects_to_strip = [
        DCTERMS.bibliographicCitation,
        DCTERMS.contributor,
        DCTERMS.created,
        GTS.Age,
        GTS.Eon,
        GTS.Epoch,
        GTS.Era,
        GTS.Period,
        GSSP.GSSA,
        GSSP.GSSP,
        STRAT.Chronometric,
        STRAT.Early,
        STRAT.Eonothem,
        STRAT.Erathem,
        STRAT.Late,
        STRAT.Lower,
        STRAT.Middle,
        STRAT.Series,
        STRAT.Stage,
        STRAT.Stratigraphic,
        STRAT.System,
        STRAT.Upper,
        VIS.ChartTitle,
        VIS.ColumnHeadings,
        VIS.Download,
        VIS.Language,
        VIS.NumericAge,
        VIS.Scaling,
        VIS.ccgm,
        VIS["equal-columns"],
        VIS["equal-rows"],
        VIS.irregular,
        VIS.linear,
        VIS.logarithmic,
        VIS.mainBlurb,
        VIS.translator,
        VIS.translatorLogo,
        VIS.translatorURL,
        SDO.copyrightNotice,
        SDO.license,
    ]

    for s in subjects_to_strip:
        g.remove((s, None, None))

    for s, o in g.subject_objects(SKOS.prefLabel):
        if o.language == "en":
            pass
        else:
            g.remove((s, SKOS.prefLabel, o))
            g.add((s, SKOS.altLabel, o))

    g.serialize(destination=Path(__file__).parent.parent / "chart.vocpub.ttl", format="longturtle")


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

    print()
    make_vocpub_version(g)
    print("Finished")