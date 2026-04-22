import "@/index.css";
import {
  mountWidget,
  useDisplayMode,
  useLayout,
  useRequestModal,
  useSendFollowUpMessage,
  useUser,
  useWidgetState,
} from "skybridge/web";
import { useToolInfo, useCallTool } from "@/helpers.js";

function ToDoList() {
  const { output, isPending, input } = useToolInfo<"todo-list">();
  const addTodoTool = useCallTool("add-todo");
  const deleteTodoTool = useCallTool("delete-todo");
  const toggleTodoTool = useCallTool("toggle-todo");

  const [widgetState, setWidgetState] = useWidgetState({
    todos: output?.todos ?? [],
    newTodoText: "",
  });

  const { theme, safeArea } = useLayout();
  const { userAgent, locale } = useUser();

  const [displayMode, setDisplayMode] = useDisplayMode();

  const isMobile = userAgent.device.type === "mobile";

  const canHover = userAgent.capabilities.hover;

  const modal = useRequestModal();

  const sendMessage = useSendFollowUpMessage();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = widgetState.newTodoText.trim();
    if (!text) return;
    addTodoTool.callTool(
      { text },
      {
        onSuccess: (data) => {
          // setTodos(data.structuredContent.todos);
          // setNewTodoText("");
          setWidgetState({
            todos: data.structuredContent.todos,
            newTodoText: "",
          });
        },
      },
    );
  };

  const onToggleClick = (id: string) => {
    toggleTodoTool.callTool(
      { id },
      {
        onSuccess: (data) => {
          setWidgetState((prev) => ({
            todos: data.structuredContent.todos,
            newTodoText: prev.newTodoText,
          }));
        },
      },
    );
  };
  const onDeleteClick = (id: string) => {
    deleteTodoTool.callTool(
      { id },
      {
        onSuccess: (data) => {
          setWidgetState((prev) => ({
            todos: data.structuredContent.todos,
            newTodoText: prev.newTodoText,
          }));
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

  if (modal.isOpen) {
    const todo = widgetState.todos.find((t) => t.id === modal.params?.id);
    if (todo) {
      return (
        <div className={theme === "dark" ? "dark" : ""}>
          <div className="p-6 dark:bg-gray-900 dark:text-white">
            <h2 className="text-xl font-bold mb-4">{todo.text}</h2>
            <p>{todo.completed ? "Completed" : "Pending"}</p>
            <p>
              {new Intl.DateTimeFormat(locale, {
                dateStyle: "long",
                timeStyle: "short",
              }).format(new Date(todo.createdAt))}
            </p>
          </div>
        </div>
      );
    }
  }

  return (
    <div
      className={theme === "dark" ? "dark" : ""}
      style={{
        paddingTop: safeArea.insets.top,
        paddingLeft: safeArea.insets.left,
        paddingRight: safeArea.insets.right,
        paddingBottom: safeArea.insets.bottom,
      }}
    >
      <div className="p-4 dark:bg-gray-900 dark:text-white">
        <div className="flex items-center justify-between mb-4">
          <h1
            className={`${displayMode === "fullscreen" ? "text-2xl" : "text-lg"} font-bold`}
          >
            {input?.title}
          </h1>
          <div className="flex gap-1">
            {displayMode === "inline" && (
              <>
                <button
                  onClick={() => setDisplayMode("fullscreen")}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Expand"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setDisplayMode("pip")}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Pin"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
        {/* Add todo form */}
        <form className="flex gap-2 mb-4" onSubmit={handleSubmit}>
          <input
            type="text"
            value={widgetState.newTodoText}
            onChange={(e) =>
              setWidgetState((prev) => ({
                todos: prev.todos,
                newTodoText: e.target.value,
              }))
            }
            placeholder="Add a new todo..."
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
            {addTodoTool.isPending ? "Adding to do..." : "Add"}
          </button>
        </form>

        <ul className="space-y-1">
          {widgetState.todos.length === 0 && (
            <li className="text-center py-8 text-gray-400 text-sm">
              No todos yet.
            </li>
          )}
          {widgetState.todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800
              group"
            >
              <button
                onClick={() => onToggleClick(todo.id)}
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
              <button
                onClick={() =>
                  modal.open({
                    title: "Detail",
                    params: {
                      id: todo.id,
                    },
                  })
                }
                className={`${canHover ? "opacity-0 group-hover:opacity-100" : ""} ${isMobile ? "p-3" : "p-1"} text-gray-400 hover:text-blue-500 transition-opacity`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
              </button>
              <button
                onClick={() => onDeleteClick(todo.id)}
                className={` ${canHover ? "opacity-0 group-hover:opacity-100" : ""}
                  ${isMobile ? "p-3" : "p-1"} text-gray-400 hover:text-red-500
              transition-opacity`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end">
          <button
            onClick={() =>
              sendMessage(
                `Summarize my todos: ${JSON.stringify(widgetState.todos)}`,
              )
            }
            className="text-blue-500 cursor-pointer hover:text-blue-600 font-medium text-xs"
          >
            Summarize
          </button>
        </div>
      </div>
    </div>
  );
}

export default ToDoList;
mountWidget(<ToDoList />);
