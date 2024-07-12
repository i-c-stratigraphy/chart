# This script runs a SPARQL query given on the Command Line against the chart.ttl file.
#
# It prints out the results of the query, line-by-line unless a DESCRIBE or CONSTRUCT query is used when the
# subgraph is serialized and printed in LongTurtle format.
#
# Example use: ~$ python -qf queries/run-query.py queries/get-ages.sparql

import argparse
from pathlib import Path
from rdflib import Graph
from prettytable import PrettyTable


# create a keyvalue class
class keyvalue(argparse.Action):
    # Constructor calling
    def __call__(self, parser, namespace,
                 values, option_string=None):
        setattr(namespace, self.dest, dict())

        for value in values:
            # split it into key and value
            key, value = value.split('=')
            # assign into dictionary
            getattr(namespace, self.dest)[key] = value


parser = argparse.ArgumentParser()

parser.add_argument(
    "-qf",
    "--queryfile",
    help="A file containing a SPARQL query",
    default=None,
)

parser.add_argument(
    "-q",
    "--query",
    help="A SPARQL query in text on the command line",
    default=None,
)

parser.add_argument(
    "input",
    help="The RDF data file to be loaded and queried",
)

parser.add_argument(
    "-v",
    "--vars",
    help="key=value pair variables to be replaced in the query",
    default=None,
)

args = parser.parse_args()

g = Graph().parse(args.input)

if args.query is not None:
    q = args.query
elif args.queryfile is not None:
    q = Path(args.queryfile).read_text()
else:
    raise ValueError("You must supply either a query or a query file")

# replace any kw in query
if args.vars is not None:
    for k, v in [x.split("=") for x in args.vars.split(",")]:
        q = q.replace(k, v)

if q.__contains__("DESCRIBE") or q.__contains__("CONSTRUCT"):
    result = Graph()
    for r in g.query(q):
        result.add(r)
    print(result.serialize(format="longturtle"))
else:
    table = PrettyTable()
    table.align = "l"
    result = g.query(q)
    table.field_names = [str(v) for v in result.vars]
    for r in result:
        table.add_row([str(f) for f in r])
    print(table)

