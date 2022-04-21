/**
 * @jest-environment node
 */

const ctd_tf = require("../built/transformers/ctd_transformer");
const opentarget_tf = require("../built/transformers/opentarget_transformer");
const biothings_tf = require("../built/transformers/biothings_transformer");
const base_tf = require("../built/transformers/transformer");
const axios = require("axios");

// not ingesting opentargets right now; no need for this test; this api is no longer there
// describe("test opentarget transformer", () => {

//     let api_response;

//     beforeAll(async () => {
//         let res = await axios.get("https://platform-api.opentargets.io/v3/platform/public/evidence/filter?target=ENSG00000088832&size=100&fields=drug&datasource=chembl");
//         api_response = res.data;
//     });

//     test("test opentarget wrapper", () => {
//         let input = {
//             response: api_response,
//             edge: {
//                 input: "238",
//                 association: {
//                     output_type: "Gene"
//                 },
//                 response_mapping: {
//                     sookie: "kevin"
//                 }
//             }
//         }
//         let tf = new opentarget_tf.default(input);
//         let res = tf.wrap(api_response);
//         expect(res.data[0]['drug']['id']).toBe("CHEMBL1200686");
//         expect(res.data[0]['drug']['molecule_name']).toContain("PIMECROLIMUS");
//     })
// })


describe("test ctd transformer", () => {

    let api_response;

    beforeAll(async () => {
        let res = await axios.get("http://ctdbase.org/tools/batchQuery.go?inputType=chem&inputTerms=D003634|mercury&report=diseases_curated&format=json");
        api_response = res.data;
    });

    test("test ctd wrapper", () => {
        let input = {
            response: api_response,
            edge: {
                input: "238",
                association: {
                    output_type: "Gene"
                },
                response_mapping: {
                    sookie: "kevin"
                }
            }
        }
        let tf = new ctd_tf.default(input);
        let res = tf.wrap(api_response);
        expect(res.data[0]['DiseaseID']).toBe("D000022");
        expect(res.data[0]['PubMedIDs']).toContain("16120699");
    })
})


describe("test biothings transformer", () => {

    let api_response;
    let input;

    beforeAll(async () => {
        let res = await axios({
            method: 'post',
            url: 'https://biothings.ncats.io/semmedgene/query',
            data: 'q=C1332823, C1332824, 123&scopes=umls',
            params: {
                fields: 'name,umls,positively_regulates',
                size: '5'
            }
        })
        api_response = res.data;
        input = {
            response: api_response,
            edge: {
                "input": ["C1332824", "C1332823", "123"],
                "query_operation": {
                    "params": {
                        "fields": "positively_regulates"
                    },
                    "request_body": {
                        "body": {
                            "q": "{inputs[0]}",
                            "scopes": "umls"
                        }
                    },
                    "path": "/query",
                    "path_params": [],
                    "method": "post",
                    "server": "https://biothings.ncats.io/semmedgene",
                    "tags": [
                        "disease",
                        "annotation",
                        "query",
                        "translator",
                        "biothings",
                        "semmed"
                    ],
                    "supportBatch": true,
                    "inputSeparator": ","
                },
                "association": {
                    "input_id": "UMLS",
                    "input_type": "Gene",
                    "output_id": "UMLS",
                    "output_type": "Gene",
                    "predicate": "positively_regulates",
                    "source": "SEMMED",
                    "api_name": "SEMMED Gene API",
                    "smartapi": {
                        "id": "81955d376a10505c1c69cd06dbda3047",
                        "meta": {
                            "ETag": "f94053bc78b3c2f0b97f7afd52d7de2fe083b655e56a53090ad73e12be83673b",
                            "github_username": "kevinxin90",
                            "timestamp": "2020-05-27T16:53:40.804575",
                            "uptime_status": "good",
                            "uptime_ts": "2020-06-12T00:04:31.404599",
                            "url": "https://raw.githubusercontent.com/NCATS-Tangerine/translator-api-registry/master/semmed/semmed_gene.yaml"
                        }
                    }
                },
                "response_mapping": {
                    "positively_regulates": {
                        "pmid": "positively_regulates.pmid",
                        "umls": "positively_regulates.umls"
                    }
                },
                "id": "01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b"
            }
        }
    });

    test("test biothings pairCurieWithAPIResponse", () => {
        let tf = new biothings_tf.default(input);
        let res = tf.pairCurieWithAPIResponse();
        expect(res["UMLS:C1332823"][0]['umls']).toBe("C1332823");
        expect(res).toHaveProperty('UMLS:C1332823');
        expect(res["123"]).toBeUndefined();
    });

    test("test wrapper", () => {
        let tf = new biothings_tf.default(input);
        let res = tf.wrap(input.response[0]);
        expect(res).toHaveProperty("query");
    });

})
