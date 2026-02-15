from rdflib import Graph, URIRef
from kurra.sparql import query

CHART_TYPES = [
    "Chronometric",
    "Stratigraphic",
]

LANGUAGES = [
    "az" ,
    "ca" ,
    "cs" ,
    "de" ,
    "en" ,
    "es" ,
    "es-419" ,
    "eu" ,
    "fi" ,
    "fr" ,
    "hu" ,
    "id" ,
    "it" ,
    "ja" ,
    "ko" ,
    "lt" ,
    "nl" ,
    "nl-be" ,
    "no" ,
    "pt" ,
    "pt-br" ,
    "ru" ,
    "sk" ,
    "tr" ,
    "zh" ,
]

g = Graph().parse("labels-multilang.ttl")

iris = [
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/CambrianSeries2") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/CambrianStage10") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/CambrianStage2") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/CambrianStage3") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/CambrianStage4") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/LowerCretaceous") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/LowerDevonian") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/LowerJurassic") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/LowerMississippian") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/LowerOrdovician") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/LowerPennsylvanian") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/LowerTriassic") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/MiddleDevonian") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/MiddleJurassic") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/MiddleMississippian") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/MiddleOrdovician") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/MiddlePennsylvanian") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/MiddleTriassic") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/UpperCretaceous") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/UpperDevonian") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/UpperJurassic") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/UpperMississippian") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/UpperOrdovician") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/UpperPennsylvanian") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/UpperPleistocene") ,
    URIRef("http://resource.geosciml.org/classifier/ics/ischart/UpperTriassic") ,
]

CHART_TYPE = "Chronometric"
LANGUAGE = "es-a"
age = URIRef("http://resource.geosciml.org/classifier/ics/ischart/LowerMississippian")


if CHART_TYPES == "Chronometric":
    if str(age).startswith("Upper"):
        pass
    elif str(age).startswith("Middle"):
        pass
    else:
        pass

    q = """
        SELECT ?lbl
        WHERE {
            <http://resource.geosciml.org/ontology/stratigraphy/Upper>
                skos:prefLabel ?lbl ;
            .

            FILTER (LANG(?lbl) = "{LANG}")
        """.replace("{LANG}", LANGUAGE)

else:
    if str(age).startswith("Upper"):
        pass
    elif str(age).startswith("Upper"):
        pass
    else:
        pass

