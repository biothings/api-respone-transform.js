.response as $response
| generateCurie($edge.input.id; $edge.input.curies) as $input_curie 
| if $edge.response_mapping[$edge.predicate].output_name | contains("object")
  then "object_namespace"
  else "subject_namespace"
  end 
| . as $output_namespace
| { $input_curie: [$response] } | .[$input_curie][0].items = [
  $response.items[]
  | select(. != null)
  | select(
    .[$output_namespace] == $edge.output.id
  ) 
  | .publications = [
    if .publications != null
    then .publications
    else []
    end
    | .[]
    | select(. | startswith("PMID:"))
  ]
]
