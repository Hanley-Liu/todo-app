/**
 * Todo App — Unit Tests
 *
 * A minimal, dependency-free test runner for Node.js.
 * Covers the pure state functions (addTodo, toggleTodo, deleteTodo),
 * persistence functions (saveToLocalStorage, loadFromLocalStorage),
 * and supporting helpers (hasValidInput, isValidTodo, sanitizeTodos).
 *
 * Run:  node tests/app.test.js
 */
(function () {
  'use strict';

  var app = require('../app.js');

  // -------------------------------------------------------------------------
  // Minimal Test Runner
  // -------------------------------------------------------------------------

  var passed = 0;
  var failed = 0;
  var currentSuite = null;

  function suite(name) {
    currentSuite = name;
    console.log('\n' + name);
    console.log(Array(name.length + 1).join('-'));
  }

  function test(name, fn) {
    try {
      fn();
      passed++;
      console.log('  \u2713 ' + name);
    } catch (e) {
      failed++;
      console.log('  \u2717 ' + name);
      console.log('    ' + (e && e.message ? e.message : e));
    }
  }

  // --- Assertion helpers ---
  function assertEqual(actual, expected, msg) {
    if (actual !== expected) {
      throw new Error(
        (msg || 'assertEqual') +
          ': expected ' + JSON.stringify(expected) +
          ', got ' + JSON.stringify(actual)
      );
    }
  }

  function assertDeepEqual(actual, expected, msg) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(
        (msg || 'assertDeepEqual') +
          ': expected ' + JSON.stringify(expected) +
          ', got ' + JSON.stringify(actual)
      );
    }
  }

  function assertTrue(val, msg) {
    if (!val) {
      throw new Error((msg || 'assertTrue') + ': expected truthy value, got ' + JSON.stringify(val));
    }
  }

  function assertFalse(val, msg) {
    if (val) {
      throw new Error((msg || 'assertFalse') + ': expected falsy value, got ' + JSON.stringify(val));
    }
  }

  function assertThrows(fn, msg) {
    try {
      fn();
    } catch (e) {
      return; // expected
    }
    throw new Error((msg || 'assertThrows') + ': expected an error to be thrown');
  }

  // -------------------------------------------------------------------------
  // Mock localStorage for persistence tests
  // -------------------------------------------------------------------------

  function createMockStorage() {
    var store = {};
    return {
      getItem: function (key) {
        return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
      },
      setItem: function (key, value) {
        store[key] = String(value);
      },
      removeItem: function (key) {
        delete store[key];
      },
      clear: function () {
        store = {};
      },
    };
  }

  // Save / restore real global.localStorage
  var originalLocalStorage = global.localStorage;

  function installMockStorage() {
    global.localStorage = createMockStorage();
  }

  function uninstallMockStorage() {
    if (originalLocalStorage === undefined) {
      delete global.localStorage;
    } else {
      global.localStorage = originalLocalStorage;
    }
  }

  // A storage that always throws on setItem (simulates private mode / quota)
  function createThrowingStorage() {
    return {
      getItem: function () { return null; },
      setItem: function () { throw new Error('QuotaExceededError'); },
      removeItem: function () {},
      clear: function () {},
    };
  }

  // -------------------------------------------------------------------------
  // Tests
  // -------------------------------------------------------------------------

  // --- hasValidInput ---
  suite('hasValidInput');

  test('returns true for non-empty text', function () {
    assertTrue(app.hasValidInput('hello'));
  });

  test('returns true for text with leading/trailing spaces', function () {
    assertTrue(app.hasValidInput('  hello  '));
  });

  test('returns false for empty string', function () {
    assertFalse(app.hasValidInput(''));
  });

  test('returns false for whitespace-only string', function () {
    assertFalse(app.hasValidInput('   '));
  });

  test('returns false for tab-only string', function () {
    assertFalse(app.hasValidInput('\t\t'));
  });

  test('returns false for non-string input', function () {
    assertFalse(app.hasValidInput(null));
    assertFalse(app.hasValidInput(undefined));
    assertFalse(app.hasValidInput(123));
  });

  // --- createTodo ---
  suite('createTodo');

  test('creates a todo with correct text and completed=false', function () {
    var todo = app.createTodo('Buy milk');
    assertEqual(todo.text, 'Buy milk', 'text');
    assertFalse(todo.completed, 'completed');
  });

  test('generates a non-empty string id', function () {
    var todo = app.createTodo('Test');
    assertTrue(typeof todo.id === 'string', 'id should be string');
    assertTrue(todo.id.length > 0, 'id should be non-empty');
  });

  test('generates unique ids for separate calls', function () {
    var a = app.createTodo('A');
    var b = app.createTodo('B');
    assertTrue(a.id !== b.id, 'ids should differ');
  });

  // --- addTodo ---
  suite('addTodo');

  test('adds a new todo to an empty array', function () {
    var result = app.addTodo([], 'Walk dog');
    assertEqual(result.length, 1, 'array length');
    assertEqual(result[0].text, 'Walk dog', 'todo text');
    assertFalse(result[0].completed, 'completed');
  });

  test('appends to an existing array (does not mutate original)', function () {
    var original = [app.createTodo('Existing')];
    var result = app.addTodo(original, 'New task');
    assertEqual(result.length, 2, 'result has 2 items');
    assertEqual(original.length, 1, 'original unchanged');
    assertEqual(result[1].text, 'New task', 'second item');
  });

  test('trims whitespace from the todo text', function () {
    var result = app.addTodo([], '  Buy milk  ');
    assertEqual(result[0].text, 'Buy milk', 'text trimmed');
  });

  test('ignores empty input (returns same array reference)', function () {
    var original = [];
    var result = app.addTodo(original, '');
    assertEqual(result.length, 0, 'empty input ignored');
    assertEqual(result, original, 'same array reference returned');
  });

  test('ignores whitespace-only input', function () {
    var original = [];
    var result = app.addTodo(original, '   ');
    assertEqual(result.length, 0, 'whitespace input ignored');
  });

  test('ignores empty input when array is non-empty', function () {
    var original = [app.createTodo('Existing')];
    var result = app.addTodo(original, '');
    assertEqual(result.length, 1, 'array unchanged');
    assertEqual(result, original, 'same array reference returned');
  });

  test('ignores null / undefined / non-string input', function () {
    var result = app.addTodo([], null);
    assertEqual(result.length, 0, 'null ignored');
    result = app.addTodo([], undefined);
    assertEqual(result.length, 0, 'undefined ignored');
  });

  // --- toggleTodo ---
  suite('toggleTodo');

  test('toggles a todo from incomplete to complete', function () {
    var todo = app.createTodo('Task');
    var result = app.toggleTodo([todo], todo.id);
    assertEqual(result.length, 1, 'still one item');
    assertTrue(result[0].completed, 'now completed');
  });

  test('toggles a todo from complete to incomplete', function () {
    var todo = app.createTodo('Task');
    todo.completed = true;
    var result = app.toggleTodo([todo], todo.id);
    assertFalse(result[0].completed, 'now incomplete');
  });

  test('does not mutate the original array or objects', function () {
    var todo = app.createTodo('Task');
    var original = [todo];
    var result = app.toggleTodo(original, todo.id);
    assertFalse(original[0].completed, 'original unchanged');
    assertTrue(result[0] !== original[0], 'new object created');
  });

  test('leaves other todos unchanged when toggling one', function () {
    var t1 = app.createTodo('A');
    var t2 = app.createTodo('B');
    t2.completed = true;
    var result = app.toggleTodo([t1, t2], t1.id);
    assertTrue(result[0].completed, 't1 now completed');
    assertTrue(result[1].completed, 't2 still completed');
  });

  test('returns same-length array when id not found', function () {
    var todo = app.createTodo('Task');
    var result = app.toggleTodo([todo], 'nonexistent-id');
    assertEqual(result.length, 1, 'length unchanged');
    assertFalse(result[0].completed, 'unchanged');
  });

  test('handles empty array', function () {
    var result = app.toggleTodo([], 'any-id');
    assertEqual(result.length, 0, 'empty array');
  });

  // --- deleteTodo ---
  suite('deleteTodo');

  test('removes the todo with the matching id', function () {
    var t1 = app.createTodo('A');
    var t2 = app.createTodo('B');
    var t3 = app.createTodo('C');
    var result = app.deleteTodo([t1, t2, t3], t2.id);
    assertEqual(result.length, 2, '2 remaining');
    assertEqual(result[0].id, t1.id, 'first is t1');
    assertEqual(result[1].id, t3.id, 'second is t3');
  });

  test('does not mutate the original array', function () {
    var t1 = app.createTodo('A');
    var t2 = app.createTodo('B');
    var original = [t1, t2];
    var result = app.deleteTodo(original, t2.id);
    assertEqual(original.length, 2, 'original unchanged');
    assertEqual(result.length, 1, 'result has 1');
    assertTrue(result !== original, 'new array returned');
  });

  test('returns same array length when id not found', function () {
    var t1 = app.createTodo('A');
    var result = app.deleteTodo([t1], 'nonexistent-id');
    assertEqual(result.length, 1, 'unchanged');
  });

  test('handles empty array', function () {
    var result = app.deleteTodo([], 'any-id');
    assertEqual(result.length, 0, 'empty array');
  });

  test('can delete the only todo', function () {
    var t1 = app.createTodo('Only');
    var result = app.deleteTodo([t1], t1.id);
    assertEqual(result.length, 0, 'empty result');
  });

  // --- isValidTodo ---
  suite('isValidTodo');

  test('returns true for a valid Todo object', function () {
    assertTrue(app.isValidTodo({ id: '1', text: 'hello', completed: false }));
  });

  test('returns true for a completed Todo', function () {
    assertTrue(app.isValidTodo({ id: '1', text: 'hello', completed: true }));
  });

  test('returns false for missing id', function () {
    assertFalse(app.isValidTodo({ text: 'hello', completed: false }));
  });

  test('returns false for missing text', function () {
    assertFalse(app.isValidTodo({ id: '1', completed: false }));
  });

  test('returns false for missing completed', function () {
    assertFalse(app.isValidTodo({ id: '1', text: 'hello' }));
  });

  test('returns false for wrong field types', function () {
    assertFalse(app.isValidTodo({ id: 1, text: 'hello', completed: false }));
    assertFalse(app.isValidTodo({ id: '1', text: 42, completed: false }));
    assertFalse(app.isValidTodo({ id: '1', text: 'hello', completed: 'yes' }));
  });

  test('returns false for null', function () {
    assertFalse(app.isValidTodo(null));
  });

  test('returns false for non-object', function () {
    assertFalse(app.isValidTodo('string'));
    assertFalse(app.isValidTodo(42));
    assertFalse(app.isValidTodo(undefined));
  });

  // --- sanitizeTodos ---
  suite('sanitizeTodos');

  test('returns a clean array when input is a valid array', function () {
    var input = [
      { id: '1', text: 'A', completed: false },
      { id: '2', text: 'B', completed: true },
    ];
    var result = app.sanitizeTodos(input);
    assertEqual(result.length, 2, 'both valid');
  });

  test('filters out invalid entries from a mixed array', function () {
    var input = [
      { id: '1', text: 'A', completed: false },     // valid
      { id: 2, text: 'B', completed: false },        // invalid: id is number
      { text: 'no id', completed: false },            // invalid: missing id
      { id: '3', text: 'C', completed: 'yes' },      // invalid: completed is string
      null,                                            // invalid: null
      'string',                                        // invalid: not object
      { id: '4', text: 'D', completed: false },       // valid
    ];
    var result = app.sanitizeTodos(input);
    assertEqual(result.length, 2, 'only 2 valid');
    assertEqual(result[0].id, '1', 'first valid');
    assertEqual(result[1].id, '4', 'second valid');
  });

  test('returns empty array for non-array input', function () {
    assertDeepEqual(app.sanitizeTodos(null), []);
    assertDeepEqual(app.sanitizeTodos('string'), []);
    assertDeepEqual(app.sanitizeTodos({ a: 1 }), []);
    assertDeepEqual(app.sanitizeTodos(undefined), []);
  });

  test('returns empty array for empty input array', function () {
    assertDeepEqual(app.sanitizeTodos([]), []);
  });

  // --- saveToLocalStorage ---
  suite('saveToLocalStorage');

  test('saves todos to localStorage under the correct key', function () {
    installMockStorage();
    var todos = [
      { id: 'a1', text: 'Task 1', completed: false },
      { id: 'b2', text: 'Task 2', completed: true },
    ];
    app.saveToLocalStorage(todos);
    var raw = global.localStorage.getItem(app.STORAGE_KEY);
    assertEqual(raw, JSON.stringify(todos), 'serialized correctly');
    uninstallMockStorage();
  });

  test('returns the todos array (for chaining)', function () {
    installMockStorage();
    var todos = [app.createTodo('X')];
    var result = app.saveToLocalStorage(todos);
    assertDeepEqual(result, todos, 'returns input');
    uninstallMockStorage();
  });

  test('uses the namespaced key "todo-app:todos"', function () {
    assertEqual(app.STORAGE_KEY, 'todo-app:todos', 'key value');
  });

  test('degrades gracefully when localStorage is unavailable', function () {
    // Temporarily remove localStorage
    var saved = global.localStorage;
    delete global.localStorage;
    var warnings = [];
    var origWarn = console.warn;
    console.warn = function (msg) { warnings.push(msg); };

    try {
      var todos = [app.createTodo('test')];
      var result = app.saveToLocalStorage(todos);
      assertDeepEqual(result, todos, 'returns todos despite no storage');
      assertTrue(warnings.length > 0, 'warning was logged');
    } finally {
      console.warn = origWarn;
      if (saved !== undefined) {
        global.localStorage = saved;
      }
    }
  });

  test('degrades gracefully when setItem throws', function () {
    global.localStorage = createThrowingStorage();
    var warnings = [];
    var origWarn = console.warn;
    console.warn = function (msg) { warnings.push(msg); };

    try {
      var todos = [app.createTodo('test')];
      var result = app.saveToLocalStorage(todos);
      assertDeepEqual(result, todos, 'returns todos despite error');
      assertTrue(warnings.length > 0, 'warning was logged');
    } finally {
      console.warn = origWarn;
      uninstallMockStorage();
    }
  });

  // --- loadFromLocalStorage ---
  suite('loadFromLocalStorage');

  test('returns empty array when nothing is stored', function () {
    installMockStorage();
    var result = app.loadFromLocalStorage();
    assertEqual(result.length, 0, 'empty');
    uninstallMockStorage();
  });

  test('loads and returns stored todos', function () {
    installMockStorage();
    var stored = [
      { id: 'a1', text: 'Store me', completed: false },
      { id: 'b2', text: 'Done task', completed: true },
    ];
    global.localStorage.setItem(app.STORAGE_KEY, JSON.stringify(stored));

    var result = app.loadFromLocalStorage();
    assertEqual(result.length, 2, 'two todos loaded');
    assertEqual(result[0].text, 'Store me', 'first text');
    assertFalse(result[0].completed, 'first incomplete');
    assertTrue(result[1].completed, 'second complete');
    uninstallMockStorage();
  });

  test('filters out invalid entries from stored data', function () {
    installMockStorage();
    var stored = [
      { id: '1', text: 'Valid', completed: false },
      { id: 2, text: 'Invalid id', completed: false },
      { text: 'No id', completed: false },
      null,
      'not-an-object',
      { id: '2', text: 'Also valid', completed: true },
    ];
    global.localStorage.setItem(app.STORAGE_KEY, JSON.stringify(stored));

    var result = app.loadFromLocalStorage();
    assertEqual(result.length, 2, 'only valid entries');
    assertEqual(result[0].id, '1', 'first valid id');
    assertEqual(result[1].id, '2', 'second valid id');
    uninstallMockStorage();
  });

  test('returns empty array when stored data is not an array', function () {
    installMockStorage();
    global.localStorage.setItem(app.STORAGE_KEY, JSON.stringify({ not: 'array' }));
    var result = app.loadFromLocalStorage();
    assertEqual(result.length, 0, 'empty');
    uninstallMockStorage();
  });

  test('returns empty array when stored JSON is corrupted', function () {
    installMockStorage();
    global.localStorage.setItem(app.STORAGE_KEY, '{invalid json}}}');
    var warnings = [];
    var origWarn = console.warn;
    console.warn = function () { warnings.push(Array.prototype.slice.call(arguments)); };

    try {
      var result = app.loadFromLocalStorage();
      assertEqual(result.length, 0, 'empty result');
      assertTrue(warnings.length > 0, 'warning was logged');
    } finally {
      console.warn = origWarn;
      uninstallMockStorage();
    }
  });

  test('degrades gracefully when localStorage is unavailable', function () {
    var saved = global.localStorage;
    delete global.localStorage;

    try {
      var result = app.loadFromLocalStorage();
      assertDeepEqual(result, [], 'empty array without storage');
    } finally {
      if (saved !== undefined) {
        global.localStorage = saved;
      }
    }
  });

  // --- Integration: round-trip save then load ---
  suite('Persistence Round-Trip (Integration)');

  test('saved todos survive a save/load cycle with states intact', function () {
    installMockStorage();
    var original = [
      { id: 'x1', text: 'Task A', completed: false },
      { id: 'y2', text: 'Task B', completed: true },
      { id: 'z3', text: 'Task C', completed: false },
    ];
    app.saveToLocalStorage(original);

    var loaded = app.loadFromLocalStorage();
    assertEqual(loaded.length, 3, 'same count');
    assertEqual(loaded[0].id, 'x1', 'same id x1');
    assertEqual(loaded[0].text, 'Task A', 'same text A');
    assertFalse(loaded[0].completed, 'same state A');
    assertEqual(loaded[1].id, 'y2', 'same id y2');
    assertTrue(loaded[1].completed, 'same state B');
    assertEqual(loaded[2].id, 'z3', 'same id z3');
    assertEqual(loaded[2].text, 'Task C', 'same text C');
    assertFalse(loaded[2].completed, 'same state C');
    uninstallMockStorage();
  });

  test('toggle + save + load preserves completion state', function () {
    installMockStorage();
    var todos = [app.createTodo('Toggle me')];
    todos = app.toggleTodo(todos, todos[0].id);
    app.saveToLocalStorage(todos);

    var loaded = app.loadFromLocalStorage();
    assertEqual(loaded.length, 1, 'one todo');
    assertTrue(loaded[0].completed, 'completion state preserved after reload');
    uninstallMockStorage();
  });

  test('delete + save + load preserves remaining items', function () {
    installMockStorage();
    var t1 = app.createTodo('Keep');
    var t2 = app.createTodo('Remove');
    var todos = [t1, t2];
    todos = app.deleteTodo(todos, t2.id);
    app.saveToLocalStorage(todos);

    var loaded = app.loadFromLocalStorage();
    assertEqual(loaded.length, 1, 'one remaining');
    assertEqual(loaded[0].id, t1.id, 'correct item kept');
    uninstallMockStorage();
  });

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------

  console.log('\n' + Array(41).join('='));
  console.log('Results: ' + passed + ' passed, ' + failed + ' failed');
  console.log(Array(41).join('='));

  process.exit(failed > 0 ? 1 : 0);
})();
