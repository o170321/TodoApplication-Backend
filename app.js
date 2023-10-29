const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "todoApplication.db");
app.use(express.json());
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
const outPutResult = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
  };
};

//API 1

app.get("/todos/", async (request, response) => {
  const { id, todo, priority, status, search_q } = request.query;

  if (
    status !== undefined &&
    id === undefined &&
    todo === undefined &&
    priority === undefined
  ) {
    const ToGetStatusQuery = `SELECT * FROM todo WHERE status='${status}';`;
    const resultStatus = await db.all(ToGetStatusQuery);
    response.send(resultStatus.map((eachItem) => outPutResult(eachItem)));
  } else if (
    status === undefined &&
    id === undefined &&
    todo === undefined &&
    priority !== undefined
  ) {
    const ToGetPriorityQuery = `SELECT * FROM todo WHERE priority = '${priority}';`;
    const ResultPriority = await db.all(ToGetPriorityQuery);
    response.send(ResultPriority.map((eachItem) => outPutResult(eachItem)));
  } else if (
    status !== undefined &&
    priority !== undefined &&
    id === undefined &&
    todo === undefined
  ) {
    const ToGETBoth = `SELECT * FROM todo WHERE (status='${status}' AND priority='${priority}');`;
    const ResultPRIStatus = await db.all(ToGETBoth);
    response.send(ResultPRIStatus.map((eachItem) => outPutResult(eachItem)));
  } else if (
    status === undefined &&
    id === undefined &&
    priority === undefined &&
    todo === undefined &&
    search_q !== undefined
  ) {
    const ToGetSearch = `
      SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
    const ResultSearch = await db.all(ToGetSearch);
    response.send(ResultSearch.map((eachItem) => outPutResult(eachItem)));
  }
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const GetToDoQuery = `
  SELECT * FROM todo WHERE id = ${todoId};`;
  const ResultGetTodo = await db.get(GetToDoQuery);
  response.send(ResultGetTodo);
});

//API 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const createQuery = `
  INSERT INTO todo(id,todo,priority,status) VALUES (${id},'${todo}','${priority}','${status}');`;
  const ResultOfCreate = await db.run(createQuery);
  response.send("Todo Successfully Added");
});

//API 4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { id, todo, priority, status } = request.body;
  if (
    id === undefined &&
    todo === undefined &&
    priority === undefined &&
    status !== undefined
  ) {
    const UpdateQuery = `
      UPDATE todo SET status='${status}' WHERE id=${todoId};`;
    const resultUpdated = await db.run(UpdateQuery);
    response.send("Status Updated");
  } else if (
    id === undefined &&
    todo === undefined &&
    priority !== undefined &&
    status === undefined
  ) {
    const UpdateQuery = `
      UPDATE todo SET priority='${priority}' WHERE id=${todoId};`;
    const resultUpdated = await db.run(UpdateQuery);
    response.send("Priority Updated");
  } else if (
    id === undefined &&
    todo !== undefined &&
    priority === undefined &&
    status === undefined
  ) {
    const UpdateQuery = `
      UPDATE todo SET todo='${todo}' WHERE id=${todoId};`;
    const resultUpdated = await db.run(UpdateQuery);
    response.send("Todo Updated");
  }
});

//API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM todo where id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
initializeDBAndServer();
module.exports = app;
