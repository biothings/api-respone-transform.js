const tf = require('./transformer');

module.exports = class CTDTransformer extends tf {
    wrap(res) {
        res = res.map(item => {
            if (item.PubMedIDs) {
                item.PubMedIDs = item.PubMedIDs.split('|');
            }
            if (item.DiseaseID) {
                item.DiseaseID = item.DiseaseID.split(':').slice(-1)[0];
            }
            return item;
        });
        return { data: res };
    }
}