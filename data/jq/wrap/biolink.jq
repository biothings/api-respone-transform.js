.associations = (
  [
    (
      # take associations that aren't null
      select(.associations != null) | .associations | .[] | 
      # split association object ids & take last (only for CHEMBL, REACT, HGNC)
      select(.object.id != null) | (.object.id | split(":") | first) as $pref | .object[$pref] = (if $pref == "HGNC" or $pref == "NCBIGene" or $pref == "REACT" then (.object.id | split(":") | last) else .object.id end) |
      # take publications with PMID & for IDs take last element after splitting by :
      .publications = [foreach (.publications | .[]? | .id) as $pub ([]; []; if ($pub == null or ($pub | startswith("PMID") | not)) then empty else {id: ($pub | split(":") | last)} end)]
    )
    # delete publications if empty array
    | delifempty(.publications)
  ] +
  # include associations with null object ids
  [select(.associations != null) | .associations | .[] | select(.object.id == null)]
)
# delete association if empty array
| delifempty(.associations)
