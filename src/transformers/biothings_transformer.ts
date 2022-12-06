import BaseTransformer from "./transformer";
import { generateCurie } from '../utils';

export default class BioThingsTransformer extends BaseTransformer {
    // IN JQ:
    // if $edge.query_operation.method == "post" then
    //   # if response is not an array, then use response.hits
    //   if (.response | type) == "array" then .response else .response.hits end |
    //   reduce .[] as $item ({};
    //     # if the item is notfound, then proceed to next item & keep current object
    //     if ($item | keys | contains(["notfound"])) then
    //       .
    //     else
    //       generateCurie($edge.association.input_id; $item.query) as $curie | .[$curie] = .[$curie] + [$item]
    //     end
    //   )
    // else
    //   if ($edge.input | type) == "object" then
    //     .response as $res | generateCurie($edge.association.input_id; $edge.input.queryInputs) as $curie | {} | .[$curie] = $res
    //   else
    //     .response as $res | generateCurie($edge.association.input_id; $edge.input) as $curie | {} | .[$curie] = $res
    //   end
    // end

    async pairCurieWithAPIResponse() {
        if (this.edge.query_operation.method === "post") {
            let res = {};
            const mapper = item => {
                // for input not found, BioThings API returns an entry with a key "notfound" equal to true
                if (!('notfound' in item)) {
                    let input = generateCurie(this.edge.association.input_id, item.query);
                    if (input in res) {
                        res[input].push(item);
                    } else {
                        res[input] = [item]
                    }
                }
            }

            if (this.data.response.hasOwnProperty("hits")) {
                // @ts-ignore
                this.data.response.hits.map(mapper);
            } else {
                // @ts-ignore
                this.data.response.map(mapper);
            }
            return res;
        } else {
            return super.pairCurieWithAPIResponse();
        }

    }
}
