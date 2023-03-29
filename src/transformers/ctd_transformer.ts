import BaseTransformer from "./transformer";



export default class CTDTransformer extends BaseTransformer {
    wrap(res) {
        res = res.map(item => {
            if (typeof item.PubMedIDs === "string") {
                item.PubMedIDs = item.PubMedIDs.split('|');
            }
            return item;
        });
        return { data: res };
    }
}