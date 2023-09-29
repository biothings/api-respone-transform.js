import BaseTransformer from "./transformer";
import { generateFilterString } from "../jq_utils";
import fs from "fs";
import Path from "path";

import * as jq from "node-jq"; // If converted to import, ts compile breaks it (imports default as undefined)
import { JSONDoc, PairedResponse } from "../json_transform/types";

// Get prefab JQ strings from data/jq
const filterStringsWrap = Object.fromEntries(
  fs.readdirSync(Path.resolve(`${__dirname}/../../data/jq/wrap`)).map(file => {
    const filePath = Path.resolve(`${__dirname}/../../data/jq/wrap/${file}`);
    return [Path.parse(filePath).name, fs.readFileSync(filePath, { encoding: "utf8" })];
  }),
);

const filterStringsPair = Object.fromEntries(
  fs.readdirSync(Path.resolve(`${__dirname}/../../data/jq/pair`)).map(file => {
    const filePath = Path.resolve(`${__dirname}/../../data/jq/pair/${file}`);
    return [Path.parse(filePath).name, fs.readFileSync(filePath, { encoding: "utf8" })];
  }),
);

export default class JQTransformer extends BaseTransformer {
  // TODO more specific typing?
  async wrap(res: JSONDoc | JSONDoc[]): Promise<JSONDoc | JSONDoc[]> {
    if (this.config.wrap)
      res = JSON.parse(
        (await jq.run(generateFilterString(this.config.wrap, this.edge), res, { input: "json" })) as string,
      );
    else if (filterStringsWrap[this.config.type])
      res = JSON.parse(
        (await jq.run(generateFilterString(filterStringsWrap[this.config.type], this.edge), res, {
          input: "json",
        })) as string,
      );
    else res = super.wrap(res);

    return res;
  }

  async pairCurieWithAPIResponse(): Promise<PairedResponse> {
    if (this.config.pair)
      return JSON.parse(
        (await jq.run(generateFilterString(this.config.pair, this.edge), this.data, { input: "json" })) as string,
      );
    else if (filterStringsPair[this.config.type])
      return JSON.parse(
        (await jq.run(generateFilterString(filterStringsPair[this.config.type], this.edge), this.data, {
          input: "json",
        })) as string,
      );

    return super.pairCurieWithAPIResponse();
  }
}
