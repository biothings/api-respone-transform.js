import BaseTransformer from "./transformer";


export default class CTDTransformer extends BaseTransformer {
    wrap(res) {
        res = res.map(item => {
            if (typeof item.PubMedIDs === "string") {
                item.PubMedIDs = item.PubMedIDs.split('|');
            }
            if (typeof item.DiseaseID === "string") {
                item.DiseaseID = item.DiseaseID.split(':').slice(-1)[0];
            }
            return item;
        });
        return { data: res };
    }
}