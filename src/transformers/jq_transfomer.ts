import BaseTransformer from "./transformer";

const jq = require('node-jq');

const filterStrings = {
  'ebi': '(select(.comments != null) | .comments | .[] | select(.reaction != null) | .reaction.dbReferences | .[]) |= select(.type == "Rhea")', //only take comments where dbReferences type is Rhea
  'ctd': '((.[] | select(.PubMedIDs != null) | .PubMedIDs) |= split("|")) | ((.[] | select(.DiseaseID != null) | .DiseaseID) |= (split(":") | last)) | {data: .}', //Split pubMedIDs by |, take last element of disease ids after spliting by :
  'opentarget': '(.data | .[] | select(.drug.id != null) | select(.drug.id | contains("CHEMBL")) | .drug.id) |= (split("/") | last)', // split drug IDs with CHEMBL by /
  // biolink: two steps - 1. split association object ids & take last (only for CHEMBL, REACT, HGNC), 2. take publications with PMID & for IDs take last element after splitting by :
  'biolink': '[del(.associations), {associations: [select(.associations != null) | .associations | .[] | select(.object.id != null) | (.object.id | split(":") | first) as $pref | .object[$pref] = (if $pref == "HGNC" or $pref == "NCBIGene" or $pref == "REACT" then (.object.id | split(":") | last) else .object.id end) | .publications = [foreach (.publications | .[]? | .id) as $pub ([]; []; if ($pub == null or ($pub | startswith("PMID") | not)) then empty else {id: ($pub | split(":") | last)} end)] ]}] | add'
}

export default class JQTransformer extends BaseTransformer {
  async wrap (res) {
    res = JSON.parse(await jq.run(filterStrings[this.config.type], res, { input: 'json' }));
    return res;
  }
}
