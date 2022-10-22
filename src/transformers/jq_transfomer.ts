import BaseTransformer from "./transformer";

const jq = require('node-jq');

const functions = `
# add JQ functions to be used globally here
`

const filterStrings = {
  ebi: `
  # only take comments where dbReferences type is Rhea
  (select(.comments != null) | .comments | .[] | select(.reaction != null) | .reaction.dbReferences | .[]) |= select(.type == "Rhea")
  `,
  ctd: `
  # Split pubMedIDs by |
  ((.[] | select(.PubMedIDs != null) | .PubMedIDs) |= split("|")) | 
  # take last element of disease ids after spliting by :
  ((.[] | select(.DiseaseID != null) | .DiseaseID) |= (split(":") | last)) | {data: .}
  `,
  opentarget: `
  # split drug IDs with CHEMBL by /
  (.data | .[] | select(.drug.id != null) | select(.drug.id | contains("CHEMBL")) | .drug.id) |= (split("/") | last)
  `,
  biolink: `
  .associations = [
      # take associations that aren't null
      select(.associations != null) | .associations | .[] | 
      # split association object ids & take last (only for CHEMBL, REACT, HGNC)
      select(.object.id != null) | (.object.id | split(":") | first) as $pref | .object[$pref] = (if $pref == "HGNC" or $pref == "NCBIGene" or $pref == "REACT" then (.object.id | split(":") | last) else .object.id end) |
      # take publications with PMID & for IDs take last element after splitting by :
      .publications = [foreach (.publications | .[]? | .id) as $pub ([]; []; if ($pub == null or ($pub | startswith("PMID") | not)) then empty else {id: ($pub | split(":") | last)} end)] 
  ]
  `
}

export default class JQTransformer extends BaseTransformer {
  async wrap (res) {
    res = JSON.parse(await jq.run(functions+"\n"+filterStrings[this.config.type], res, { input: 'json' }));
    return res;
  }
}
