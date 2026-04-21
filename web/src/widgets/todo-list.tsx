import { useToolInfo } from "@/helpers.js";
import { mountWidget } from "skybridge/web";

function ToDoList() {
  const { output } = useToolInfo<"todo-list">();
  return <h1>hello!!!!!!!</h1>;
}

export default ToDoList;
mountWidget(<ToDoList />);
