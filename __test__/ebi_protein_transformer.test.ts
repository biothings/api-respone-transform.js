import { describe, expect, test } from "@jest/globals";
import fs from "fs";
import path from "path";
import ebi_tf from "../src/transformers/ebi_protein_transformer";

describe("test EBI Protein transformer", () => {
  let response;
  let input;

  beforeEach(() => {
    const response_path = path.resolve(__dirname, "./data/ebi_protein/response.json");
    response = JSON.parse(fs.readFileSync(response_path, { encoding: "utf8" }));
    const edge_path = path.resolve(__dirname, "./data/ebi_protein/edge.json");
    const edge = JSON.parse(fs.readFileSync(edge_path, { encoding: "utf8" }));
    input = {
      response,
      edge,
    };
  });

  test("test ebi wrapper", () => {
    let tf = new ebi_tf(input, {});
    let res = tf.wrap(response);
    expect(res.comments[0].reaction.dbReferences).toHaveLength(1);
  });
});
