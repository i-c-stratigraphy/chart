from label_selector import select_label

def test_select_label():
    assert select_label("UpperPennsylvanian", "Chronometric", "eu") == "Goi Pennsylvaniar"
    assert select_label("UpperPennsylvanian", "Stratigraphic", "eu") == "Berandu Pennsylvaniar"

    assert select_label("LowerOrdovician", "Chronometric", "hu") == "alsó/kora ordovícium"
    assert select_label("LowerOrdovician", "Stratigraphic", "hu") == "Korai ordovícium"

    assert select_label("CambrianSeries2", "Chronometric", "hu") == "kambrium sorozat 2"
    assert select_label("CambrianStage10", "Stratigraphic", "hu") == "kambrium emelet 10"

