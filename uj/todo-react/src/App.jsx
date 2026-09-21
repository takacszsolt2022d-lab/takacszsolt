import { useState } from "react";

const initialTasks = [
  { id: "todo-0", name: "Eat", completed: true },
  { id: "todo-1", name: "Sleep", completed: false },
  { id: "todo-2", name: "Repeat", completed: false },
];

function Form({ addTask }) {
  const [name, setName] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    addTask(trimmedName);
    setName("");
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
        onChange={(event) => setName(event.target.value)}
      />
      <button type="submit" className="btn btn__primary btn__lg">
        Add
      </button>
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

function Todo({ task, toggleTaskCompleted, deleteTask }) {
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
      <div className="btn-group">
        <button type="button" className="btn">
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
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState("all");

  function addTask(name) {
    const newTask = {
      id: `todo-${crypto.randomUUID()}`,
      name,
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
      <h2 id="list-heading">{headingText}</h2>
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
          />
        ))}
      </ul>
    </div>
  );
}

export default App;