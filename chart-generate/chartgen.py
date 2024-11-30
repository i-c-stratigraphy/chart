from copy import deepcopy
from rdflib import BNode, Graph, URIRef
from rdflib.namespace import RDF, SKOS
from pyld import jsonld
import json

def split_chart(root: dict, inc: list[str]):
    local = deepcopy(root)
    for n1 in local["narrower"]:
        n1['narrower'] = [n2 for n2 in n1['narrower'] if n2["id"] in inc]
    local["narrower"] = [n1 for n1 in local["narrower"] if len(n1["narrower"])>0]
    return local

def get_sub_info(node,root,  g: Graph):
    broader = None
    if  'broader' in node:
        print(str(node["broader"][0]))
        res1 = g.query(f'''
            PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
            PREFIX ischart: <http://resource.geosciml.org/classifier/ics/ischart/>
            SELECT ?iri ?prefLabel ?altLabel 
                WHERE {{
                    BIND ({str(node["broader"][0])} AS ?iri)
                    ?iri skos:prefLabel ?prefLabel .
                    OPTIONAL{{
                        ?iri skos:altLabel ?altLabel .
                    }}   
                }}
        ''')
        print(res1.bindings)
        results1 = res1.bindings
        print(len(results1))
        broader = {
            "id": node["broader"][0],
            "prefLabel": {"value": results1[0]["prefLabel"], "language":results1[0]["prefLabel"].language},
            "altLabel": [ { "language": x['altLabel'].language, "value": x['altLabel'], } for x in results1 if 'altLabel' in x]
        }

    # broader = node["broader"] if 'broader' in node else None
    if 'narrower' in node:
        for n in node['narrower']:
            root[n["id"]] = get_sub_info(n, root, g)
        return {
                'narrower': [{"id":n["id"] ,  "prefLabel":n["prefLabel"], "altLabel":n["altLabel"] if "altLabel" in n else None }for n in node['narrower']],
                'broader': broader
            }
    else:
        return {
                'narrower': None, 
                'broader': broader 
            }
    
def get_hierachy(framed, g):
    root = {}
    topConcepts = [tl for tl in framed["hasTopConcept"] ]
    for tc in topConcepts:
        root[tc["id"]] = get_sub_info(tc, root, g)
    return root

def get_meta(framed):
    meta = deepcopy(framed)
    del meta["hasTopConcept"]
    del meta["@context"]
    return meta

def main():
    data=""
    frameRaw = ""

    with open('../chart.ttl', 'r') as chart:
        data = chart.read()
    with open('./frame.json', 'r') as f:
        frameRaw = f.read()

    g = Graph()
    frame = json.loads(frameRaw)
    g.parse(data=data)

    for x in g.subjects(RDF.type,SKOS.Concept):   
        coll=g.query(f'''
            PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
            SELECT ?concept ?directChildren ?indirectChildren
            WHERE {{
                {{
                    SELECT  ?concept (COUNT(?narrowers) AS ?directChildren)
                    WHERE {{
                        BIND (<{str(x)}> AS ?concept)
                        ?concept a skos:Concept .
                        OPTIONAL {{
                            ?concept skos:narrower ?narrowers .
                        }}                   
                    }}  
                }}  
                {{
                    SELECT ?concept (COUNT(?children) AS ?indirectChildren) 
                    WHERE {{
                        BIND (<{str(x)}> AS ?concept)
                        ?concept a skos:Concept .
                        OPTIONAL {{
                            ?concept skos:narrower+ ?children  .
                        }}                   
                    }}  
                }}
            }}
        ''')

        res = coll.bindings[0]
        bnode = BNode()
        g.add((x,URIRef('https://example.com/counts'), bnode))
        g.add((bnode,URIRef('https://example.com/indirectNarrowers'), res["indirectChildren"]))
        g.add((bnode,URIRef('https://example.com/directNarrowers'), res["directChildren"]))

    doc = json.loads(g.serialize(format='json-ld'))
    framed = jsonld.frame(doc, frame)
    
    with open('./out/chart.hierachy.json', 'w',encoding = 'utf8') as out:
        out.write(json.dumps(get_hierachy(framed, g),ensure_ascii=False,indent=4).encode('utf8').decode())

    with open('./out/chart.1.json', 'w',encoding = 'utf8') as out:
        out.write(json.dumps(split_chart(framed["hasTopConcept"][0],['ischart:Cretaceous','ischart:Paleogene','ischart:Neogene','ischart:Quaternary']),ensure_ascii=False,indent=4).encode('utf8').decode())

    with open('./out/chart.2.json', 'w',encoding = 'utf8') as out:
        out.write(json.dumps(split_chart(framed["hasTopConcept"][0],['ischart:Jurassic','ischart:Triassic','ischart:Permian','ischart:Carboniferous']),ensure_ascii=False,indent=4).encode('utf8').decode())

    with open('./out/chart.3.json', 'w',encoding = 'utf8') as out:
        out.write(json.dumps(split_chart(framed["hasTopConcept"][0],['ischart:Devonian','ischart:Silurian','ischart:Ordovician','ischart:Cambrian']),ensure_ascii=False,indent=4).encode('utf8').decode())

    with open('./out/chart.4.json', 'w',encoding = 'utf8') as out:
        out.write(json.dumps(framed["hasTopConcept"][1],ensure_ascii=False,indent=4).encode('utf8').decode())

    with open('./out/chart.meta.json', 'w',encoding = 'utf8') as out:
        out.write(json.dumps(get_meta(framed),ensure_ascii=False,indent=4).encode('utf8').decode())

    with open('./out/chart.json', 'w',encoding = 'utf8') as out:
        out.write(json.dumps(framed,ensure_ascii=False,indent=4).encode('utf8').decode())

if __name__ == "__main__":
    main()