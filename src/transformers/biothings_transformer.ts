import BaseTransformer from "./transformer";
import { generateCurie } from '../utils';

export default class BioThingsTransformer extends BaseTransformer {
    pairCurieWithAPIResponse() {
        if (this.edge.query_operation.method === "post") {
            let res = {};
            this.data.response.map(item => {
                // for input not found, BioThings API returns an entry with a key "notfound" equal to true
                if (!('notfound' in item)) {
                    let input = generateCurie(this.edge.association.input_id, item.query);
                    if (input in res) {
                        res[input].push(item);
                    } else {
                        res[input] = [item]
                    }
                }
            });
            return res;
        } else {
            let _input = generateCurie(this.edge.association.input_id, this.edge.input);
            return { [_input]: [this.data["response"]] }
        }

    }
}
