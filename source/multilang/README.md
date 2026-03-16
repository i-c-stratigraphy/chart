# Make multilang Chart


## 1. Make the labels

Add a new sheet tomultilang.xlsx named for the new language, e.g. "pl" for Polish.

Fill in all the labels, e.g. using Claude:

> Please add a new sheet to this Excel file called "pl" using the sheet "en" as a template. For the new "pl" sheet, replace all the elements in column "Language" with Polish translations of the elements from the column "English"


## 2. Convert to RDF

Run `excel_to_rdf.py` to produce a new chart-prefLabels containing the new language labels.


### 3. Make the definitions

Add a binding for the new language to `make_definitions.sparql`.

Run this to update the definitions RDF: `kurra sparql chart-nolabels.ttl make_definitions.sparql > chart-definitions.ttl`


### 4. Combine files

run `sh combine.sh`


### 5. Check output

Chect the new `chart.ttl` in the multilang folder. See if it's correct according to the main `chart.ttl` file in the repo root dir


### 6. Replace

If the new `chart.ttl` is correct, replace the old in the root dire with the new in the multilang dir
