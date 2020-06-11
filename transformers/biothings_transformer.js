const tf = require('./transformer');

module.exports = class BioThingsTransformer extends tf {
    pairInputWithAPIResponse = () => {
        let res = {};
        this.data.response.map(item => {
            // for input not found, BioThings API returns an entry with a key "notfound" equal to true
            if (!('notfound' in item)) {
                if (item.query in res) {
                    res[item.query].push(item);
                } else {
                    res[item.query] = [item]
                }
            }
        });
        return res;
    }
}