import { JQVariable, BTEKGOperationObject } from "./types"

const functions = `
# example increment function
def increment: . + 1;

# deletes key if empty array
def delifempty(k): (if k == [] then del(k) | . else . end);
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