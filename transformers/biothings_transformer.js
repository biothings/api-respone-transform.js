const tf = require('./transformer');
const utils = require('../utils');

module.exports = class BioThingsTransformer extends tf {
    pairInputWithAPIResponse() {
        let res = {};
        this.data.response.map(item => {
            // for input not found, BioThings API returns an entry with a key "notfound" equal to true
            if (!('notfound' in item)) {
                let input = utils.generateCurie(this.edge.association.input_id, item.query);
                if (input in res) {
                    res[input].push(item);
                } else {
                    res[input] = [item]
                }
            }
        });
        return res;
    }
}