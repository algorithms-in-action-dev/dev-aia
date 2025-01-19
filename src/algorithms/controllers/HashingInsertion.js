// XXX could probably do with a restructure; certainly a clean up!
// Dynamic table size was first implemented in a rather inflexible way wrt what
// gets animated etc.  The code has been hacked a lot to "fix" this and a
// bunch of other things...

import Array2DTracer from '../../components/DataStructures/Array/Array2DTracer';
import GraphTracer from '../../components/DataStructures/Graph/GraphTracer';
import { HashingExp } from '../explanations';
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
  VALUE,
  LARGE_SIZE,
  SPLIT_SIZE,
  DELETE_CHAR,
  HASH_TYPE,
  FULL_SIGNAL,
  PRIMES,
  POINTER_CUT_OFF,
  newCycle
} from './HashingCommon';
import { translateInput } from '../parameters/helpers/ParamHelper';
import HashingDelete from './HashingDelete';

// Bookmarks to link chunker with pseudocode
const IBookmarks = {
  Init: 1,
  EmptyArray: 1, // XXX delete init code
  InitInsertion: 1, // XXX delete init code
  // IncrementInsertions: 4,
  Hash1: 5,
  ChooseIncrement: 6,
  Probing: 7,
  Collision: 8,
  PutIn: 9,
  Done: 10,
  BulkInsert: 1,
  CheckTableFull: 19,
  NewTable: 30,
  ReinsertLoop: 31,
  ReinsertKey: 32,
  CheckTableFullDel: 20,
}
const rightarrow = " \u{2192} ";

/**
 * Create new arrays for expanded table
 * @param {*} table the table to keep track of the internal and illustrated array
 * @returns the new table, and the index, value, variable arrays for the visualiser
 */
function expandTable(table, nextSize) {
  if (nextSize === undefined) return [null, null, null, null];

  return [
    new Array(nextSize).fill(undefined), // fill so table.length OK
    Array.from({ length: nextSize }, (_, i) => i),
    Array(nextSize).fill(EMPTY_CHAR),
    Array(nextSize).fill('')
  ]
}

