kurra file reformat -f nt -o chart-multilang.nt chart-multilang.ttl
kurra file reformat -f nt -o chart-nolabels.nt chart-nolabels.ttl
cat chart-multilang.nt chart-nolabels.nt > chart-combined.nt
kurra file reformat -f nt -o chart-combined.ttl chart-combined.nt
rm *.nt
