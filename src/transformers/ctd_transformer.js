const tf = require('./transformer');

module.exports = class CTDTransformer extends tf {
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