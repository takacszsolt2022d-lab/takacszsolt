import { useEffect, useRef, useState } from "react";

function usePrevious(value) {
  const [previousValue, setPreviousValue] = useState();
  const [currentValue, setCurrentValue] = useState(value);

  if (currentValue !== value) {
    setPreviousValue(currentValue);
    setCurrentValue(value);
  }

  return previousValue;
}

const initialTasks = [
  { id: "todo-0", name: "Eat", completed: true },
  { id: "todo-1", name: "Sleep", completed: false },
  { id: "todo-2", name: "Repeat", completed: false },
];

const FORBIDDEN_TASK_NAME = "react";
const TASK_STORAGE_PREFIX = "todo-task:";
const LEGACY_TASKS_STORAGE_KEY = "todo-react-tasks";

function loadTasks() {
  try {
    const storedTasks = [];

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);

      if (key?.startsWith(TASK_STORAGE_PREFIX)) {
        const task = JSON.parse(localStorage.getItem(key));

        if (
          task &&
          typeof task.id === "string" &&
          typeof task.name === "string" &&
          typeof task.completed === "boolean"
        ) {
          storedTasks.push(task);
        }
      }
    }

    if (storedTasks.length > 0) {
      return storedTasks;
    }

    const savedTasks = localStorage.getItem(LEGACY_TASKS_STORAGE_KEY);
    const parsedTasks = savedTasks ? JSON.parse(savedTasks) : null;

    return Array.isArray(parsedTasks) ? parsedTasks : initialTasks;
  } catch {
    return initialTasks;
  }
}

function validateTaskName(name) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return "";
  }

  if (trimmedName.toLowerCase() === FORBIDDEN_TASK_NAME) {
    return "Nem lehet react név, nem megengedett.";
  }

  return "";
}

function Form({ addTask }) {
  const [name, setName] = useState("");
  const [importance, setImportance] = useState(3);
  const [errorMessage, setErrorMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedName = name.trim();
    const validationError = validateTaskName(trimmedName);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!trimmedName) {
      setErrorMessage("");
      return;
    }

    addTask(trimmedName, importance);
    setName("");
    setImportance(3);
    setErrorMessage("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="label-wrapper">
        <label htmlFor="new-todo-input" className="label__lg">
          What needs to be done?
        </label>
      </h2>
      <input
        type="text"
        id="new-todo-input"
        className="input input__lg"
        name="text"
        autoComplete="off"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          if (errorMessage) {
            setErrorMessage("");
          }
        }}
        aria-invalid={Boolean(errorMessage)}
      />
      <label className="importance-control" htmlFor="new-todo-importance">
        <span>Fontosság: {importance} / 5</span>
        <input
          id="new-todo-importance"
          type="range"
          min="1"
          max="5"
          step="1"
          value={importance}
          onChange={(event) => setImportance(Number(event.target.value))}
          aria-label="Fontosság"
        />
      </label>
      <button type="submit" className="btn btn__primary btn__lg">
        Add
      </button>
      {errorMessage && (
        <p role="alert" className="error-message">
          {errorMessage}
        </p>
      )}
    </form>
  );
}

function FilterButton({ name, isPressed, onClick }) {
  return (
    <button
      type="button"
      className="btn toggle-btn"
      aria-pressed={isPressed}
      onClick={onClick}>
      <span className="visually-hidden">Show </span>
      <span>{name}</span>
      <span className="visually-hidden"> tasks</span>
    </button>
  );
}

