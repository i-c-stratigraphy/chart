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

def get_sub_info(node,root):
    if 'broader' in node:
        broader = node['broader']
    else:
        broader = None
    if 'narrower' in node:
        for n in node['narrower']:
            root[n["id"]] = get_sub_info(n, root)
        return {
                'narrower': [n["id"] for n in node['narrower']],
                'broader': broader
            }
    else:
        return {
                'narrower': None, 
                'broader': broader 
            }
    
def get_hierachy(framed):
    root = {}
    topConcepts = [tl for tl in framed["hasTopConcept"] ]
    for tc in topConcepts:
        root[tc["id"]] = get_sub_info(tc, root)
    return root


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

        #print(x, coll.bindings[0]["indirectChildren"], coll.bindings[0]["directChildren"])
        res = coll.bindings[0]
        bnode = BNode()
        g.add((x,URIRef('https://example.com/counts'), bnode))
        g.add((bnode,URIRef('https://example.com/indirectNarrowers'), res["indirectChildren"]))
        g.add((bnode,URIRef('https://example.com/directNarrowers'), res["directChildren"]))

    doc = json.loads(g.serialize(format='json-ld'))
    framed = jsonld.frame(doc, frame)
    
    with open('./out/chart.hierachy.json', 'w',encoding = 'utf8') as out:
        out.write(json.dumps(get_hierachy(framed),ensure_ascii=False,indent=4).encode('utf8').decode())

    with open('./out/chart.1.json', 'w',encoding = 'utf8') as out:
        out.write(json.dumps(split_chart(framed["hasTopConcept"][0],['ischart:Cretaceous','ischart:Paleogene','ischart:Neogene','ischart:Quaternary']),ensure_ascii=False,indent=4).encode('utf8').decode())

    with open('./out/chart.2.json', 'w',encoding = 'utf8') as out:
        out.write(json.dumps(split_chart(framed["hasTopConcept"][0],['ischart:Jurassic','ischart:Triassic','ischart:Permian','ischart:Carboniferous']),ensure_ascii=False,indent=4).encode('utf8').decode())

    with open('./out/chart.3.json', 'w',encoding = 'utf8') as out:
        out.write(json.dumps(split_chart(framed["hasTopConcept"][0],['ischart:Devonian','ischart:Silurian','ischart:Ordovician','ischart:Cambrian']),ensure_ascii=False,indent=4).encode('utf8').decode())

    with open('./out/chart.4.json', 'w',encoding = 'utf8') as out:
        out.write(json.dumps(framed["hasTopConcept"][1],ensure_ascii=False,indent=4).encode('utf8').decode())

    with open('./out/chart.json', 'w',encoding = 'utf8') as out:
        out.write(json.dumps(framed,ensure_ascii=False,indent=4).encode('utf8').decode())

if __name__ == "__main__":
    main()