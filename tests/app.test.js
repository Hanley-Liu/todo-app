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

  // --- Install mock document BEFORE requiring app.js ---
  // app.js checks for document at module load time (init guards)
  var mockDocument = {
    createElement: function (tag) {
      var el = {
        tagName: tag.toUpperCase(),
        className: '',
        dataset: {},
        children: [],
        childNodes: [],
        textContent: '',
        value: '',
        type: '',
        checked: false,
        disabled: false,
        maxLength: '',
        _classList: [],
        _className: '',
        _attrs: {},
        _eventListeners: {},
        appendChild: function (child) {
          this.children.push(child);
          this.childNodes.push(child);
          return child;
        },
        removeChild: function (child) {
          var idx = this.children.indexOf(child);
          if (idx > -1) this.children.splice(idx, 1);
          var cidx = this.childNodes.indexOf(child);
          if (cidx > -1) this.childNodes.splice(cidx, 1);
          return child;
        },
        querySelector: function (sel) {
          for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].className && this.children[i].className.indexOf(sel.slice(1)) > -1) {
              return this.children[i];
            }
          }
          return null;
        },
        querySelectorAll: function () { return []; },
        setAttribute: function (name, val) { this._attrs[name] = val; },
        getAttribute: function (name) { return this._attrs[name] || null; },
        addEventListener: function (type, fn) {
          this._eventListeners[type] = fn;
        },
        classList: {
          _classes: [],
          contains: function (cls) {
            return this._classes.indexOf(cls) > -1;
          },
          add: function (cls) {
            if (this._classes.indexOf(cls) === -1) this._classes.push(cls);
          },
          remove: function (cls) {
            var idx = this._classes.indexOf(cls);
            if (idx > -1) this._classes.splice(idx, 1);
          },
          toggle: function (cls, force) {
            if (force === undefined) {
              var idx = this._classes.indexOf(cls);
              if (idx > -1) this._classes.splice(idx, 1);
              else this._classes.push(cls);
            } else if (force) {
              if (this._classes.indexOf(cls) === -1) this._classes.push(cls);
            } else {
              var idx2 = this._classes.indexOf(cls);
              if (idx2 > -1) this._classes.splice(idx2, 1);
            }
          },
        },
        setSelectionRange: function () {},
        focus: function () {},
      };
      el.classList._classes = el._classList;
      Object.defineProperty(el, 'className', {
        get: function () { return el._className; },
        set: function (val) {
          el._className = val || '';
          el._classList.length = 0;
          if (val) {
            val.split(/\s+/).forEach(function (c) {
              if (c) el._classList.push(c);
            });
          }
        },
        configurable: true,
      });
      return el;
    },
    createDocumentFragment: function () {
      return {
        children: [],
        appendChild: function (el) {
          this.children.push(el);
          return el;
        },
      };
    },
    getElementById: function (id) {
      return null;
    },
    readyState: 'complete',
  };

  global.document = mockDocument;

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

  // --- Minimal DOM mocks for render/createTodoElement/updateAddButton tests ---

  function createMockList() {
    var children = [];
    return {
      children: children,
      appendChild: function (el) {
        if (el && el.children && el.tagName === undefined) {
          for (var i = 0; i < el.children.length; i++) {
            children.push(el.children[i]);
          }
          return el;
        }
        children.push(el);
        return el;
      },
      removeChild: function (el) {
        var idx = children.indexOf(el);
        if (idx > -1) children.splice(idx, 1);
        return el;
      },
      querySelector: function () { return null; },
      querySelectorAll: function () { return []; },
      addEventListener: function () {},
      get firstChild() {
        return children.length > 0 ? children[0] : null;
      },
    };
  }

  function createMockEmptyState() {
    return {
      classList: {
        _hidden: false,
        contains: function (cls) {
          if (cls === 'hidden') return this._hidden;
          return false;
        },
        add: function (cls) {
          if (cls === 'hidden') this._hidden = true;
        },
        remove: function (cls) {
          if (cls === 'hidden') this._hidden = false;
        },
        toggle: function (cls, force) {
          if (cls === 'hidden') this._hidden = force;
        },
      },
    };
  }

  function createMockInput(initialValue) {
    return {
      value: initialValue || '',
    };
  }

  function createMockButton() {
    return {
      disabled: false,
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

  // --- editTodo ---
  suite('editTodo');

  test('updates the text of the matching todo', function () {
    var t1 = app.createTodo('Old text');
    var result = app.editTodo([t1], t1.id, 'New text');
    assertEqual(result[0].text, 'New text', 'text updated');
  });

  test('trims whitespace from the new text', function () {
    var t1 = app.createTodo('Old');
    var result = app.editTodo([t1], t1.id, '  New text  ');
    assertEqual(result[0].text, 'New text', 'text trimmed');
  });

  test('does not mutate the original array or objects', function () {
    var t1 = app.createTodo('Old');
    var original = [t1];
    var result = app.editTodo(original, t1.id, 'New');
    assertEqual(original[0].text, 'Old', 'original unchanged');
    assertTrue(result[0] !== original[0], 'new object created');
  });

  test('leaves other todos unchanged when editing one', function () {
    var t1 = app.createTodo('A');
    var t2 = app.createTodo('B');
    var result = app.editTodo([t1, t2], t1.id, 'A-edited');
    assertEqual(result[0].text, 'A-edited', 't1 edited');
    assertEqual(result[1].text, 'B', 't2 unchanged');
  });

  test('ignores empty input (returns same array)', function () {
    var t1 = app.createTodo('Original');
    var result = app.editTodo([t1], t1.id, '');
    assertDeepEqual(result, [t1], 'same array returned');
  });

  test('ignores whitespace-only input', function () {
    var t1 = app.createTodo('Original');
    var result = app.editTodo([t1], t1.id, '   ');
    assertDeepEqual(result, [t1], 'same array returned');
  });

  test('returns same-length array when id not found', function () {
    var t1 = app.createTodo('Task');
    var result = app.editTodo([t1], 'nonexistent-id', 'New');
    assertEqual(result.length, 1, 'unchanged');
    assertEqual(result[0].text, 'Task', 'text unchanged');
  });

  test('handles empty array', function () {
    var result = app.editTodo([], 'any-id', 'New');
    assertEqual(result.length, 0, 'empty array');
  });

  // --- filterTodos ---
  suite('filterTodos');

  test('returns all todos when filter is "all"', function () {
    var todos = [
      app.createTodo('A'),
      app.createTodo('B'),
    ];
    todos[0].completed = true;
    var result = app.filterTodos(todos, 'all');
    assertEqual(result.length, 2, 'all returned');
  });

  test('returns only incomplete todos when filter is "active"', function () {
    var todos = [
      app.createTodo('A'),
      app.createTodo('B'),
      app.createTodo('C'),
    ];
    todos[0].completed = true;
    todos[2].completed = true;
    var result = app.filterTodos(todos, 'active');
    assertEqual(result.length, 1, 'only active');
    assertEqual(result[0].text, 'B', 'correct active todo');
  });

  test('returns only completed todos when filter is "completed"', function () {
    var todos = [
      app.createTodo('A'),
      app.createTodo('B'),
      app.createTodo('C'),
    ];
    todos[0].completed = true;
    todos[2].completed = true;
    var result = app.filterTodos(todos, 'completed');
    assertEqual(result.length, 2, 'only completed');
    assertEqual(result[0].text, 'A', 'first completed');
    assertEqual(result[1].text, 'C', 'second completed');
  });

  test('returns empty array when no todos match the filter', function () {
    var todos = [app.createTodo('A')];
    var result = app.filterTodos(todos, 'completed');
    assertEqual(result.length, 0, 'empty');
  });

  test('does not mutate the original array', function () {
    var todos = [app.createTodo('A'), app.createTodo('B')];
    todos[0].completed = true;
    var result = app.filterTodos(todos, 'active');
    assertEqual(todos.length, 2, 'original unchanged');
    assertTrue(result !== todos, 'new array returned');
  });

  test('handles empty array', function () {
    assertEqual(app.filterTodos([], 'all').length, 0, 'empty all');
    assertEqual(app.filterTodos([], 'active').length, 0, 'empty active');
    assertEqual(app.filterTodos([], 'completed').length, 0, 'empty completed');
  });

  // --- clearCompleted ---
  suite('clearCompleted');

  test('removes all completed todos', function () {
    var todos = [
      app.createTodo('A'),
      app.createTodo('B'),
      app.createTodo('C'),
    ];
    todos[0].completed = true;
    todos[2].completed = true;
    var result = app.clearCompleted(todos);
    assertEqual(result.length, 1, 'only incomplete remains');
    assertEqual(result[0].text, 'B', 'correct item kept');
  });

  test('returns same array when no todos are completed', function () {
    var todos = [app.createTodo('A'), app.createTodo('B')];
    var result = app.clearCompleted(todos);
    assertEqual(result.length, 2, 'all kept');
  });

  test('returns empty array when all todos are completed', function () {
    var todos = [app.createTodo('A'), app.createTodo('B')];
    todos[0].completed = true;
    todos[1].completed = true;
    var result = app.clearCompleted(todos);
    assertEqual(result.length, 0, 'all removed');
  });

  test('does not mutate the original array', function () {
    var todos = [app.createTodo('A'), app.createTodo('B')];
    todos[0].completed = true;
    var result = app.clearCompleted(todos);
    assertEqual(todos.length, 2, 'original unchanged');
    assertTrue(result !== todos, 'new array returned');
  });

  test('handles empty array', function () {
    var result = app.clearCompleted([]);
    assertEqual(result.length, 0, 'empty array');
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

  // --- generateId ---
  suite('generateId');

  test('returns a non-empty string', function () {
    var id = app.generateId();
    assertTrue(typeof id === 'string', 'should be string');
    assertTrue(id.length > 0, 'should be non-empty');
  });

  test('generates unique ids across multiple calls', function () {
    var ids = [];
    var i;
    for (i = 0; i < 100; i++) {
      ids.push(app.generateId());
    }
    var unique = {};
    for (i = 0; i < ids.length; i++) {
      unique[ids[i]] = true;
    }
    assertEqual(Object.keys(unique).length, 100, 'all 100 ids unique');
  });

  // --- createTodoElement ---
  suite('createTodoElement');

  test('creates an <li> element with correct data-id', function () {
    var todo = app.createTodo('Test task');
    var li = app.createTodoElement(todo);
    assertEqual(li.tagName.toLowerCase(), 'li', 'tag is li');
    assertEqual(li.dataset.id, todo.id, 'data-id matches');
    assertEqual(li.className, 'todo-item', 'has todo-item class');
  });

  test('renders todo text in a span with .todo-text class', function () {
    var todo = app.createTodo('My task');
    var li = app.createTodoElement(todo);
    var textSpan = li.querySelector('.todo-text');
    assertTrue(textSpan !== null, 'text span exists');
    assertEqual(textSpan.textContent, 'My task', 'text content correct');
  });

  test('includes a checkbox with correct checked state', function () {
    var todo = app.createTodo('Task');
    var li = app.createTodoElement(todo);
    var checkbox = li.querySelector('.todo-checkbox');
    assertTrue(checkbox !== null, 'checkbox exists');
    assertEqual(checkbox.type, 'checkbox', 'type is checkbox');
    assertFalse(checkbox.checked, 'unchecked when not completed');
  });

  test('checkbox is checked when todo is completed', function () {
    var todo = app.createTodo('Task');
    todo.completed = true;
    var li = app.createTodoElement(todo);
    var checkbox = li.querySelector('.todo-checkbox');
    assertTrue(checkbox.checked, 'checked when completed');
  });

  test('includes an edit button with .edit-btn class', function () {
    var todo = app.createTodo('Task');
    var li = app.createTodoElement(todo);
    var editBtn = li.querySelector('.edit-btn');
    assertTrue(editBtn !== null, 'edit button exists');
    assertEqual(editBtn.type, 'button', 'type is button');
  });

  test('includes a delete button with .delete-btn class', function () {
    var todo = app.createTodo('Task');
    var li = app.createTodoElement(todo);
    var delBtn = li.querySelector('.delete-btn');
    assertTrue(delBtn !== null, 'delete button exists');
    assertEqual(delBtn.type, 'button', 'type is button');
  });

  test('applies strikethrough class when todo is completed', function () {
    var todo = app.createTodo('Task');
    todo.completed = true;
    var li = app.createTodoElement(todo);
    assertTrue(li.classList.contains('completed'), 'li has completed class');
  });

  test('does not apply strikethrough class when todo is incomplete', function () {
    var todo = app.createTodo('Task');
    var li = app.createTodoElement(todo);
    var textSpan = li.querySelector('.todo-text');
    assertFalse(textSpan.classList.contains('completed'), 'no completed class');
  });

  // --- render ---
  suite('render');

  test('renders visible todos based on filter', function () {
    var list = createMockList();
    var emptyState = createMockEmptyState();
    var todos = [
      app.createTodo('A'),
      app.createTodo('B'),
    ];
    todos[0].completed = true;

    app.render(todos, 'all', list, emptyState);
    assertEqual(list.children.length, 2, 'all filter shows 2');

    app.render(todos, 'active', list, emptyState);
    assertEqual(list.children.length, 1, 'active filter shows 1');

    app.render(todos, 'completed', list, emptyState);
    assertEqual(list.children.length, 1, 'completed filter shows 1');
  });

  test('shows empty state when no todos match filter', function () {
    var list = createMockList();
    var emptyState = createMockEmptyState();
    var todos = [app.createTodo('A')];

    app.render(todos, 'completed', list, emptyState);
    assertEqual(list.children.length, 0, 'no items rendered');
    assertFalse(emptyState.classList.contains('hidden'), 'empty state visible');
  });

  test('hides empty state when todos are visible', function () {
    var list = createMockList();
    var emptyState = createMockEmptyState();
    var todos = [app.createTodo('A')];

    app.render(todos, 'all', list, emptyState);
    assertEqual(list.children.length, 1, 'one item rendered');
    assertTrue(emptyState.classList.contains('hidden'), 'empty state hidden');
  });

  test('clears previous list content before rendering', function () {
    var list = createMockList();
    var emptyState = createMockEmptyState();
    var todos = [app.createTodo('A'), app.createTodo('B')];

    app.render(todos, 'all', list, emptyState);
    assertEqual(list.children.length, 2, '2 items');

    // Render with fewer items
    app.render([todos[0]], 'all', list, emptyState);
    assertEqual(list.children.length, 1, '1 item after re-render');
  });

  // --- updateAddButton ---
  suite('updateAddButton');

  test('disables button when input is empty', function () {
    var input = createMockInput('');
    var btn = createMockButton();
    app.updateAddButton(input, btn);
    assertTrue(btn.disabled, 'button disabled for empty input');
  });

  test('disables button when input is whitespace-only', function () {
    var input = createMockInput('   ');
    var btn = createMockButton();
    app.updateAddButton(input, btn);
    assertTrue(btn.disabled, 'button disabled for whitespace input');
  });

  test('enables button when input has text', function () {
    var input = createMockInput('Hello');
    var btn = createMockButton();
    app.updateAddButton(input, btn);
    assertFalse(btn.disabled, 'button enabled for valid input');
  });

  test('enables button when input has text with leading/trailing spaces', function () {
    var input = createMockInput('  Hello  ');
    var btn = createMockButton();
    app.updateAddButton(input, btn);
    assertFalse(btn.disabled, 'button enabled for trimmed input');
  });

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------

  console.log('\n' + Array(41).join('='));
  console.log('Results: ' + passed + ' passed, ' + failed + ' failed');
  console.log(Array(41).join('='));

  process.exit(failed > 0 ? 1 : 0);
})();
