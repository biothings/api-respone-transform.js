reduce .response[] as $item (
  {}; .[$edge.input.curies 
    | select(($item.Input | ascii_upcase | split(":") | last) == (. | ascii_upcase))
    | generateCurie($edge.input.id; .)
  ] = [] 
  + .[$edge.input.curies
    | select(($item.Input | ascii_upcase | split(":") | last) == (. | ascii_upcase))
    | generateCurie($edge.input.id; .)
  ] 
  + [$item]
) | map_values([.])
