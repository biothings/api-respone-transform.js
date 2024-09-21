import { JSONDoc } from "./json_transform/types";
import { SmartAPIKGOperationObject } from "@biothings-explorer/smartapi-kg";

interface TemplatedInput {
  queryInputs: string | string[];
  [additionalAttributes: string]: string | string[];
}

export interface BTEKGOperationObject extends SmartAPIKGOperationObject {
  input: string | string[] | TemplatedInput;
  reasoner_edge?: any;
  filter?: string;
  original_input?: object;
  input_resolved_identifiers?: object;
}

export interface BTEQueryObject {
  response: JSONDoc | JSONDoc[] | { hits: JSONDoc[] };
  edge: BTEKGOperationObject;
}

export interface JQVariable {
  name: string;
  value: string;
}
