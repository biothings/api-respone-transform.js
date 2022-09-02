import BaseTransformer from "./transformer";
import jq from "node-jq";

export default class OpenTargetTransformer extends BaseTransformer {
    async wrap(res) {
//         res.data = res.data.map(item => {
//             if ('drug' in item && "id" in item.drug && typeof item.drug.id === "string" && item.drug.id.includes("CHEMBL")) {
//                 item.drug.id = item.drug.id.split('/').slice(-1)[0];
//             }
//             return item;
//         });
//         return res;
        const filterString = '(.data | .[] | select(.drug.id != null) | select(.drug.id | contains("CHEMBL")) | .drug.id) |= (split("/") | last)';
        return await jq.run(filterString, res);
    }
}