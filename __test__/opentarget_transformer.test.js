/**
 * @jest-environment node
 */

const jq_tf = require("../built/transformers/jq_transfomer");
const fs = require("fs");
const path = require("path");

describe("test opentarget transformer", () => {

    let response;
    let input;

    beforeEach(() => {
        const response_path = path.resolve(__dirname, './data/opentarget/response.json');
        response = JSON.parse(fs.readFileSync(response_path));
        const edge_path = path.resolve(__dirname, './data/opentarget/edge.json');
        const edge = JSON.parse(fs.readFileSync(edge_path));
        input = {
            response,
            edge
        }
    })

// skip these tests since we're not ingesting opentargets right now
    test.skip("test opentarget wrapper", async () => {
        let tf = new jq_tf.default(input, { type: "opentarget" });
        let res = await tf.wrap(response);
        expect(res).toHaveProperty("data");
        expect(res.data[0].drug.id).toEqual("CHEMBL220492");
    })

    test.skip("test opentarget wrapper if id field is not chembl", async () => {
        let tf = new jq_tf.default(input, { type: "opentarget" });
        const fake = {
            data: [
                {
                    "drug": {
                        id: "http://identifiers.org/drugbank/DB0001"
                    }
                }
            ]
        }
        let res = await tf.wrap(fake);
        expect(res).toHaveProperty("data");
        expect(res.data[0].drug.id).toEqual("http://identifiers.org/drugbank/DB0001");
    })

})