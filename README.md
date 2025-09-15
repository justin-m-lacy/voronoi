[https://mapbox.github.io/delaunator/](https://mapbox.github.io/delaunator/)

Delaunay Notes:


`delaunay.triangles` - maps half-edge index `e` to point index.

`halfedges[e]` maps edge index `e` to index of the opposite half edge (or -1 on border),
which is not particularly useful outside the algorithm.