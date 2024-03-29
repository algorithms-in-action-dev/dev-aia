# Dijkstra's Shortest Path Algorithm
---

Dijkstra's algorithm for shortest paths in graphs can be used to find
the shortest (that is, lowest weight or cost) path from a single start
node to a single end node, one of severeral end nodes or all nodes that
are connected (depending on the termination condition). It assumes all
edges have a positive weight.
It
is one of several algorithms that can be viewed as having a similar
structure. Some of these can be used for both directed and undirected
graphs; here we use undirected graphs for simplicity.  The way paths are
represented is for each node to point to the previous node in the path
(so paths are actually reversed in this representation and essentially we
have a tree with "parent" pointers and the start node at the root). This
allows multiple nodes to each have a single path represented.

As all these algorithms execute, we can classify nodes into three sets.
They are the nodes for which the final parent node has been found (this
is a region of the graph around the start node), "frontier" nodes that
are not finalised but are connected to a finalised node by a single edge,
and the rest of the nodes, which have not been seen yet. The frontier
nodes are stored explicitly in some data structure and some algorithms
also need some way to check if a node has been seen and/or finalised.  The
frontier initially contains just the start node. The algorithms repeatedly
pick a frontier node, finalises the node (its current parent becomes
its final parent) and updates information about neighbours of the node.

Dijkstra's algorithm keeps track of the length of the shortest path
found so far to each node (if any) and uses a priority queue (PQ) for
the frontier nodes, with the "cost" being this length. At each stage the
node that has the shortest path is removed from the PQ and finalised;
its neighbours in the frontier may now have a shorter path to them so
their costs need to be updated (and other neighbours must be added to
the frontier).

In the presentation here, we do not give details of how the priority
queue is implemented, but just emphasise it is a collection of nodes
with associated costs and the node with the minimum cost is selected each
stage. When elements disappear from the Cost array it means the element
has been removed from the PQ queue (the value is not used again).
The pseudo-code is simpler if nodes that are yet to be seen are also
put in the PQ, with infinite cost, which we do here.

Here we number all nodes for simplicity so we can use arrays for the
graph representation, the parent pointers, etc.  For many important
applications, particularly in artificial intelligence, the graphs can
be huge and arrays are impractical for representing the graph so other
data structures are needed.

In this animation the layout of the graph nodes is important. All nodes
are on a two-dimensional grid so each have (x,y) integer coordinates.
Both the weight of each edge and heuristic values for each node are
related to the "distance" between the two nodes.  Two measures of
distance are provided: Euclidean and Manhattan.  Eclidean distance is
the straight line distance; here we round it up to the next integer.
Manhattan distance is the difference in x coordinate values plus the
difference in y coordinate values.  You can choose which distance measure
to use for both weights and heuristic values to explore behaviour of the
algorithm. You can also manually input weights. Note that if Euclidean
distance is used for weights and Manhattan distance is used for the
heuristic, it is not admissible so the shortest path may not be the one
returned (you may like to experiment with the default supplied graph
and change the weight and heuristic settings). For other combinations of
Manhattan/Euclidean the heuristic is admissible.  You can also choose the
start and end nodes and change the graph choice (see the instructions
tab for more details). Only a single end node is supported; choosing 0
results in finding shortest paths to all connected nodes.