function Todo({
  task,
  toggleTaskCompleted,
  deleteTask,
  editTask,
  saveTask,
  cancelEdit,
  isEditing,
  editingName,
  setEditingName,
}) {
  const editFieldRef = useRef(null);
  const editButtonRef = useRef(null);
  const wasEditing = usePrevious(isEditing);

  useEffect(() => {
    if (!wasEditing && isEditing) {
      editFieldRef.current?.focus();
    } else if (wasEditing && !isEditing) {
      editButtonRef.current?.focus();
    }
  }, [wasEditing, isEditing]);

  if (isEditing) {
    return (
      <li className="todo stack-small">
        <div className="c-cb">
          <input
            type="text"
            value={editingName}
            onChange={(event) => setEditingName(event.target.value)}
            aria-label={`Edit ${task.name}`}
            ref={editFieldRef}
          />
        </div>
        <div className="btn-group">
          <button type="button" className="btn" onClick={() => saveTask(task.id)}>
            Save
          </button>
          <button type="button" className="btn btn__danger" onClick={cancelEdit}>
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="todo stack-small">
      <div className="c-cb">
        <input
          id={task.id}
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleTaskCompleted(task.id)}
        />
        <label className="todo-label" htmlFor={task.id}>
          {task.name}
        </label>
      </div>
      <p className="todo-importance">
        Fontosság: {task.importance ?? 3} / 5
      </p>
      <div className="btn-group">
        <button
          type="button"
          className="btn"
          onClick={() => editTask(task.id)}
          ref={editButtonRef}>
          Edit <span className="visually-hidden">{task.name}</span>
        </button>
        <button
          type="button"
          className="btn btn__danger"
          onClick={() => deleteTask(task.id)}>
          Delete <span className="visually-hidden">{task.name}</span>
        </button>
      </div>
    </li>
  );
}

function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const listHeadingRef = useRef(null);
  const previousTaskLength = usePrevious(tasks.length);

  useEffect(() => {
    const storedTaskKeys = [];

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);

      if (key?.startsWith(TASK_STORAGE_PREFIX)) {
        storedTaskKeys.push(key);
      }
    }

    storedTaskKeys.forEach((key) => localStorage.removeItem(key));
    tasks.forEach((task) => {
      localStorage.setItem(
        `${TASK_STORAGE_PREFIX}${task.id}`,
        JSON.stringify(task),
      );
    });
    localStorage.removeItem(LEGACY_TASKS_STORAGE_KEY);
  }, [tasks]);

  useEffect(() => {
    if (
      previousTaskLength !== undefined &&
      tasks.length < previousTaskLength
    ) {
      listHeadingRef.current?.focus();
    }
  }, [previousTaskLength, tasks.length]);

  function addTask(name, importance) {
    const newTask = {
      id: `todo-${crypto.randomUUID()}`,
      name,
      importance,
      completed: false,
    };

    setTasks((currentTasks) => [...currentTasks, newTask]);
  }

  function toggleTaskCompleted(id) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  function deleteTask(id) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
  }

  function editTask(id) {
    const taskToEdit = tasks.find((task) => task.id === id);

    if (!taskToEdit) {
      return;
    }

    setEditingId(id);
    setEditingName(taskToEdit.name);
  }

  function saveTask(id) {
    const trimmedName = editingName.trim();
    const validationError = validateTaskName(trimmedName);

    if (validationError) {
      return;
    }

    if (!trimmedName) {
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, name: trimmedName } : task,
      ),
    );
    setEditingId(null);
    setEditingName("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
  }

  const visibleTasks = tasks.filter((task) => {
    if (filter === "active") {
      return !task.completed;
    }

    if (filter === "completed") {
      return task.completed;
    }

    return true;
  });
  const remainingTasks = tasks.filter((task) => !task.completed).length;
  const tasksNoun = remainingTasks === 1 ? "task" : "tasks";
  const headingText = `${remainingTasks} ${tasksNoun} remaining`;

  return (
    <div className="todoapp stack-large">
      <h1>TodoMatic</h1>
      <Form addTask={addTask} />
      <div className="filters btn-group stack-exception">
        <FilterButton
          name="all"
          isPressed={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <FilterButton
          name="Active"
          isPressed={filter === "active"}
          onClick={() => setFilter("active")}
        />
        <FilterButton
          name="Completed"
          isPressed={filter === "completed"}
          onClick={() => setFilter("completed")}
        />
      </div>
      <h2 id="list-heading" tabIndex={-1} ref={listHeadingRef}>
        {headingText}
      </h2>
      <ul
        role="list"
        className="todo-list stack-large stack-exception"
        aria-labelledby="list-heading">
        {visibleTasks.map((task) => (
          <Todo
            key={task.id}
            task={task}
            toggleTaskCompleted={toggleTaskCompleted}
            deleteTask={deleteTask}
            editTask={editTask}
            saveTask={saveTask}
            cancelEdit={cancelEdit}
            isEditing={editingId === task.id}
            editingName={editingName}
            setEditingName={setEditingName}
          />
        ))}
      </ul>
    </div>
  );
}



export default App;