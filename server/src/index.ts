import { McpServer } from "skybridge/server";
import { z } from "zod";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

let nextId = 1;
const todos: Todo[] = [];

function getStats() {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  return { total, completed, pending: total - completed };
}

const server = new McpServer(
  { name: "sky-todos", version: "0.0.1" },
  { capabilities: {} },
)
  .registerWidget(
    "todo-list",
    { description: "Interactive todo list" },
    {
      description:
        "Show an interactive todo list. Use when the user wants to create, view, or manage their tasks.",
      inputSchema: {
        title: z
          .string()
          .describe("Title for the todo list, defaults to 'My Tasks'"),
      },
    },
    async ({ title }) => {
      return {
        structuredContent: { title, todos, stats: getStats(), hello: "world" },
        content: [
          {
            type: "text" as const,
            text: `Todo list "${title}" with ${todos.length} items (${getStats().completed} completed)`,
          },
        ],
        _meta: { createdAt: new Date().toISOString() },
      };
    },
  )
  .registerTool(
    "add-todo",
    {
      description: "Add a new todo item to the list.",
      inputSchema: {
        text: z.string().describe("The todo item text"),
      },
    },
    async ({ text }) => {
      const todo: Todo = {
        id: String(nextId++),
        text,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      todos.push(todo);
      return {
        structuredContent: { todo, todos, stats: getStats() },
        content: [{ type: "text" as const, text: `Added todo: "${text}"` }],
      };
    },
  )
  .registerTool(
    "toggle-todo",
    {
      description: "Toggle a todo item between completed and incomplete.",
      inputSchema: {
        id: z.string().describe("The todo item ID to toggle"),
      },
    },
    async ({ id }) => {
      const todo = todos.find((t) => t.id === id);
      if (!todo) {
        return {
          content: [{ type: "text" as const, text: `Todo ${id} not found` }],
          isError: true,
        };
      }
      todo.completed = !todo.completed;
      return {
        structuredContent: { todo, todos, stats: getStats() },
        content: [
          {
            type: "text" as const,
            text: `Toggled "${todo.text}" to ${todo.completed ? "completed" : "incomplete"}`,
          },
        ],
      };
    },
  )
  .registerTool(
    "delete-todo",
    {
      description: "Delete a todo item from the list.",
      inputSchema: {
        id: z.string().describe("The todo item ID to delete"),
      },
    },
    async ({ id }) => {
      const index = todos.findIndex((t) => t.id === id);
      if (index === -1) {
        return {
          content: [{ type: "text" as const, text: `Todo ${id} not found` }],
          isError: true,
        };
      }
      const [deleted] = todos.splice(index, 1);
      return {
        structuredContent: { todos, stats: getStats() },
        content: [
          { type: "text" as const, text: `Deleted todo: "${deleted.text}"` },
        ],
      };
    },
  );

server.run();

export type AppType = typeof server;
