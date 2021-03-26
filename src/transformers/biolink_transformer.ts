import BaseTransformer from "./transformer";

export default class BiolinkTransformer extends BaseTransformer {
    wrap(res) {
        //super.wrap();
        const PREFIXES = ['HGNC', 'NCBIGene', 'REACT'];
        if ("associations" in res) {
            for (let rec of res.associations) {
                if (rec.object && 'id' in rec.object) {
                    let prefix, value;
                    [prefix, value] = rec.object.id.split(":");
                    if (PREFIXES.includes(prefix)) {
                        rec['object'][prefix] = value;
                    } else {
                        rec['object'][prefix] = rec.object.id;
                    }
                }
                if (rec.publications === undefined || rec.publications.length === 0 || !(rec.publications[0]['id'].startsWith("PMID"))) {
                    delete rec.publications
                } else {
                    rec.publications = rec.publications.map(pub => {
                        return { "id": pub.id.split(':').slice(-1)[0] }
                    })
                }
                if (!("provided_by" in rec)) {
                    delete rec.provided_by
                }
            }
        };
        return res;
    }
}