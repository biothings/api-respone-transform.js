import BaseTransformer from "./transformer";
import { generateFilterString } from "../jq_utils";

const jq = require('node-jq');

const filterStringsWrap = {
  ebi: `
  # only take comments where dbReferences type is Rhea
  .comments = [
    select(.comments != null) | .comments | .[] | select(.reaction != null) | .reaction.dbReferences = [.reaction.dbReferences | .[] | select(.type == "Rhea")]
  ]
  `,
  ctd: `
  # Split pubMedIDs by |
  ((.[] | select(.PubMedIDs != null) | .PubMedIDs) |= split("|")) | 
  ((.[] | select(.PubMedIds != null) | .PubMedIds) |= split("|")) | 
  # Split Direct Evidence by |
  ((.[] | select(.DirectEvidence != null) | .DirectEvidence) |= split("|")) | 
  {data: .}
  `,
  opentarget: `
  # split drug IDs with CHEMBL by /
  (.data | .[] | select(.drug.id != null) | select(.drug.id | contains("CHEMBL")) | .drug.id) |= (split("/") | last)
  `,
  biolink: `
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
  `
}

const filterStringsPair = {
  biothings: `
  if $edge.query_operation.method == "post" then
    # if response is not an array, then use response.hits
    if (.response | type) == "array" then .response else .response.hits end |
    reduce .[] as $item ({};
      # if the item is notfound, then proceed to next item & keep current object
      if ($item | keys | contains(["notfound"])) then
        .
      else
        if $edge.input | type == "object" and $edge.input.queryInputs | type == "object" then
          generateCurieWithInputs($edge.association.input_id; $item.query; $edge.input.queryInputs) as $curie | .[$curie] = .[$curie] + [$item]
        else
          generateCurie($edge.association.input_id; $item.query) as $curie | .[$curie] = .[$curie] + [$item]
        end
      end
    )
  else
    if ($edge.input | type) == "object" then
      .response as $res | generateCurie($edge.association.input_id; $edge.input.queryInputs) as $curie | {} | .[$curie] = [$res]
    else
      .response as $res | generateCurie($edge.association.input_id; $edge.input) as $curie | {} | .[$curie] = [$res]
    end
  end
  `,
  ctd: `reduce (.response | .[]) as $item ({}; .[generateCurie($edge.association.input_id; $item.Input | ascii_upcase)] = [] + .[generateCurie($edge.association.input_id; $item.Input | ascii_upcase)] + [$item]) | map_values([.])`
}

export default class JQTransformer extends BaseTransformer {
  async wrap (res) {
    if (this.config.wrap) res = JSON.parse(await jq.run(generateFilterString(this.config.wrap, this.edge), res, { input: 'json' }));
    else if (filterStringsWrap[this.config.type]) res = JSON.parse(await jq.run(generateFilterString(filterStringsWrap[this.config.type], this.edge), res, { input: 'json' }));
    else res = super.wrap(res);

    return res;
  }

  async pairCurieWithAPIResponse () {
    if (this.config.pair) return JSON.parse(await jq.run(generateFilterString(this.config.pair, this.edge), this.data, { input: 'json' }));
    else if (filterStringsPair[this.config.type]) return JSON.parse(await jq.run(generateFilterString(filterStringsPair[this.config.type], this.edge), this.data, { input: 'json' }));

    return super.pairCurieWithAPIResponse();
  }
}
