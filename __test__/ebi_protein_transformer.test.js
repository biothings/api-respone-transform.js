/**
 * @jest-environment node
 */

const jq_tf = require("../built/transformers/jq_transfomer");
const fs = require("fs");
const path = require("path");

describe("test EBI Protein transformer", () => {

    let response;
    let input;

    beforeEach(() => {
        const response_path = path.resolve(__dirname, './data/ebi_protein/response.json');
        response = JSON.parse(fs.readFileSync(response_path));
        const edge_path = path.resolve(__dirname, './data/ebi_protein/edge.json');
        const edge = JSON.parse(fs.readFileSync(edge_path));
        input = {
            response,
            edge
        }
    })

    test("test ebi wrapper", async () => {
        let tf = new jq_tf.default(input, { type: "ebi" });
        let res = await tf.wrap(response);
        expect(res.comments[0].reaction.dbReferences).toHaveLength(1);
    })
})