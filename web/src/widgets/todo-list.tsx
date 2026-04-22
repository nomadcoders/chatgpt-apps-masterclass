import "@/index.css";
import { useState } from "react";
import { mountWidget } from "skybridge/web";
import { useToolInfo, useCallTool } from "@/helpers.js";

function ToDoList() {
  const { output, isPending, input } = useToolInfo<"todo-list">();
  const addToDo = useCallTool("add-todo");

  const [todos, setTodos] = useState(output?.todos ?? []);
  const [newTodoText, setNewTodoText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newTodoText.trim();
    if (!text) return;
    addToDo.callTool(
      { text },
      {
        onSuccess: (data) => {
          setTodos(data.structuredContent.todos);
          setNewTodoText("");
        },
      },
    );
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        Loading todos...
      </div>
    );
  }

  return (
    <div className="p-4 ">
      <h1 className="text-lg font-bold mb-4">{input?.title}</h1>

      {/* Add todo form */}
      <form className="flex gap-2 mb-4" onSubmit={handleSubmit}>
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
          {addToDo.isPending ? "Adding to do..." : "Add"}
        </button>
      </form>

      <ul className="space-y-1">
        {todos.length === 0 && (
          <li className="text-center py-8 text-gray-400 text-sm">
            No todos yet.
          </li>
        )}
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 group"
          >
            <button
              className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                todo.completed
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              {todo.completed && (
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              )}
            </button>
            <span
              className={`flex-1 text-sm ${todo.completed ? "line-through text-gray-400" : ""}`}
            >
              {todo.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ToDoList;
mountWidget(<ToDoList />);
