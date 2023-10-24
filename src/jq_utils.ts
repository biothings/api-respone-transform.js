import { JQVariable, BTEKGOperationObject } from "./types";
import Path from "path";
import fs from "fs";

const functions = fs.readFileSync(Path.resolve(`${__dirname}/../data/jq/utils.jq`), { encoding: "utf8" });

function generateVariables(variables: JQVariable[]) {
  let variableString = "";
  for (const variable of variables) {
    variableString += `${variable.value} as ${variable.name} | `;
  }
  return variableString;
}

export function generateFilterString(filterString: string, edge: BTEKGOperationObject) {
  const variables = [
    {
      name: "$edge",
      value: JSON.stringify(edge),
    },
  ];
  return `${functions}\n${generateVariables(variables)}${filterString}`;
}
