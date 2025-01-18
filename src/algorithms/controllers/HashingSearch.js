import {
  hash1,
  setIncrement,
  HASH_GRAPH,
  EMPTY_CHAR,
  Colors,
  INDEX,
  POINTER,
  POINTER_VALUE,
  SMALL_SIZE,
  DELETE_CHAR,
  HASH_TYPE,
  PRIMES,
  POINTER_CUT_OFF,
  newCycle,
  findTableSize
} from './HashingCommon';

// Bookmarks to link chunker with pseudocode
const IBookmarks = {
  Init: 1,
  ApplyHash: 5,
  ChooseIncrement: 6,
  WhileNot: 2,
  Probing: 3,
  CheckValue: 4,
  Found: 7,
  NotFound: 8,
  Pending: 9
}

export default {

  // Initialize visualizers
  initVisualisers({ visualisers }) {
    return {
      array: {
        instance: visualisers.array.instance,
        order: 0,
      },
      graph: {
        instance: visualisers.graph.instance,
        order: 1,
      },
    };
  },

  /**
   * Running function for chunker of search, using the key provided
   * @param {*} chunker the chunker for searching
   * @param {*} params parameters for searching algorithm, e.g. name, key, insertion visualizer instances,...
   * @returns whether the key is found or not
   */
  run(chunker, params) {

    // Assigning parameter values to local variables
    const ALGORITHM_NAME = params.name;
    const TARGET = params.target; // Target value we are searching for
    let table = params.visualisers.array.instance.extractArray(1, EMPTY_CHAR); // The table with inserted values
    const SIZE = findTableSize(table); // Hash Modulo being used in the table

    // Variable for testing
    let found = true;

    // Chunker for intial state of visualizers
    chunker.add(
      IBookmarks.Init,
      (vis, target) => {

        vis.array.showKth({key: target, type: HASH_TYPE.Search}); // Show stats

        newCycle(vis, SIZE, target, ALGORITHM_NAME);
      },
      [TARGET]
    );

    // Hashing the key
    let i = hash1(chunker, IBookmarks.ApplyHash, TARGET, SIZE, true, HASH_TYPE.Search); // Target value after being hashed

    /** This part is for Linear Probing and Double Hashing */
    if (ALGORITHM_NAME !== 'HashingCH') {
      // Calculate increment for key
      let increment = setIncrement(chunker, IBookmarks.ChooseIncrement, TARGET, SIZE, params.name, HASH_TYPE.Search, true);

      // Chunker for initial slot
      chunker.add(
        IBookmarks.WhileNot,
        (vis, idx) => {
          if (SIZE <= PRIMES[POINTER_CUT_OFF]) {
            vis.array.assignVariable(POINTER_VALUE, POINTER, idx); // Pointer only shows for small tables
          }
          vis.array.fill(INDEX, idx, undefined, undefined, Colors.Pending); // Highlight initial search position

          // Uncoloring the graphs
          vis.graph.deselect(HASH_GRAPH.Key);
          vis.graph.deselect(HASH_GRAPH.Value);
          vis.graph.removeEdgeColor(HASH_GRAPH.Key, HASH_GRAPH.Value);
          if (ALGORITHM_NAME == "HashingDH") {
            vis.graph.deselect(HASH_GRAPH.Key2);
            vis.graph.deselect(HASH_GRAPH.Value2);
            vis.graph.removeEdgeColor(HASH_GRAPH.Key2, HASH_GRAPH.Value2);
          }
        },
        [i]
      );

      let explored = 0;
      // Search for the target key, checking each probed position
      while (table[i] !== TARGET && table[i] !== undefined && explored < SIZE) {
          explored += 1;

        // Chunker for not matching
        chunker.add(
          IBookmarks.WhileNot,
          (vis, idx) => {
            vis.array.fill(INDEX, idx, undefined, undefined, Colors.Collision); // Fill the slot with red if the slot does not match key
          },
          [i]
        );

        // Move to the next index based on collision handling
        i = (i + increment) % SIZE;

        // Chunker for probing
        chunker.add(
          IBookmarks.Probing,
          (vis, idx) => {
            if (SIZE <= PRIMES[POINTER_CUT_OFF]) {
              vis.array.assignVariable(POINTER_VALUE, POINTER, idx); // Pointer is only shown for small tables
            }
          },
          [i]
        );

        // Chunker for searching the slots based on increment
        chunker.add(
          IBookmarks.WhileNot,
          (vis, idx) => {
              vis.array.fill(INDEX, idx, undefined, undefined, Colors.Pending); // Fill pending slots with yellow
          },
          [i]
        );
      }

      // Chunker for found
      if (table[i] === TARGET) {
        chunker.add(
          IBookmarks.Found,
          (vis, idx) => {
            vis.array.fill(INDEX, idx, undefined, undefined, Colors.Insert); // Fill the slot with green, indicating that the key is found
          },
          [i]
        );
        found = true; // Set testing variable
      }

      // Chunker for not found
      else {
        chunker.add(
          IBookmarks.NotFound,
          (vis, idx) => {
            vis.array.fill(INDEX, idx, undefined, undefined, Colors.Collision); // Fill last slot with red
          },
          [i]
        );
        found = false; // Set testing variable
      }
      return found; // Return found or not for testing
    }

    /** This part is for Chaining */
    else {

      chunker.add(
        IBookmarks.Pending,
        (vis, idx) => {
            vis.array.fill(INDEX, idx, undefined, undefined, Colors.Pending); // Fill pending slots with yellow
        },
        [i]
      );

      // Chunker for found
      if (table[i] != undefined) {
        if (Array.isArray(table[i])) {
          if (table[i].includes(TARGET)) {
            chunker.add(
              IBookmarks.Found,
              (vis, idx) => {
                vis.array.fill(INDEX, idx, undefined, undefined, Colors.Insert); // Fill the slot with green, indicating that the key is found
              },
              [i]
            );
            found = true; // Set testing variable
          }
          if (table[i] === TARGET) {
            chunker.add(
              IBookmarks.Found,
              (vis, idx) => {
                vis.array.fill(INDEX, idx, undefined, undefined, Colors.Insert); // Fill the slot with green, indicating that the key is found
              },
              [i]
            );
            found = true; // Set testing variable
          }
        }
      }

      // Chunker for not found
      else {
        chunker.add(
          IBookmarks.NotFound,
          (vis, idx) => {
            vis.array.fill(INDEX, idx, undefined, undefined, Colors.Collision); // Fill last slot with red
            found = false; // Set testing variable
          },
          [i]
        );
        found = false; // Set testing variable
      }
      return found; // Return found or not for testing
    }
  },
};
