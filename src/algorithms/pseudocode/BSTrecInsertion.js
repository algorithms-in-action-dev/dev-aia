import parse from '../../pseudocode/parse';

export default parse(`
\\Code{
Main
\\Note{
  This is a recursive BST insertion. The structure is identical to AVL
  insertion, but without the height update and re-balancing steps on the
  way back up the recursion tree.
\\Note}
BST_Insert(t, k) // returns t with key k inserted \\B BST_Insert(t, k)
  \\In{
    if t = Empty \\B if t = Empty
    \\In{
      return a single-node tree containing k \\B return n
      \\Expl{ Both subtrees are Empty and its height is 1.
              New memory will need to be allocated for it.
              This is the base case of the recursion.
      \\Expl}
    \\In}
    if k < t.key \\B if k < root(t).key
    \\Expl{ The key in the root determines if we insert into the left or
          right subtree.
    \\Expl}
    \\In{
        insert k into the left subtree of t \\Ref insertLeft
    \\In}
    else if k > t.key \\B else if k > root(t).key
    \\In{
        insert k into the right subtree of t \\Ref insertRight
    \\In}
    else \\B else k = root(t).key
    \\In{
        return t // ignore duplicate key \\B return t, no change
        \\Expl{  Key k is already in the tree and here we ignore duplicate keys.
        \\Expl}
    \\In}
    return t \\B return t
    \\Expl{
        Unlike an AVL tree, a standard BST does not perform height updates or
        re-balancing. We simply return the pointer to the current subtree.
    \\Expl}
  \\In}
\\Code}

\\Code{
insertLeft
// *recursively* call insert with the left subtree \\B prepare for the left recursive call
t.left <- BST_Insert(t.left, k) \\B left(t) <- BST_Insert(left(t), k)
\\Expl{
The (possibly empty) left subtree is replaced by the result of this recursive call.
\\Expl}
\\Code}


\\Code{
insertRight
// *recursively* call insert with the right subtree \\B prepare for the right recursive call
t.right <- BST_Insert(t.right, k) \\B right(t) <- BST_Insert(right(t), k)
\\Expl{
The (possibly empty) right subtree is replaced by the result of this recursive call.
\\Expl}
\\Code}
`);