generateCurie($edge.input.id; $edge.input.curies) as $input_curie 
| .response.items = [
  .response.items[]
  | select(. != null)
  | select(
    . as $item
    | if $item.direction == "outgoing"
      then $item.subject
      else $item.object
      end
    | . as $input_curie
    | if $item.direction == "outgoing"
      then $item.object_namespace
      else $item.subject_namespace
      end
    | . as $output_namespace
    | $input_curie == $input_curie
      and $output_namespace == $edge.output.id
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
| { $input_curie: [.response] }