export default {
  explanation: HashingExp,

  // Initialize visualizers
  initVisualisers() {
    return {
      array: {
        instance: new Array2DTracer('array', null, 'Hash Table'),
        order: 0,
      },
      graph: {
        instance: new GraphTracer('graph', null, 'Hashing Functions'),
        order: 1,
      },
    };
  },

  /**
   * Run function for insertion, using the user input to display the illustration through chunker
   * @param {*} chunker the chunker for the illustrations
   * @param {*} params different parameters of the algorithm insertion mode e.g. name, array size,...
   * @returns a table of concluding array to serve testing purposes
   */
  run(chunker, params) {
    // Storing algorithms parameters as local variables
    const ALGORITHM_NAME = params.name;
    let inputs = params.values;
    const SIZE = params.hashSize;

    // Initialize arrays
    let indexArr = Array.from({ length: SIZE }, (_, i) => i);
    let valueArr = Array(SIZE).fill(EMPTY_CHAR);
    let nullArr = Array(SIZE).fill('');

    // Variable to keep track of insertions done and total inputs hashed into the table
    let insertions = 0;
    let total = 0;

    // expand table to allow insertion of given number of elements
    function expandAndReinsert(table, nElements) {
      let prevTable =
            table.filter(n => n !== undefined && n !== DELETE_CHAR);
      if (insertions < total/2 &&  // mostly Deleted slots
         insertions + nElements < table.length*0.8 )
      {
        [table, indexArr, valueArr, nullArr] =
          expandTable(table, table.length); // same size as before
        // XXX could add message re same table size
        chunker.add(
          IBookmarks.NewTable,
          (vis, size, array) => {
            // Initialize the array
            vis.array.set(array,
              params.name,
              '',
              INDEX,
              {
                rowLength: size > SMALL_SIZE ? SPLIT_SIZE : SMALL_SIZE,
                rowHeader: ['Index', 'Value', '']
              }
            );
            vis.array.hideArrayAtIndex([POINTER]); // Hide pointer row intially
          },
          [table.length, table.length <= PRIMES[POINTER_CUT_OFF] ?
            [indexArr, valueArr, nullArr] :
            [indexArr, valueArr]
          ]
        )
      } else {
        // choose next prime until load factor will be < 80%
        // or we hit max size
        let nextSize = table.length;
        do {
           nextSize = PRIMES[PRIMES.indexOf(nextSize) + 1];
        } while (insertions + nElements >= nextSize*0.8 &&
                   nextSize < LARGE_SIZE);
        [table, indexArr, valueArr, nullArr] =
          expandTable(table, nextSize);
        // XXX could add message re increased table size
        chunker.add(
          IBookmarks.NewTable,
          (vis, size, array) => {
            // Increase Array2D visualizer render space
            // XXX refine; doesn't re-size dynamically, only at init
            // currently it seems
            if (SIZE === LARGE_SIZE) {
              vis.array.setSize(6);
              vis.array.setZoom(0.7);
              vis.graph.setZoom(3.5);
            } else if (SIZE > SMALL_SIZE) {
              vis.array.setSize(4);
              vis.array.setZoom(0.8);
              vis.graph.setZoom(2.5);
            } else {
              vis.array.setSize(3);
              vis.array.setZoom(1);
              vis.graph.setZoom(2);
            }
            // Initialize the array
            vis.array.set(array,
              params.name,
              '',
              INDEX,
              {
                rowLength: size > SMALL_SIZE ? SPLIT_SIZE : SMALL_SIZE,
                rowHeader: ['Index', 'Value', '']
              }
            );
            vis.array.hideArrayAtIndex([POINTER]); // Hide pointer row intially
          },
          [table.length, table.length <= PRIMES[POINTER_CUT_OFF] ?
            [indexArr, valueArr, nullArr] :
            [indexArr, valueArr]
          ]
        )
      }
      if (prevTable.length === 0) {
        chunker.add(
          IBookmarks.ReinsertLoop,
          (vis, total, table) => {
            vis.array.showKth({fullCheck: "No keys to reinsert"});
          },
          [total, table]
        )
      }
      // recompute insertions and total (insertions shouldn't change but
      // because deleted slots are eliminated, total may decrease)
      insertions = 0;
      total = 0;
      while (prevTable.length > 0) {
        let key = prevTable[0];
        prevTable.shift();
        hashReinsert(table, key, prevTable);
        insertions++; // Increment insertions
        total++; // Increment total
      }
      return [table, indexArr, valueArr, nullArr];
    }

    /**
     * Insertion function for each key
     * @param {*} table the table to keep track of the internal and illustrated array
     * @param {*} key the key to insert
     * @param {*} prevIdx previous index of the previous key
     * @param {*} isBulkInsert whether it is bulk insert or not
     * @returns the index the key is assigned
     */
    function hashInsert(table, key) {
      chunker.add(
        IBookmarks.InitInsertion,
        (vis, target) => {

          vis.array.showKth({key: target, insertions: vis.array.getKth().insertions, type: HASH_TYPE.Insert}); // Show stats

          newCycle(vis, SIZE, key, ALGORITHM_NAME); // New insert cycle
        },
        [key]
      );

      // Chunker for when table is full
      const limit = () => {
        if (params.expand && table.length < LARGE_SIZE)
          return total + 1 === Math.round(table.length * 0.8);
        return total === table.length - 1;
      }
      // Quit time:( too full and can't expand
      if (total === table.length - 1 && !(params.expand && table.length < LARGE_SIZE)) {
/* chunk done at caller
        chunker.add(
          IBookmarks.CheckTableFull,
          (vis, total, table) => {
            vis.array.showKth({fullCheck: "Table is too full " + total + "/" + table.length
              + rightarrow + "Stopping..."});
          },
          [total, table]
        )
*/
        return [true, null, null, null, null];
      // Expand time:| Full-ish (load factor will hit 80%) but can expand
      // XXX should avoid magic number etc
      // XXX adjust for chaining some time
      } else if (params.expand && table.length < LARGE_SIZE && total + 1 >= Math.round(table.length * 0.8)) {
      // XXX Could distinguish between expansion and rebuild with same size
        chunker.add(
          IBookmarks.CheckTableFull,
          (vis, total, table) => {
            vis.array.showKth({fullCheck: "Table is quite full " + total + "/" + table.length
              + rightarrow + "Reconstructing table..."});
          },
          [total, table]
        );
        [table, indexArr, valueArr, nullArr] = expandAndReinsert(table, 1)
      } else {
        chunker.add(
          IBookmarks.CheckTableFull,
          (vis, total, table) => {
            vis.array.showKth({fullCheck: "Table has enough space " + total + "/" + table.length });
          },
          [total, table]
        );
      }
      // Proceed time:) - Enough space (now) to insert element

      // Get initial hash index for current key
      let i = hash1(chunker, IBookmarks.Hash1, key, table.length, true, HASH_TYPE.Insert);

      // Calculate increment for current key
      let increment = setIncrement(
        chunker,
        IBookmarks.ChooseIncrement,
        key,
        table.length,
        ALGORITHM_NAME,
        HASH_TYPE.Insert,
        true
      );

      // Chunker for first pending slot
      chunker.add(
        IBookmarks.Probing,
        (vis, idx) => {

          // Pointer only appear for small table
          if (table.length < PRIMES[POINTER_CUT_OFF]) {
            vis.array.assignVariable(POINTER_VALUE, POINTER, idx);
          }

          vis.array.fill(INDEX, idx, undefined, undefined, Colors.Pending); // Color pending slot

          // Uncolor the hashing graph
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
      )

      // Internal code for probing, while loop indicates finding an empty slot for insertion
      while (table[i] !== undefined && table[i] !== key && table[i] !== DELETE_CHAR) {
        let prevI = i;
        i = (i + increment) % table.length; // This is to ensure the index never goes over table size

        // Chunker for collision
        chunker.add(
          IBookmarks.Collision,
          (vis, idx, curri) => {
            vis.array.fill(INDEX, idx, undefined, undefined, Colors.Collision); // Fill the slot with red, indicating collision
            // Pointer only appears for small tables
            if (table.length < PRIMES[POINTER_CUT_OFF])
              vis.array.assignVariable(POINTER_VALUE, POINTER, curri);
          },
          [prevI, i]
        )

        // Chunker for Probing
        chunker.add(
          IBookmarks.Probing,
          (vis, idx) => {

            // Pointer only appears for small tables
            if (table.length < PRIMES[POINTER_CUT_OFF]) {
              vis.array.assignVariable(POINTER_VALUE, POINTER, idx);
            }
            vis.array.fill(INDEX, idx, undefined, undefined, Colors.Pending); // Filling the pending slot with yellow
          },
          [i]
        )
      }

      if (table[i] !== key) {
        insertions++; // Increment insertions
        total++; // Increment total
        table[i] = key; // Internally assign the key to the index
      }
      // XXX could have alternative animation for duplicated keys

      // Chunker for placing the key
      chunker.add(
        IBookmarks.PutIn,
        (vis, val, idx) => {
          vis.array.updateValueAt(VALUE, idx, val); // Update value of that index
          vis.array.fill(INDEX, idx, undefined, undefined, Colors.Insert); // Fill it green, indicating successful insertion
        },
        [key, i, insertions]
      )

      return [false, table, indexArr, valueArr, nullArr];
    }


    /**
     * Function for bulk insertion
     * @param {*} table the table to keep track of the internal and illustrated array
     * @param {*} keys the keys to insert
     * @returns the index the last key is assigned
     */
    function hashBulkInsert(table, keys) {
      let lastHash;
      let inserts = {};
      let bulkInsertions = 0;
      let prevTable = [...table];
      let nElements = keys.length;
      if (!params.expand && total + nElements >= table.length)
        return [true, [], [], [], []]; // not enough space
      if (params.expand && total + nElements >= LARGE_SIZE)
        return [true, [], [], [], []]; // not enough space
      if (params.expand && total + nElements >= Math.round(table.length * 0.8))
        [table, indexArr, valueArr, nullArr] =
          expandAndReinsert(table, nElements);
      for (const key of keys) {

        // hashed value
        let i = hash1(null, null, key, table.length, false, HASH_TYPE.BulkInsert);

        // increment for probing
        let increment = setIncrement(
          null,
          null,
          key,
          table.length,
          ALGORITHM_NAME,
          HASH_TYPE.BulkInsert,
          false
        );

        while (table[i] !== undefined && table[i] !== key && table[i] !== DELETE_CHAR) {
          i = (i + increment) % table.length; // This is to ensure the index never goes over table size
        }
        if (table[i] !== key) {
          bulkInsertions++;
          table[i] = key;
        }
        inserts[key] = i;
        lastHash = i;
      }

      insertions += bulkInsertions;
      total += bulkInsertions;
      chunker.add(
        IBookmarks.PutIn,
        (vis, keys, inserts, insertions) => {
          for (const key of keys) {
            vis.array.updateValueAt(VALUE, inserts[key], key); // Update value of that index
            vis.array.fill(INDEX, inserts[key], undefined, undefined, Colors.Insert);
          }
          vis.array.showKth({key: vis.array.getKth().key, type: HASH_TYPE.BulkInsert, insertions: insertions});
        },
        [keys, inserts, insertions]
      )

      return [false, table, indexArr, valueArr, nullArr];
    }


    /**
     * ReInsertion function for inserted key to new table
     * @param {*} table the table to keep track of the internal and illustrated array
     * @param {*} key the key to reinsert
     * @param {*} prevTable rrray of emaining keys from old table to be inserted
     * @returns the index the key is assigned
     */
    // XXX should refactor code...
    // We want to at least have the option of not showing all the details by
    // collapsing some pseudocode; currently just comment out all but one chunk
    function hashReinsert(table, key, prevTable) {
/*
      chunker.add(
        IBookmarks.ReinsertKey,
        (vis, prevTable, table) => {
          newCycle(vis, table.length, key, ALGORITHM_NAME); // New insert cycle
          vis.array.showKth({
            reinserting: key,
            toReinsert: `${prevTable.slice(0, REINSERT_CAPTION_LEN)}` +
              ((prevTable.length > REINSERT_CAPTION_LEN) ? `,...` : ``)
          });
        },
        [prevTable, table]
      )
*/


      // Get initial hash index for current key
      let i = hash1(
        chunker,
        IBookmarks.CheckTableFull,
        key,
        table.length,
        false,
        HASH_TYPE.Insert
      );

      // Calculate increment for current key
      let increment = setIncrement(
        chunker,
        IBookmarks.CheckTableFull,
        key,
        table.length,
        ALGORITHM_NAME,
        HASH_TYPE.Insert,
        false
      );

/*
        // Chunker for first pending slot
      chunker.add(
        IBookmarks.CheckTableFull,
        (vis, idx) => {

          // Pointer only appear for small table
          if (table.length <= PRIMES[POINTER_CUT_OFF]) {
            vis.array.assignVariable(POINTER_VALUE, POINTER, idx);
          }

          vis.array.fill(INDEX, idx, undefined, undefined, Colors.Pending); // Color pending slot

          // Uncolor the hashing graph
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
      )
*/

      // Internal code for probing, while loop indicates finding an empty slot for insertion
      while (table[i] !== undefined && table[i] !== key && table[i] !== DELETE_CHAR) {
        let prevI = i;
        i = (i + increment) % table.length; // This is to ensure the index never goes over table size

/*
        // Chunker for collision
        chunker.add(
          IBookmarks.CheckTableFull,
          (vis, idx) => {
            vis.array.fill(INDEX, idx, undefined, undefined, Colors.Collision); // Fill the slot with red, indicating collision
          },
          [prevI]
        )

        // Chunker for Probing
        chunker.add(
         IBookmarks.CheckTableFull,
          (vis, idx) => {

            // Pointer only appears for small tables
            if (table.length <= PRIMES[POINTER_CUT_OFF]) {
              vis.array.assignVariable(POINTER_VALUE, POINTER, idx);
            }
            vis.array.fill(INDEX, idx, undefined, undefined, Colors.Pending); // Filling the pending slot with yellow
          },
          [i]
        )
*/
      }

      // Internally assign the key to the index
      table[i] = key;

      const REINSERT_CAPTION_LEN = 5;

      // Chunker for placing the key
      chunker.add(
        IBookmarks.ReinsertKey,
        (vis, val, idx, prevTable, table) => {
          newCycle(vis, table.length, val, ALGORITHM_NAME); // New insert cycle
          vis.graph.updateNode(HASH_GRAPH.Value, idx, ''); // add hash value
          vis.graph.select(HASH_GRAPH.Value);
          let rest = (prevTable.length > 0 ?
                       `${prevTable.slice(0, REINSERT_CAPTION_LEN)}` +
                            ((prevTable.length > REINSERT_CAPTION_LEN) ? `,...` : ``)
                     : 'None');
          vis.array.showKth({
            reinserting: key,
            toReinsert: rest
          });
          vis.array.updateValueAt(VALUE, idx, val); // Update value of that index
          vis.array.fill(INDEX, idx, undefined, undefined, Colors.Insert); // Fill it green, indicating successful insertion
        },
        [key, i, prevTable, table]
      )

      // Return the insertion index
      return i;
    }


    // Inserting inputs
    let prevIdx;
    // Init hash table
    let table = new Array(SIZE).fill(undefined); // fill so table.length OK
    let prevTable;
    // Last input index
    let lastInput = 0;

/*
    // main loop allowing table extension (moved after some init chunks)
*/
      prevIdx = null;

      chunker.add(
        IBookmarks.Init,
        (vis, size, array) => {
          // Increase Array2D visualizer render space
          if (SIZE === LARGE_SIZE) {
            vis.array.setSize(6);
            vis.array.setZoom(0.7);
            vis.graph.setZoom(3.5);
          } else {
            vis.array.setSize(3);
            vis.array.setZoom(1);
            vis.graph.setZoom(2);
          }

          // Initialize the array
          vis.array.set(array,
            params.name,
            '',
            INDEX,
            {
              rowLength: size > SMALL_SIZE ? SPLIT_SIZE : SMALL_SIZE,
              rowHeader: ['Index', 'Value', '']
            }
          );

          // vis.array.hideArrayAtIndex([VALUE, POINTER]); // Hide value and pointer row intially
          vis.array.hideArrayAtIndex([POINTER]); // Hide pointer row intially

          vis.graph.weighted(true);

          // Intialize the graphs
          switch (ALGORITHM_NAME) {
            case "HashingLP" :
              vis.graph.set([[0, 'Hash'], [0, 0]], [' ', ' '], [[-5, 0], [5, 0]]);
              break;
            case "HashingDH" :
              vis.graph.set([
                [0, 'Hash1', 0, 0], [0, 0, 0, 0], [0, 0, 0, 'Hash2'], [0, 0, 0, 0]], // Node edges
                [' ', ' ', ' ', ' '], // Node values
                [[-15, 0], [-5, 0], [5, 0], [15, 0]]); // Node positions
              break;
          }
        },
        [table.length, table.length <= PRIMES[POINTER_CUT_OFF] ?
          [indexArr, valueArr, nullArr] :
          [indexArr, valueArr]
        ]
      );

/*
      // Chunker to initialize empty array visually
      chunker.add(
        IBookmarks.EmptyArray,
        (vis) => {
          // Show the value row
          vis.array.hideArrayAtIndex(POINTER);
        },
      );

      // Chunker for intializing insertion stat
      chunker.add(
        IBookmarks.InitInsertion,
        (vis, insertions) => {
          vis.array.showKth(
            {
              key: "",
              type: EMPTY_CHAR,
              insertions: insertions,
              increment: "",
            }
          );
        },
        [insertions]
      )
*/

      // Magic numbers for length of splitting a postive integer string by "-", the index of "", and the number to delete when a negative integer is split by "-"
      const POS_INTEGER_SPLIT_LENGTH = 1;
      const EMPTY_DELETE_SPLIT_INDEX = 0;
      const NUMBER_DELETE_SPLIT_INDEX = 1;

    // main loop allowing table extension
    // Now not needed - table expansion code has been expanded...

/*
      if (params.expand && (lastInput !== 0)) {
        while (prevTable.length > 0) {
          let key = prevTable[0];
          prevTable.shift();
          hashReinsert(table, key, prevTable);
        }
      }
*/

      for (let i = lastInput; i < inputs.length; i++) {
        let item = inputs[i];

        // Different cases of insertion and deletion
        let split_arr = item.split("-");
        if (split_arr.length == POS_INTEGER_SPLIT_LENGTH) { // When the input is a positive integer -> normal insert
          for (const key of translateInput(item, "Array")) {
            let quitFlag;
            [quitFlag, table, indexArr, valueArr, nullArr] = hashInsert(table, key);
            if (quitFlag) {
              chunker.add(
                IBookmarks.CheckTableFull,
                (vis, total, table) => {
                  vis.array.showKth({fullCheck: "Table is too full to insert"
                    + rightarrow + "Stopping!"});
                },
                [total, table]
              );
              return table;
            }
          }
        }
        else {
          if (split_arr[EMPTY_DELETE_SPLIT_INDEX] === "") { // When the input is a negative integer -> delete
            let key = Number(split_arr[NUMBER_DELETE_SPLIT_INDEX]);
            // XXX HashingDelete should affect insertions, not total??
            insertions = HashingDelete(chunker, params, key, table, insertions);
          }
          else { // When the input is a range -> bulk insert
            // Preparation for bulk insertion
            // XXX better check enough space here and say too full if
            // required
            chunker.add(
              IBookmarks.CheckTableFull,
              // IBookmarks.BulkInsert,
              (vis, insertions, prevIdx, table) => {
                vis.array.unfill(INDEX, 0, undefined, table.length - 1); // Reset any coloring of slots
                vis.array.showKth({key: item, type: HASH_TYPE.BulkInsert, insertions: insertions, increment: ""});
console.log(table.length, PRIMES[POINTER_CUT_OFF], prevIdx, POINTER);
                // if (table.length <= PRIMES[POINTER_CUT_OFF]) {
                  // vis.array.assignVariable("", POINTER, prevIdx, POINTER_VALUE); // Hide pointer
                // }
                vis.graph.updateNode(HASH_GRAPH.Key, ' ', '');
                vis.graph.updateNode(HASH_GRAPH.Value, ' ', '');
                if (ALGORITHM_NAME === "HashingDH") {
                  vis.graph.updateNode(HASH_GRAPH.Key2, ' ', '');
                  vis.graph.updateNode(HASH_GRAPH.Value2, ' ', '');
                }
              },
              [insertions, prevIdx, table]
            )
            let quitFlag;
            [quitFlag, table, indexArr, valueArr, nullArr] =
                hashBulkInsert(table, translateInput(item, "Array"));
            if (quitFlag) {
              chunker.add(
                IBookmarks.CheckTableFull,
                (vis, total, table) => {
                  vis.array.showKth({fullCheck: "Table is too full for bulk insert"
                    + rightarrow + "Stopping!"});
                },
                [total, table]
              );
              return table;
            }
          }
        }

      }
    // } while (params.expand && (prevIdx === FULL_SIGNAL) && (table.length < LARGE_SIZE));

    // Chunker for resetting visualizers in case of new insertion cycle
    chunker.add(
      IBookmarks.Done,
      (vis, table) => {

        vis.array.showKth({key: "", type: EMPTY_CHAR, insertions: insertions, increment: ""}) // Nullify some stats, for better UI

        // Hide pointer
        if (table.length <= PRIMES[POINTER_CUT_OFF]) {
          vis.array.assignVariable(POINTER_VALUE, POINTER, undefined);
        }

        vis.array.unfill(INDEX, 0, undefined, table.length - 1); // Unfill all boxes

        // Reset graphs and uncolor the graph if needed
        vis.graph.updateNode(HASH_GRAPH.Key, ' ', '');
        vis.graph.updateNode(HASH_GRAPH.Value, ' ', '');
        if (ALGORITHM_NAME === 'HashingDH') {
          vis.graph.updateNode(HASH_GRAPH.Key2, ' ', '');
          vis.graph.updateNode(HASH_GRAPH.Value2, ' ', '');
        }
      },
      [table]
    )

    return table; // Return resulting array for testing
  },
};
