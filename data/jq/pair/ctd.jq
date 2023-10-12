reduce .response[] as $item (
  {}; .[(
      if ($edge.input | type) == "object" then
        ($edge.input.queryInputs | toArray)[]
      else
        ($edge.input | toArray)[]
      end
    ) 
    | select(($item.Input | ascii_upcase | split(":") | last) == (. | ascii_upcase))
    | generateCurie($edge.association.input_id; .)
  ] = [] 
  + .[(
      if ($edge.input | type) == "object" then
        ($edge.input.queryInputs | toArray)[]
      else
        ($edge.input | toArray)[]
      end
    )
    | select(($item.Input | ascii_upcase | split(":") | last) == (. | ascii_upcase))
    | generateCurie($edge.association.input_id; .)
  ] 
  + [$item]
) | map_values([.])
