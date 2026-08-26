/**
 * Todo App — Application Logic
 *
 * Single-page, client-side web app. No framework dependencies.
 * Pure state functions (addTodo, toggleTodo, deleteTodo) are separated from
 * persistence (saveToLocalStorage, loadFromLocalStorage) and DOM rendering
 * (render, init) so the core logic can be unit-tested in isolation.
 */
(function () {
  'use strict';

  // --- Constants ---
  var STORAGE_KEY = 'todo-app:todos';

  // --- Data Model ---
  // Todo = { id: string, text: string, completed: boolean }

  // --- ID Generation ---
  // Timestamp-based + random suffix to reduce collision risk.
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // ---------------------------------------------------------------------------
  // Pure State Functions
  // ---------------------------------------------------------------------------

  /**
   * Creates a new Todo object from the given text.
   * @param {string} text — Todo description
   * @returns {Todo}
   */
  function createTodo(text) {
    return {
      id: generateId(),
      text: text,
      completed: false,
    };
  }

  /**
   * Returns true when the given value contains non-whitespace text.
   * @param {string} value
   * @returns {boolean}
   */
  function hasValidInput(value) {
    return typeof value === 'string' && value.trim() !== '';
  }

  /**
   * Adds a new todo to the state. Empty / whitespace-only input is ignored.
   * Pure: does not mutate the input array.
   * @param {Todo[]} todos — Current state
   * @param {string} text — Todo text
   * @returns {Todo[]} New state with todo appended (or unchanged on invalid input)
   */
  function addTodo(todos, text) {
    if (!hasValidInput(text)) {
      return todos;
    }
    var trimmed = text.trim();
    return todos.concat([createTodo(trimmed)]);
  }

  /**
   * Toggles the `completed` flag of the todo with the given id.
   * Pure: does not mutate the input array.
   * @param {Todo[]} todos — Current state
   * @param {string} id — Todo id to toggle
   * @returns {Todo[]} New state with the matching todo toggled
   */
  function toggleTodo(todos, id) {
    return todos.map(function (todo) {
      if (todo.id === id) {
        return Object.assign({}, todo, { completed: !todo.completed });
      }
      return todo;
    });
  }

  /**
   * Removes the todo with the given id from state.
   * Pure: does not mutate the input array.
   * @param {Todo[]} todos — Current state
   * @param {string} id — Todo id to remove
   * @returns {Todo[]} New state without the matching todo
   */
  function deleteTodo(todos, id) {
    return todos.filter(function (todo) {
      return todo.id !== id;
    });
  }

  /**
   * Updates the text of the todo with the given id.
   * Pure: does not mutate the input array.
   * @param {Todo[]} todos — Current state
   * @param {string} id — Todo id to edit
   * @param {string} text — New text value
   * @returns {Todo[]} New state with the matching todo's text updated
   */
  function editTodo(todos, id, text) {
    if (!hasValidInput(text)) {
      return todos;
    }
    var trimmed = text.trim();
    return todos.map(function (todo) {
      if (todo.id === id) {
        return Object.assign({}, todo, { text: trimmed });
      }
      return todo;
    });
  }

  /**
   * Filters todos by the given filter type.
   * @param {Todo[]} todos — Current state
   * @param {string} filter — 'all' | 'active' | 'completed'
   * @returns {Todo[]} Filtered list (does not mutate input)
   */
  function filterTodos(todos, filter) {
    if (filter === 'active') {
      return todos.filter(function (todo) {
        return !todo.completed;
      });
    }
    if (filter === 'completed') {
      return todos.filter(function (todo) {
        return todo.completed;
      });
    }
    return todos;
  }

  /**
   * Removes all completed todos from state.
   * Pure: does not mutate the input array.
   * @param {Todo[]} todos — Current state
   * @returns {Todo[]} New state with only incomplete todos
   */
  function clearCompleted(todos) {
    return todos.filter(function (todo) {
      return !todo.completed;
    });
  }

  // ---------------------------------------------------------------------------
  // Validation & Sanitization (Security)
  // ---------------------------------------------------------------------------

  /**
   * Validates that a value conforms to the Todo shape.
   * @param {*} todo
   * @returns {boolean}
   */
  function isValidTodo(todo) {
    return (
      todo !== null &&
      typeof todo === 'object' &&
      typeof todo.id === 'string' &&
      typeof todo.text === 'string' &&
      typeof todo.completed === 'boolean'
    );
  }

  /**
   * Filters an arbitrary value down to a clean array of valid Todo objects.
   * Non-array input returns []. Entries missing required fields or with
   * wrong types are discarded.
   * @param {*} arr
   * @returns {Todo[]}
   */
  function sanitizeTodos(arr) {
    if (!Array.isArray(arr)) {
      return [];
    }
    return arr.filter(isValidTodo);
  }

  // ---------------------------------------------------------------------------
  // Persistence (localStorage)
  // ---------------------------------------------------------------------------

  /**
   * Safely retrieves a reference to localStorage.
   * Returns null when localStorage is undefined or throws on access.
   * @returns {Storage|null}
   */
  function getStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage;
      }
      if (typeof localStorage !== 'undefined') {
        return localStorage;
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  /**
   * Serializes `todos` and persists them to localStorage under STORAGE_KEY.
   * Silently degrades when localStorage is unavailable — logs a warning
   * and returns `todos` unchanged so the caller can keep working in-memory.
   * @param {Todo[]} todos
   * @returns {Todo[]} The saved todos (for chaining)
   */
  function saveToLocalStorage(todos) {
    try {
      var storage = getStorage();
      if (!storage) {
        console.warn('localStorage is unavailable — keeping state in-memory');
        return todos;
      }
      var serialized = JSON.stringify(todos);
      storage.setItem(STORAGE_KEY, serialized);
    } catch (e) {
      console.warn('Failed to save todos to localStorage:', e.message);
    }
    return todos;
  }

  /**
   * Loads and validates todos from localStorage.
   * Returns a clean array of valid Todo objects.
   * Handles corrupted JSON, non-array data, and invalid entries gracefully.
   * @returns {Todo[]}
   */
  function loadFromLocalStorage() {
    try {
      var storage = getStorage();
      if (!storage) {
        console.warn('localStorage is unavailable — starting with empty state');
        return [];
      }
      var serialized = storage.getItem(STORAGE_KEY);
      if (!serialized) {
        return [];
      }
      var parsed = JSON.parse(serialized);
      return sanitizeTodos(parsed);
    } catch (e) {
      console.warn('Failed to load todos from localStorage:', e.message);
      return [];
    }
  }

  // ---------------------------------------------------------------------------
  // Rendering (textContent only — never innerHTML)
  // ---------------------------------------------------------------------------

  /**
   * Creates a single <li> todo-item element from a Todo object.
   * All user text is inserted via textContent / createTextNode only.
   * @param {Todo} todo
   * @returns {HTMLLIElement}
   */
  function createTodoElement(todo) {
    var li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.dataset.id = todo.id;

    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute(
      'aria-label',
      'Mark as ' + (todo.completed ? 'incomplete' : 'complete')
    );

    var textSpan = document.createElement('span');
    textSpan.className = 'todo-text';
    // textContent is XSS-safe — never use innerHTML for user text
    textSpan.textContent = todo.text;

    var editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'edit-btn';
    editBtn.textContent = 'Edit';
    editBtn.setAttribute('aria-label', 'Edit todo');

    var deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', 'Delete todo');

    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    return li;
  }

  /**
   * Re-renders the todo list from the current state.
   * Shows a context-aware empty-state message:
   *   - "No todos yet" when the full list is empty
   *   - "No matching todos" when the list has items but none match the filter
   * Uses textContent exclusively — no innerHTML.
   * @param {Todo[]} todos — The full state (unfiltered)
   * @param {string} filter — 'all' | 'active' | 'completed'
   * @param {HTMLUListElement} listElement
   * @param {HTMLElement} emptyStateElement
   */
  function render(todos, filter, listElement, emptyStateElement) {
    var visibleTodos = filterTodos(todos, filter);

    // Clear existing list contents
    while (listElement.firstChild) {
      listElement.removeChild(listElement.firstChild);
    }

    if (visibleTodos.length === 0) {
      emptyStateElement.classList.remove('hidden');
      // Context-aware message: distinguish "no todos at all" from
      // "no todos match the current filter"
      if (todos.length === 0) {
        emptyStateElement.textContent = 'No todos yet';
      } else {
        emptyStateElement.textContent = 'No matching todos';
      }
    } else {
      emptyStateElement.classList.add('hidden');

      var fragment = document.createDocumentFragment();
      visibleTodos.forEach(function (todo) {
        fragment.appendChild(createTodoElement(todo));
      });
      listElement.appendChild(fragment);
    }
  }

  /**
   * Enables / disables the Add button based on whether the input has
   * non-whitespace text.
   * @param {HTMLInputElement} input
   * @param {HTMLButtonElement} addBtn
   */
  function updateAddButton(input, addBtn) {
    addBtn.disabled = !hasValidInput(input.value);
  }

  /**
   * Shows or hides the "Clear completed" button based on whether any
   * todos are completed. Hides the button when there is nothing to clear.
   * @param {Todo[]} todos — The full state
   * @param {HTMLButtonElement} clearBtn
   */
  function updateClearCompletedButton(todos, clearBtn) {
    var hasCompleted = todos.some(function (t) { return t.completed; });
    clearBtn.classList.toggle('hidden', !hasCompleted);
  }

  // ---------------------------------------------------------------------------
  // App Initialization (DOM-dependent — only runs in browser)
  // ---------------------------------------------------------------------------

  function init() {
    var form = document.getElementById('todo-form');
    var input = document.getElementById('todo-input');
    var addBtn = document.getElementById('add-btn');
    var list = document.getElementById('todo-list');
    var emptyState = document.getElementById('empty-state');
    var filterBar = document.getElementById('filter-bar');
    var clearCompletedBtn = document.getElementById('clear-completed');

    if (!form || !input || !addBtn || !list || !emptyState || !filterBar || !clearCompletedBtn) {
      console.error('Todo App: Required DOM elements not found');
      return;
    }

    // Load persisted state (or empty array if unavailable)
    var todos = loadFromLocalStorage();
    var currentFilter = 'all';

    // --- Inline editing ---
    function startEditTodo(li, id) {
      // Prevent double-edit
      if (li.classList.contains('editing')) return;

      li.classList.add('editing');

      var textSpan = li.querySelector('.todo-text');
      var currentText = textSpan.textContent;

      var editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.className = 'edit-input';
      editInput.value = currentText;
      editInput.setAttribute('aria-label', 'Edit todo text');
      editInput.maxLength = 250;

      // Replace the text span with the edit input
      li.replaceChild(editInput, textSpan);
      editInput.focus();
      // Place cursor at end
      var len = editInput.value.length;
      editInput.setSelectionRange(len, len);

      var isFinished = false;

      var finishEdit = function (save) {
        // Guard against double-fire: keydown (Enter/Escape) triggers
        // finishEdit, then blur fires finishEdit(true) again. Without
        // this guard, the second call throws a DOM error because
        // editInput has already been replaced by textSpan.
        if (isFinished) return;
        isFinished = true;

        li.classList.remove('editing');

        // Restore the text span
        li.replaceChild(textSpan, editInput);

        if (save && hasValidInput(editInput.value)) {
          var trimmed = editInput.value.trim();
          if (trimmed !== currentText) {
            todos = editTodo(todos, id, trimmed);
            saveToLocalStorage(todos);
            render(todos, currentFilter, list, emptyState);
            updateClearCompletedButton(todos, clearCompletedBtn);
          }
        }

        // Return focus to the main input for continued use
        input.focus();
      };

      editInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          finishEdit(true);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          finishEdit(false);
        }
      });

      editInput.addEventListener('blur', function () {
        finishEdit(true);
      });
    }

    // Initial render
    render(todos, currentFilter, list, emptyState);

    // --- Input validation: toggle Add button on every keystroke ---
    input.addEventListener('input', function () {
      updateAddButton(input, addBtn);
    });

    // --- Add todo on form submit (covers both button click and Enter key) ---
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Re-validate — the button may be enabled via keyboard submission
      if (!hasValidInput(input.value)) {
        return;
      }

      todos = addTodo(todos, input.value);
      saveToLocalStorage(todos);
      render(todos, currentFilter, list, emptyState);

      input.value = '';
      addBtn.disabled = true;
      input.focus(); // Return focus to input after adding
    });

    // --- Event delegation: toggle complete / edit / delete on the list ---
    list.addEventListener('click', function (e) {
      var li = e.target.closest('.todo-item');
      if (!li) return;

      var id = li.dataset.id;

      if (e.target.classList.contains('todo-checkbox')) {
        todos = toggleTodo(todos, id);
        saveToLocalStorage(todos);
        render(todos, currentFilter, list, emptyState);
      }

      if (e.target.classList.contains('edit-btn')) {
        startEditTodo(li, id);
      }

      if (e.target.classList.contains('delete-btn')) {
        todos = deleteTodo(todos, id);
        saveToLocalStorage(todos);
        render(todos, currentFilter, list, emptyState);
      }
    });

    // --- Filter buttons via event delegation ---
    filterBar.addEventListener('click', function (e) {
      if (e.target.classList.contains('filter-btn')) {
        currentFilter = e.target.dataset.filter;
        // Update active state on filter buttons
        var buttons = filterBar.querySelectorAll('.filter-btn');
        buttons.forEach(function (btn) {
          btn.classList.toggle('active', btn === e.target);
        });
        render(todos, currentFilter, list, emptyState);
      }
    });

    // --- Clear completed button ---
    clearCompletedBtn.addEventListener('click', function () {
      todos = clearCompleted(todos);
      saveToLocalStorage(todos);
      render(todos, currentFilter, list, emptyState);
    });
  }

  // Bootstrap — guard so Node.js test environment does not crash
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  // ---------------------------------------------------------------------------
  // Exports (for Node.js unit testing)
  // ---------------------------------------------------------------------------
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      STORAGE_KEY: STORAGE_KEY,
      generateId: generateId,
      createTodo: createTodo,
      hasValidInput: hasValidInput,
      addTodo: addTodo,
      toggleTodo: toggleTodo,
      deleteTodo: deleteTodo,
      editTodo: editTodo,
      filterTodos: filterTodos,
      clearCompleted: clearCompleted,
      isValidTodo: isValidTodo,
      sanitizeTodos: sanitizeTodos,
      saveToLocalStorage: saveToLocalStorage,
      loadFromLocalStorage: loadFromLocalStorage,
      getStorage: getStorage,
      createTodoElement: createTodoElement,
      render: render,
      updateAddButton: updateAddButton,
      updateClearCompletedButton: updateClearCompletedButton,
    };
  }
})();
