const tf = require('./transformer');

module.exports = class AutomatTransformer extends tf {
    wrap(res) {
        res = { data: res };
        let result = { chembl: new Set() };
        const ID_WITH_PREFIXES = ["MONDO", "CHEBI", "DOID"];
        const ID_WITHOUT_PREFIXES = ["NCBIGene", "ENSEMBL"];
        for (let id of [...ID_WITHOUT_PREFIXES, ...ID_WITH_PREFIXES]) {
            result[id.toLowerCase()] = new Set();
        }
        for (let rec of res.data) {
            for (let obj of [rec[0], rec.slice(-1)[0]]) {
                let prefix = obj.id.split(':')[0];
                if (ID_WITH_PREFIXES.includes(prefix)) {
                    result[prefix.toLowerCase()].add(obj.id);
                } else if (ID_WITHOUT_PREFIXES.includes(prefix)) {
                    result[prefix.toLowerCase()].add(obj.id.split(':').slice(-1)[0]);
                } else if (prefix == "CHEMBL.COMPOUND") {
                    result["chembl"].add(obj.id.split(':').slice(-1)[0]);
                }
            }
        }
        let new_res = {};
        Object.keys(result).map(item => {
            if (result[item].size > 0) {
                new_res[item] = Array.from(result[item])
            }
        });
        return {
            "associated_with": new_res
        }
    }
}