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

# getting a nested field from inputted object (seperated by ., ie. drugcentral.bioactivity)
def get_nested_field(field):
. as $obj | reduce (field | split(".") | .[]) as $subfield ($obj; .[$subfield]?);

# checks if object meets any filter string
def any_filter(filter_strs):
. as $obj | reduce (filter_strs | .[]) as $filter_str (
  false; 
  . or (
    ($obj | get_nested_field($filter_str | split(":") | first)) == ($filter_str | split(":") | last)
  )
);

# checks if object meets all filter strings
def all_filter(filter_strs):
. as $obj | reduce (filter_strs | .[]) as $filter_str (
  true; 
  . and (
    $obj | any_filter([$filter_str | split(":") | last | split(",") | .[] | ($filter_str | split(":") | first) + ":" + .])
  )
);

# filters the list that is supplied on all conditions
def list_filter_all(filter_strs): if (. | type) == "array" then [.[] | if . | all_filter(filter_strs) then . else empty end] else empty end;

# filters the list that is supplied on any conditions
def list_filter_any(filter_strs): if (. | type) == "array" then [.[] | if . | any_filter(filter_strs) then . else empty end] else empty end;
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