const tf = require('./transformer');
const utils = require('../utils');

module.exports = class BioThingsTransformer extends tf {
    pairInputWithAPIResponse() {
        if (this.edge.query_operation.method === "post") {
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
        } else {
            let _input = utils.generateCurie(this.edge.association.input_id, this.edge.input);
            return { [_input]: [this.data["response"]] }
        }

    }
}