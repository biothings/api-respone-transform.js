const semmed_tf = require("../built/transformers/semmed_transformer");
const axios = require("axios");

describe("test semmed transformer", () => {

    let api_response, input;

    beforeEach(async () => {
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

    test("test semmed pairCurieWithAPIResponse", () => {
        let tf = new semmed_tf.default(input);
        let res = tf.pairCurieWithAPIResponse();
        expect(res["UMLS:C1332823"][0]['umls']).toBe("C1332823");
        expect(res).toHaveProperty('UMLS:C1332823');
        expect(res["UMLS:123"]).toBeUndefined();
    });

    test("test wrapper", () => {
        let tf = new semmed_tf.default(input);
        let res = tf.wrap(input.response[0]);
        expect(res).toHaveProperty("positively_regulates");
    });

    test("test json transform", () => {
        let tf = new semmed_tf.default(input);
        let res = tf.jsonTransform(input.response[0]);
        expect(res).toEqual(input.response[0]);
    });

    test("add edge info", async () => {
        let tf = new semmed_tf.default(input);
        let res = tf.pairCurieWithAPIResponse();
        let rec = res["UMLS:C1332823"][0];
        rec = tf.wrap(rec);
        let result = await tf.formatRecords("UMLS:C1332823", rec["positively_regulates"][0]);
        expect(result[0]).toHaveProperty("apiEdge");
        expect(result[0].api).toBe("SEMMED Gene API")
    });

    test("test main function transform", async () => {
        let tf = new semmed_tf.default(input);
        let res = await tf.transform();
        expect(res[0]).not.toHaveProperty('UMLS');
        expect(res[0]).not.toHaveProperty('@type');
        expect(res[0]).toHaveProperty("apiEdge");
        expect(res[0]).toHaveProperty("subject");
        expect(res.slice(-1)[0]).toHaveProperty("subject");
        expect(res.length).toBeGreaterThan(30);
    })

})
