export const functions = `
# example increment function
def increment: . + 1;

# deletes key if empty array
def delifempty(k): (if k == [] then del(k) | . else . end);
`