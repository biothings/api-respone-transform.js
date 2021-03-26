const cord_tf = require("../built/transformers/cord_transformer");
const axios = require("axios");

describe("test cord transformer", () => {

    let api_response, input;

    beforeAll(async () => {
        let res = await axios({
            method: 'post',
            url: 'https://biothings.ncats.io/cord_gene/query',
            data: 'q=238, 239, 240&scopes=hgnc',
            params: {
                fields: 'associated_with'
            }
        })
        api_response = res.data;
        input = {
            response: api_response,
            edge: {
                "input": ["238", "239", "240"],
                "query_operation": {
                    "params": {
                        "fields": "associated_with"
                    },
                    "request_body": {
                        "body": {
                            "q": "{inputs[0]}",
                            "scopes": "hgnc"
                        },
                        "header": "application/x-www-form-urlencoded"
                    },
                    "path": "/query",
                    "path_params": [],
                    "method": "post",
                    "server": "https://biothings.ncats.io/cord_gene",
                    "tags": [
                        "gene",
                        "annotation",
                        "query",
                        "translator",
                        "biothings"
                    ],
                    "supportBatch": true,
                    "inputSeparator": ","
                },
                "association": {
                    "input_id": "HGNC",
                    "input_type": "Gene",
                    "output_id": "HGNC",
                    "output_type": "Gene",
                    "predicate": "related_to",
                    "source": "Translator Text Mining Provider",
                    "api_name": "CORD Gene API",
                    "smartapi": {
                        "id": "6bc54230a6fa7693b2cd113430387ca7",
                        "meta": {
                            "ETag": "5e7512d15d24b57b52cb15604aaa6c24192f48ef00da9732f23aab3707b2061b",
                            "github_username": "kevinxin90",
                            "timestamp": "2020-04-29T00:00:40.725359",
                            "uptime_status": "good",
                            "uptime_ts": "2020-06-12T00:05:25.251375",
                            "url": "https://raw.githubusercontent.com/NCATS-Tangerine/translator-api-registry/master/cord/cord_gene.yml"
                        }
                    }
                },
                "response_mapping": {
                    "related_to": {
                        "HGNC": "associated_with.hgnc",
                        "pmc": "associated_with.pmc"
                    }
                },
                "id": "01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b"
            }
        }
    });

    test("test cord pairInputWithAPIResponse", () => {
        let tf = new cord_tf.default(input);
        let res = tf.pairInputWithAPIResponse();
        expect(res).toHaveProperty('HGNC:240');
        expect(res["HGNC:239"]).toBeUndefined();
    });

    test("test wrapper", () => {
        let tf = new cord_tf.default(input);
        let res = tf.wrap(input.response[0]);
        expect(res).toHaveProperty("related_to");
        expect(res.related_to[0]['@type']).toBe("Gene");
    });

    test("test json transform", () => {
        let tf = new cord_tf.default(input);
        let res = tf.jsonTransform(input.response[0]);
        expect(res).toEqual(input.response[0]);
    });

    test("add edge info", () => {
        let tf = new cord_tf.default(input);
        let res = tf.pairInputWithAPIResponse();
        let rec = res["HGNC:238"][0];
        rec = tf.wrap(rec);
        let result = tf.addEdgeInfo("HGNC:238", rec["related_to"][0]);
        expect(result[0]).toHaveProperty("$edge_metadata");
        expect(result[0].$edge_metadata.api_name).toBe("CORD Gene API")
    });

    test("test main function transform", () => {
        let tf = new cord_tf.default(input);
        let res = tf.transform();
        expect(res[0]).not.toHaveProperty('HGNC');
        expect(res[0]).toHaveProperty("$edge_metadata");
        expect(res[0]).toHaveProperty("$input");
        expect(res.length).toBeGreaterThan(20);
    })
})