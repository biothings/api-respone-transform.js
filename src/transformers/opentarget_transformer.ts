import BaseTransformer from "./transformer";


export default class OpenTargetTransformer extends BaseTransformer {
    wrap(res) {
        res.data = res.data.map(item => {
            if ('drug' in item && "id" in item.drug && typeof item.drug.id === "string" && item.drug.id.includes("CHEMBL")) {
                item.drug.id = item.drug.id.split('/').slice(-1)[0];
            }
            return item;
        });
        return res;
    }
}