import parse from '../../pseudocode/parse';

export default parse(`
    
\\Note{  REAL specification of AVL tree insertion and search
XXX draft
\\Note}

\\Note{  modified from BST - best check actual running BST Real code for
search and use that

Terminology (might change???)
For BST we confound t.key and t->key, eg, we have c <- c.left.  Its not
too bad with BST code, but here the code gets more complex, with
multiple levels of the tree involved using c.left.left is a bit too
dodgy(?).  So we use:

root(t) = (*t)
left(t) = *(t->left) (or Empty)   ?????
right() similarly
root(t).key, root(t).height, etc
left(t).height, etc ???
\\Note}

\\Overview{  A binary tree is either is either empty (Empty) or else it
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
XXX AVL trees balanced, shorten above
Need to have these rotation explanations here as we can't format
explanations properly it seems:

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

'''
      6                           2
     / \\    Right Rotation      / \\
    2   7    - - - - - - - >    1   6
   / \\      < - - - - - - -       / \\
  1   4       Left Rotation       4   7
'''

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
'''
      6      Rotate           6       Rotate           4
     / \\    left at 2       / \\     right at 6     /   \\
    2   7   - - - - - >     4   7    - - - - - >    2     6
   / \\                    / \\                    / \\  / \\
  1   4                   2   5                   1   3 5   7
     / \\                / \\
    3   5               1   3
'''
Nodes in the subtree rooted at 4 (where the extra element was added,
making the tree unbalanced) are moved closer to the root.
Trees rooted at 1, 3, 5 and 7 are not affected, except the distances from
the root of 3, 5 and 7 are changed by one, affecting the overall balance.

## right-left case (double rotation):

If the new key was added to the left child of the right child (the
right-left case) and the resulting tree is too unbalanced, it is a mirror
image of the left-right case:

XXX edit diagram above (tree on left won't be consistent with previous
examples but thats OK I think)

\\Overview}

\\Note{ For both insertion and search, the animation should be as
consistent
as possible with BST
\\Note}

\\Code{
Main
\\Note{
  This is recursive, with most of the work done as we return back up from
  recursive calls. This should be visualised in some way. Perhaps
  colouring nodes on the way down and removing the colour on the way
  back up is sufficient - there is only one path back up to the root.
  The "current" node should certainly be highlighted in some way also.
\\Note}
AVLT_Insert(t, k) \\B AVLT_Insert(t, k)
  \\In{
    if t = Empty \\B if t = Empty
    \\In{
      //Both subtrees are Empty and the height is 1
      create new node n containing k \\B create new node
      return (pointer to) n // return a single-node tree \\B return n
      \\Expl{  The returned tree has just
              one node, with key k, empty sub-trees and height 1.
              This is the base case of the recursion.
      \\Expl}
    \\In}
    if k < root(t).key \\B if k < root(t).key
    \\Expl{ The key in the root determines if we insert into the left or
          right subtree.
    \\Expl}
    \\In{
        insert k into the left subtree of t \\Ref insertLeft
    \\In}
    else if k > root(t).key \\B else if k > root(t).key
      \\Note{ XXX allow duplicate keys or not???
        Should be possible, but have to carefully review code to make sure its
        correct. What does BST code do?
      \\Note}
    \\In{
        insert k into the right subtree of t \\Ref insertRight
    \\In}
    else \\B else k = root(t).key
    \\In{
        return t // key k is already in the tree \\B return t, no change
        \\Expl{  The key is already in the tree, so no change is needed.
        \\Expl}
    \\In}
    Update the height of t \\Ref updateHeight
    \\Expl{ The height of t may have increased by one
    \\Expl}
    Determine the balance of t \\Ref getBalance
    \\Expl{ For AVL trees, we must ensure the height of the two subtrees
      varies by at most one.
    \\Expl}
    Perform rotations to restore balance, if needed \\Ref rotateIfNeeded
    \\Expl{ Rotations are local tree operations that increase the
      height/depth of one subtree but decrease that of another, used to
      make the tree more balanced.
      See Background (click at the top of the right panel)
      for diagrams etc explaining rotations.
    \\Expl}
    return t \\B return t
    \\Expl{
      Tree t must be sufficiently balanced (-1 <= balance <= 1) so no
      rotations are needed:)
    \\Expl}
  \\In}
  // Done \\B done
//============================================================================
\\Note{ Might be best to expand these inline rather than having extra
functions. Functions are always visible, which is distracting when things
are collapsed and they are relatively short.  However, we would end up
with two copies of each, and rather long code if we expand everyting.
The variable names here are linked to the diagrams, which may be easier for
functions but may also be confusing.
\\Note}
rightRotate(t6) \\B rightRotate(t6)
\\Expl{
See Background (click at the top of the right panel)
for diagrams etc explaining rotations.
\\Expl}
  \\In{
    t2 <- left(t6) \\B t2 = left(t6)
    t4 <- right(t2) \\B t4 = right(t2)
    t2.right <- t6 \\B t2.right = t6
    t6.left <- t4 \\B t6.left = t4
    \\Note{ Animation here should be as smooth an intuitive as possible.
      Ideally node 4 should get detached from 2 but remain in place then
      get re-attached to 6. We could possibly move 7 down to the level of 4
      at the first step and delay moving 1 up until the end. Best highlight
      the edge between 6 and 2. If extra steps are required for animation
      we can stay on the same line of code for more than one step if
      needed. Similarly for left rotation.
    \\Note}
    recompute heights of t6 and t2 \\B recompute heights of t6 and t2
    \\Expl{ t6.height <- max(t4.height, t7.height) + 1;
      t2.height <- max(t6.height, t1.height) + 1;
    \\Expl}
    \\Note{ Best not expand this? Should be clear enough and we are a bit
      fast and loose with nodes versus pointers here
    \\Note}
    return (pointer to) t2 // new root \\B return t2
  \\In} 
//============================================================================
leftRotate(t2) \\B leftRotate(t2)
\\Expl{
See Background (click at the top of the right panel)
for diagrams etc explaining rotations.
\\Expl}
  \\In{
    t6 <- right(t2) \\B t6 = right(t2)
    t4 <- left(t6) \\B t4 = left(t6)
    t6.left <- t2 \\B t6.left = t2
    t2.right <- t4 \\B t2.right = t4
    recompute heights of t2 and t6 \\B recompute heights of t2 and t6
    \\Expl{ t2.height <- max(t1.height, t4.height) + 1;
      t6.height <- max(t2.height, t7.height) + 1;
    \\Expl}
    return (pointer to) t6 // new root \\B return t6
  \\In} 
\\Code}

\\Code{
insertLeft
\\Note{
Animation stops at this comment so user can prepare mentally for
recursive call plus we need a chunk at this level of recursion just
before the call so we can step back to it
\\Note}
// *recursively* call insert with the left subtree \\B prepare for the left recursive call
AVLT_Insert(left(t), k) \\B left(t) <- AVLT_Insert(left(t), k)
\\Expl{
The left subtree is replaced by the result of this recursive call
\\Expl}
\\Note{
XXX should this be left(t) <- AVLT_Insert(left(t), k) or is the
explanation enough? (same for right)
\\Note}
\\Code}


\\Code{
insertRight
\\Note{
Animation stops at this comment so user can prepare mentally for
recursive call plus we need a chunk at this level of recursion just
before the call so we can step back to it
\\Note}
// *recursively* call insert with the right subtree \\B prepare for the right recursive call
AVLT_Insert(right(t), k) \\B right(t) <- AVLT_Insert(right(t), k)
\\Expl{
The right subtree is replaced by the result of this recursive call
\\Expl}
\\Code}

\\Code{
updateHeight
root(t).height <- 1 + max(left(t).height, right(t).height) \\B root(t).height = 1 + max(left(t).height, right(t).height)
\\Note{
t.height <- ...?? (fast and loose with nodes vs pointers)
\\Note}
\\Expl{
The tree height is one more than the maximum height of its children.
\\Expl}
\\Code}

\\Code{
getBalance
balance = left(t).height - right(t).height \\B balance = left(t).height - right(t).height
\\Expl{
The balance is just the different between the height of the children.
A positive balance means the left child is higher; negative means the
righ child is higher. A balance from -1 to 1 is ok, otherwise we need to
adjust the tree to make it more balanced.
\\Expl}
\\Code}

\\Code{
rotateIfNeeded
if balance > 1 && k < left(t).key // left-left case \\B if balance > 1 && k < left(t).key
\\Expl{
  Key k was inserted into the left-left subtree and made t unbalanced.
  We must re-balance the tree with a "right rotation" that lifts up this
  subtree.
\\Expl}
\\In{
  Perform "Left-Left Case" rotation \\Ref left-left_case_rotate
\\In}
if balance < -1 && k > right(t).key // right-right case \\B if balance < -1 && k > right(t).key
\\Expl{
  Key k was inserted into the right-right subtree and made t unbalanced.
  We must re-balance the tree with a "left rotation" that lifts up this
  subtree.
\\Expl}
\\In{
    Perform "Right-Right Case" rotation \\Ref right-right_case_rotate
\\In}
if balance > 1 && k > left(t).key // left-right case (double rotation) \\B if balance > 1 && k > left(t).key
\\Expl{
See Background (click at the top of the right panel)
for diagrams etc explaining rotations.
\\Expl}
\\In{
  Perform "Left-Right Case" rotation \\Ref left-right_case_rotate
\\In}
if balance < -1 && k < right(t).key // right-left case (double rotation) \\B if balance < -1 && k < right(t).key
\\Expl{
See Background (click at the top of the right panel)
for diagrams etc explaining rotations.
\\Expl}
\\In{
  Perform "Right-Left Case" rotation \\Ref right-left_case_rotate
\\In}
\\Code}

\\Code{
left-left_case_rotate
  // Perform "right rotation" to re-balance t \\B perform right rotation to re-balance t
  \\Expl{
    See Background (click at the top of the right panel)
    for diagrams etc explaining rotations.
  \\Expl}
  \\Note{
    Animation should stop at the comment above then jump to the
    rightRotate code then stop at return *after* rightRotate then go
    back to the insert call???; May be better to inline it
  \\Note} 
  return rightRotate(t) \\B return rightRotate(t)
\\Code}

\\Code{
right-right_case_rotate
  // Perform "left rotation" to re-balance t \\B perform left rotation to re-balance t
  \\Expl{
    See Background (click at the top of the right panel)
    for diagrams etc explaining rotations.
  \\Expl}
  \\Note{
    See notes in left-left case
  \\Note} 
  return leftRotate(t) \\B return leftRotate(t)
\\Code}

\\Code{
left-right_case_rotate
  // Perform "left rotation" on the left subtree \\B perform left rotation on the left subtree
  \\Note{
    Animation should stop at the comment above then jump to the
    leftRotate code???; May be better to inline it
    XXX should we play fast and loose with node vs pointer here and use
    t.left <- leftRotate(t.left) or have left(t) <- ... ???
  \\Note} 
  perform leftRotate(left(t)); \\B left(t) <- leftRotate(left(t));
  \\Expl{
    The result returned is the new t.left.
  \\Expl}
  // Return "right rotation" on t \\B return right rotation on t
  \\Note{
    Animation should stop at the comment above then jump to the
    rightRotate code then stop at return *after* rightRotate then go
    back to the insert call???; May be better to inline it
  \\Note} 
  return rightRotate(t) \\B return rightRotate(t) after leftRotate
\\Code}

\\Code{
right-left_case_rotate
  // Perform "right rotation" on the right subtree \\B perform right rotation on the right subtree
  \\Note{
    See notes for left-right case
  \\Note} 
  perform rightRotate(right(t)); \\B right(t) <- rightRotate(right(t));
  \\Expl{
    The result returned is the new t.right.
  \\Expl}
  // Return "left rotation" on t \\B return left rotation on t
  return leftRotate(t) \\B return leftRotate(t) after rightRotate
\\Code}

\\Note{  This is an implementation in C (from geeksforgeeks, with very
minor mods):
// C program to insert a node in AVL tree 
#include<stdio.h> 
#include<stdlib.h> 

// An AVL tree node 
struct Node 
{ 
	int key; 
	struct Node *left; 
	struct Node *right; 
	int height; 
}; 

// A utility function to get the height of the tree 
int height(struct Node *N) 
{ 
	if (N == NULL) 
		return 0; 
	return N->height; 
} 

// A utility function to get maximum of two integers 
int max(int a, int b) 
{ 
	return (a > b)? a : b; 
} 

/* Helper function that allocates a new node with the given key and 
	NULL left and right pointers. */
struct Node* newNode(int key) 
{ 
	struct Node* node = (struct Node*) 
						malloc(sizeof(struct Node)); 
	node->key = key; 
	node->left = NULL; 
	node->right = NULL; 
	node->height = 1; // new node is initially added at leaf 
	return(node); 
} 

// A utility function to right rotate subtree rooted with y 
// See the diagram given above. 
struct Node *rightRotate(struct Node *y) 
{ 
	struct Node *x = y->left; 
	struct Node *T2 = x->right; 

	// Perform rotation 
	x->right = y; 
	y->left = T2; 

	// Update heights 
	y->height = max(height(y->left), 
					height(y->right)) + 1; 
	x->height = max(height(x->left), 
					height(x->right)) + 1; 

	// Return new root 
	return x; 
} 

// A utility function to left rotate subtree rooted with x 
// See the diagram given above. 
struct Node *leftRotate(struct Node *x) 
{ 
	struct Node *y = x->right; 
	struct Node *T2 = y->left; 

	// Perform rotation 
	y->left = x; 
	x->right = T2; 

	// Update heights 
	x->height = max(height(x->left), 
					height(x->right)) + 1; 
	y->height = max(height(y->left), 
					height(y->right)) + 1; 

	// Return new root 
	return y; 
} 

// Get Balance factor of node N 
int getBalance(struct Node *N) 
{ 
	if (N == NULL) 
		return 0; 
	return height(N->left) - height(N->right); 
} 

// Recursive function to insert a key in the subtree rooted 
// with node and returns the new root of the subtree. 
struct Node* insert(struct Node* node, int key) 
{ 
	/* 1. Perform the normal BST insertion */
	if (node == NULL) 
		return(newNode(key)); 

	if (key < node->key) 
		node->left = insert(node->left, key); 
	else if (key > node->key) 
		node->right = insert(node->right, key); 
	else // Equal keys are not allowed in BST 
		return node; 

	/* 2. Update height of this ancestor node */
	node->height = 1 + max(height(node->left), 
						height(node->right)); 

	/* 3. Get the balance factor of this ancestor 
		node to check whether this node became 
		unbalanced */
	int balance = getBalance(node); 

	// If this node becomes unbalanced, then 
	// there are 4 cases 

	// Left Left Case 
	if (balance > 1 && key < node->left->key) 
		return rightRotate(node); 

	// Right Right Case 
	if (balance < -1 && key > node->right->key) 
		return leftRotate(node); 

	// Left Right Case 
	if (balance > 1 && key > node->left->key) 
	{ 
		node->left = leftRotate(node->left); 
		return rightRotate(node); 
	} 

	// Right Left Case 
	if (balance < -1 && key < node->right->key) 
	{ 
		node->right = rightRotate(node->right); 
		return leftRotate(node); 
	} 

	/* return the (unchanged) node pointer */
	return node; 
} 

// A utility function to print preorder traversal 
// of the tree. 
// The function also prints height of every node XXX no it doesn't
void preOrder(struct Node *root) 
{ 
	if(root != NULL) 
	{ 
		printf("(%d", root->key); 
		preOrder(root->left); 
		preOrder(root->right); 
		printf(")"); 
	} 
} 

/* Driver program to test above function*/
int main() 
{ 
struct Node *root = NULL; 

/* Constructing tree given in the above figure */
root = insert(root, 10); 
root = insert(root, 20); 
root = insert(root, 30); 
root = insert(root, 40); 
root = insert(root, 50); 
root = insert(root, 25); 

/* The constructed AVL Tree would be 
			30 
		/ \\
		20 40 
		/ \\	\\ 
	10 25 50 
*/

printf("Preorder traversal of the constructed AVL"
		" tree is \\n"); 
preOrder(root); 
printf("\\n"); 

return 0; 
} 
\\Note}
`);