kurra file reformat -o chart-definitions.nt -f nt chart-definitions.ttl
kurra file reformat -o chart-nolabels.nt -f nt chart-nolabels.ttl
kurra file reformat -o chart-prefLabels.nt -f nt chart-prefLabels.ttl
cat chart-definitions.ttl chart-nolabels.ttl chart-prefLabels.ttl > chart.nt
kurra file reformat -o chart.ttl chart.nt
rm *.nt