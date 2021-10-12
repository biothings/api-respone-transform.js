/**
 * @jest-environment node
 */

const biothings_tf = require("../built/transformers/biothings_transformer");
const fs = require("fs");
const path = require("path");

describe("test biothings transformer", () => {

    describe("test biothings transformer for post query", () => {
        let input;
        let response;

        beforeAll(() => {
            const post_query_response_path = path.resolve(__dirname, './data/biothings/mychem_post.json');
            response = JSON.parse(fs.readFileSync(post_query_response_path));
            const edge_path = path.resolve(__dirname, './data/biothings/mychem_example_edge.json');
            const edge = JSON.parse(fs.readFileSync(edge_path));
            input = {
                response,
                edge
            }
        })

        test("test biothings wrapper", () => {
            let tf = new biothings_tf.default(input);
            let res = tf.pairInputWithAPIResponse();
            expect(Object.keys(res)).toHaveLength(2);
            expect(res).toHaveProperty("DRUGBANK:DB00188");
            expect(res["DRUGBANK:DB00188"]).toHaveLength(2);
            expect(res).not.toHaveProperty("DRUGBANK:DB0000");
        })
    })

    describe("test biothings transformer for post query using mygene", () => {
        let input;
        let response;

        beforeAll(() => {
            const post_query_response_path = path.resolve(__dirname, './data/biothings/mygene_post.json');
            response = JSON.parse(fs.readFileSync(post_query_response_path));
            const edge_path = path.resolve(__dirname, './data/biothings/mygene_example_edge.json');
            const edge = JSON.parse(fs.readFileSync(edge_path));
            input = {
                response,
                edge
            }
        })

        test("test biothings wrapper", () => {
            let tf = new biothings_tf.default(input);
            let res = tf.pairInputWithAPIResponse();
            expect(Object.keys(res)).toHaveLength(1);
            expect(res).toHaveProperty("NCBIGene:1017");
            expect(res["NCBIGene:1017"]).toHaveLength(1);
        })

        test("test biothings transform", async () => {
            let tf = new biothings_tf.default(input);
            let res = await tf.transform();
            expect(res).toHaveLength(27);
            expect(res[0]).not.toHaveProperty('pubmed');
            expect(res[0]).toHaveProperty('publications', ["PMID:21873635"]);
        })
    })

    describe("test biothings transformer for get query", () => {
        let input;
        let response;

        beforeAll(() => {
            const get_query_response_path = path.resolve(__dirname, './data/biothings/drug_response_get_response.json');
            response = JSON.parse(fs.readFileSync(get_query_response_path));
            const edge_path = path.resolve(__dirname, './data/biothings/drug_response_example_edge.json');
            const edge = JSON.parse(fs.readFileSync(edge_path));
            input = {
                response,
                edge
            }
        })

        test("test biothings wrapper", () => {
            let tf = new biothings_tf.default(input);
            let res = tf.pairInputWithAPIResponse();
            expect(Object.keys(res)).toHaveLength(1);
            expect(res).toHaveProperty("PUBCHEM:11373846");
            expect(res["PUBCHEM:11373846"]).toHaveLength(1);
        })
    })
})
