# AVL Tree Background

A binary tree is either is either empty (Empty) or else it
        it has a root node and two subtrees (which are binary trees).
        The root node t has a key, t.key. Ordinarily it would also
        hold other data (t.data), which the user would like to find by
        searching for the key.  Since this attribute has no impact on 
        how insertion and search take place, we disregard it here. 
        Note that a newly inserted node will always appear as a leaf
        in the tree. The BST invariant is always maintained: for each 
        subtree t, with root key t.key, the left subtree, t.left, 
        contains no node with key greater than k, and the right subtree,
        t.right, contains no node with key smaller than k.

## The left-left case

If the new key was added to the left child of the left child (the
left-left case) and the resulting tree is too unbalanced, the balance can be
restored with a "Right rotation" operation, as explained in the diagram
below. The 6 and 4 nodes and the edge between them rotate clockwise, and
the 5 node changes parents from 4 to 6. This reduces the distance from
the root to the 1 (where the new node was added), restoring the balance
(the distance to the node rooted at 7 is increased but this does not
cause the AVL tree balance condition to be violated).  Right rotation is
done by calling rightRotate(t6), where t6 is the tree rooted at 6.

```
      6                           2
     / \     Right Rotation      / \
    2   7    - - - - - - - >    1   6
   / \       < - - - - - - -       / \
  1   4       Left Rotation       4   7
```

## The right-right case

The right-right case is the exact opposite. If the tree on the right in
the diagram above is too unbalanced due to insertion into the subtree
rooted at 7, we can call rightRotate(t2) to lift that subtree and lower
the 1 subtree.

## The left-right case (double rotation)

If the new key was added to the right child of the left child (the
left-right case) and the resulting tree is too unbalanced, the balance can be
restored with a left rotation at node 2 followed by a right rotation at
node 6.
```
      6      Rotate           6       Rotate           4
     / \    left at 2        / \     right at 6      /   \
    2   7   - - - - - >     4   7    - - - - - >    2     6
   / \                     / \                     / \   / \
  1   4                   2   5                   1   3 5   7
     / \                 / \
    3   5               1   3
```
Nodes in the subtree rooted at 4 (where the extra element was added,
making the tree unbalanced) are moved closer to the root.
Trees rooted at 1, 3, 5 and 7 are not affected, except the distances from
the root of 3, 5 and 7 are changed by one, affecting the overall balance.

## right-left case (double rotation):

If the new key was added to the left child of the right child (the
right-left case) and the resulting tree is too unbalanced, it is a mirror
image of the left-right case:

```
      2      Rotate           2       Rotate           4
     / \    right at 6       / \     left at 2       /   \
    1   6   - - - - - >     1   4    - - - - - >    2     6
       / \                     / \                 / \   / \
      4   7                   3   6               1   3 5   7
     / \                         / \
    3   5                       5   7
```
