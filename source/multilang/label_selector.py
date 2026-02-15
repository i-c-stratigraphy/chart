# this script calculates the correct label for Upper/Middle/Lower
from typing import Literal as LiteralType
from rdflib import Graph, URIRef
from kurra.sparql import query

# options
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
AGES = [
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

def select_label(
        age: LiteralType["CambrianSeries2","CambrianStage10","CambrianStage2","CambrianStage3","CambrianStage4","LowerCretaceous","LowerDevonian","LowerJurassic","LowerMississippian","LowerOrdovician","LowerPennsylvanian","LowerTriassic","MiddleDevonian","MiddleJurassic","MiddleMississippian","MiddleOrdovician","MiddlePennsylvanian","MiddleTriassic","UpperCretaceous","UpperDevonian","UpperJurassic","UpperMississippian","UpperOrdovician","UpperPennsylvanian","UpperPleistocene","UpperTriassic"],
        chart_type: LiteralType["Chronometric", "Stratigraphic"],
        language: LiteralType["az","ca","cs","de","en","es","es-419","eu","fi","fr","hu","id","it","ja","ko","lt","nl","nl-be","no","pt","pt-br","ru","sk","tr","zh"],
) -> str:
    g = Graph().parse("prefLabels.ttl")

    ages_stages = ["Upper", "Middle", "Lower", "Early", "Late"]

    for p in ages_stages:
        if p in age:
            if chart_type == "Chronometric":
                if "Upper" in age:
                    uml = "Upper"
                elif "Middle" in age:
                    uml = "Middle"
                else:  # Lower
                    uml = "Lower"
            else:  # Stratigraphic
                if "Upper" in age:
                    uml = "Late"
                elif "Middle" in age:
                    uml = "Middle"
                else:  # Lower
                    uml = "Early"

            q = """
                SELECT ?lbl
                WHERE {
                    <http://resource.geosciml.org/ontology/stratigraphy/{UML}>
                        skos:prefLabel ?lbl ;
                    .
        
                    FILTER (LANG(?lbl) = "{LANG}")
                }
                """.replace("{UML}", uml).replace("{LANG}", language)

            v = query(g, q, return_format="python", return_bindings_only=True)
            uml_lbl = v[0].get("lbl")

            particular_ages = [
                "Cretaceous",
                "Devonian",
                "Jurassic",
                "Mississippian",
                "Ordovician",
                "Pennsylvanian",
                "Pleistocene",
                "Triassic",
            ]

            for p in particular_ages:
                if p in age:
                    q = """
                        SELECT ?lbl
                        WHERE {
                            <http://resource.geosciml.org/classifier/ics/ischart/{AGE}>
                                skos:prefLabel ?lbl ;
                            .
                                
                            FILTER (LANG(?lbl) = "{LANG}")
                        }
                        """.replace("{AGE}", p).replace("{LANG}", language)

                    v = query(g, q, return_format="python", return_bindings_only=True)
                    p_lbl = v[0].get("lbl")

                    return uml_lbl + " " + p_lbl

    if "Cambrian" in age:
        q = """
            SELECT ?lbl
            WHERE {
                <http://resource.geosciml.org/classifier/ics/ischart/Cambrian>
                    skos:prefLabel ?lbl ;
                .

                FILTER (LANG(?lbl) = "{LANG}")
            }
            """.replace("{LANG}", language)

        v = query(g, q, return_format="python", return_bindings_only=True)
        cam_lbl = v[0].get("lbl")

        if "Series" in age:
            rank = "Series"
        else:
            rank = "Stage"

        q = """
            SELECT ?lbl
            WHERE {
                <http://resource.geosciml.org/ontology/stratigraphy/{RANK}>
                    skos:prefLabel ?lbl ;
                .

                FILTER (LANG(?lbl) = "{LANG}")
            }
            """.replace("{RANK}", rank).replace("{LANG}", language)
        v = query(g, q, return_format="python", return_bindings_only=True)
        rank_lbl = v[0].get("lbl")

        nums = [
            "2",
            "3",
            "4",
            "10",
        ]

        num = None
        print(age)
        for n in nums:
            if n in age:
                num = n

        return cam_lbl + " " + rank_lbl + " " + num
