import {describe, expect, test} from '@jest/globals';
import fs from "fs";
import path from "path";
import opentarget_tf from "../src/transformers/opentarget_transformer";

describe("test opentarget transformer", () => {

    let response;
    let input;

    beforeEach(() => {
        const response_path = path.resolve(__dirname, './data/opentarget/response.json');
        response = JSON.parse(fs.readFileSync(response_path, { encoding: 'utf8' }));
        const edge_path = path.resolve(__dirname, './data/opentarget/edge.json');
        const edge = JSON.parse(fs.readFileSync(edge_path, { encoding: 'utf8' }));
        input = {
            response,
            edge
        }
    })

// skip these tests since we're not ingesting opentargets right now
    test.skip("test opentarget wrapper", () => {
        let tf = new opentarget_tf(input, {});
        let res = tf.wrap(response);
        expect(res).toHaveProperty("data");
        expect(res.data[0].drug.id).toEqual("CHEMBL220492");
    })

    test.skip("test opentarget wrapper if id field is not chembl", () => {
        let tf = new opentarget_tf(input, {});
        const fake = {
            data: [
                {
                    "drug": {
                        id: "http://identifiers.org/drugbank/DB0001"
                    }
                }
            ]
        }
        let res = tf.wrap(fake);
        expect(res).toHaveProperty("data");
        expect(res.data[0].drug.id).toEqual("http://identifiers.org/drugbank/DB0001");
    })

})
