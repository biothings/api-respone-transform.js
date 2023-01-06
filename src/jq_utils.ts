import { JQVariable, BTEKGOperationObject } from "./types"

const functions = `
# example increment function
def increment: . + 1;

# deletes key if empty array
def delifempty(k): (if k == [] then del(k) | . else . end);

# sets inputted value to "empty" if empty array
def remifempty: (if . == [] then empty else . end);

# generates a curie from a type and id
def generateCurie(idType; id): if (id | type) == "array" then id[0] else id end | split(":") | last | idType + ":" + .;

# checks if object meets any filter string
def any_filter(filter_strs):
. as $obj | . |= foreach filter_strs as $filter_str (false; . or $obj.[filter_str | split(":") | first] == filter_str | split(":") | last; .);

# checks if object meets all filter strings
def all_filter(filter_strs):
. as $obj | . |= foreach filter_strs as $filter_str (false; . or $obj.[filter_str | split(":") | first] == filter_str | split(":") | last; .);

# filters the list that is supplied on all conditions
def list_filter_all(filter_strs): 
(filter_str | split(":") | first) as $key | (filter_str | split(":") | last) as $value |
. |= [.[] | if . | all_filter(filter_strs) then . else empty end];

# filters the list that is supplied on any conditions
def list_filter_any(filter_strs): 
(filter_str | split(":") | first) as $key | (filter_str | split(":") | last) as $value |
. |= [.[] | if . | any_filter(filter_strs) then . else empty end];
`

function generateVariables(variables: JQVariable[]) {
    let variableString = '';
    for (const variable of variables) {
      variableString += `${variable.value} as ${variable.name} | `;
    }
    return variableString;
}

export function generateFilterString(filterString: string, edge: BTEKGOperationObject) {
  const variables = [
    {
      name: '$edge',
      value: JSON.stringify(edge)
    }
  ];
  return `${functions}\n${generateVariables(variables)}${filterString}`
} 