/**
 * @jest-environment node
 */

const biolink_tf = require("../transformers/biolink_transformer");
const axios = require("axios");

describe("test biolink transformer", () => {

    let api_response;
    let input;

    beforeEach(async () => {
        let res = await axios.get("https://api.monarchinitiative.org/api/bioentity/disease/DOID%3A678/genes?rows=100&facet=false&unselect_evidence=false&exclude_automatic_assertions=false&fetch_objects=false&use_compact_associations=false&direct=false&direct_taxon=false&association_type=both");
        api_response = res.data;
        input = {
            response: api_response,
            edge: {
                "input": "DOID:678",
                "query_operation": {
                    "params": {
                        "disease_id": "{inputs[0]}",
                        "rows": 200
                    },
                    "path": "/bioentity/disease/{disease_id}/genes",
                    "path_params": [
                        "disease_id"
                    ],
                    "method": "get",
                    "server": "https://api.monarchinitiative.org/api",
                    "tags": [
                        "anatomy",
                        "disease",
                        "gene",
                        "phenotype",
                        "pathway",
                        "annotation",
                        "query",
                        "translator",
                        "biolink"
                    ],
                    "supportBatch": false
                },
                "association": {
                    "input_id": "MONDO",
                    "input_type": "Disease",
                    "output_id": "HGNC",
                    "output_type": "Gene",
                    "predicate": "related_to",
                    "api_name": "BioLink API",
                    "smartapi": {
                        "id": "d22b657426375a5295e7da8a303b9893",
                        "meta": {
                            "ETag": "62f25b12c5457f6924db7929d91e7d5a2e70de291e7672aebf06fa08d1526d9d",
                            "github_username": "newgene",
                            "timestamp": "2020-05-28T00:02:40.483712",
                            "uptime_status": "good",
                            "uptime_ts": "2020-06-11T00:05:38.030503",
                            "url": "https://raw.githubusercontent.com/NCATS-Tangerine/translator-api-registry/master/biolink/openapi.yml"
                        }
                    }
                },
                "response_mapping": {
                    "related_to": {
                        "HGNC": "associations.object.HGNC",
                        "pubmed": "associations.publications.id",
                        "relation": "associations.relation.label",
                        "source": "associations.provided_by",
                        "taxid": "associations.object.taxon.id"
                    }
                },
                "id": "01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b"
            }
        }
    });

    test("test biolink wrapper", () => {
        let tf = new biolink_tf(input);
        let res = tf.wrap(api_response);
        expect(res.associations[0]['object']['HGNC']).toBe("10956")
    })

    test("test biolink transformer", () => {
        let tf = new biolink_tf(input);
        let res = tf.transform();
        console.log(res[0]);
        let res_6119 = res.filter(item => item.HGNC[0] === '6119');
        expect(res_6119[0].publications).toContain('PMID:21685912');
    })
})