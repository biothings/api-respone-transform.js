const tf = require('./transformer');

module.exports = class OpenTargetTransformer extends tf {
    wrap(res) {
        res.data = res.data.map(item => {
            if ('drug' in item && item.drug.id.includes("CHEMBL")) {
                item.drug.id = item.drug.id.split('/').slice(-1)[0];
            }
            return item;
        });
        return res;
    }
}