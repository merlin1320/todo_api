import express, { Request, Response } from "express";
import { randomUUID } from "crypto";
import mysql from "mysql2/promise";

const app = express();
const port = 3002;

// Get the client

// Create the connection to database
const getConnection = () => {
  return mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "mysql-chal",
    password: "pens",
    port: 3306,
  });
};

// A simple SELECT query
getConnection()
  .then((connection) => {
    return connection.query("SELECT * FROM `Todos`");
  })
  .then(([results, fields]) => {
    console.log(results); // results contains rows returned by server
    console.log(fields); // fields contains extra meta data about results, if available
  })
  .catch((err) => {
    console.error(err);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Todo type definition
interface Todo {
  id: number;
  description: string;
  completed: boolean;
  creation: Date;
  last_updated: Date;
}

// In-memory todos array
const todos: Todo[] = [];

// app.use((err: Error, req: Request, res:Response) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

// GET /todos - return all todos
app.get("/todos", (req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "*");
  res.json(todos);
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Todos!");
});

app.options("/todos", (req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "*");
  res.send();
});

// POST /todos - add a new todo
app.post("/todos", (req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "*");
  try {
    const { id, description, completed, creation, last_updated } =
      req.body;
    if (!description || typeof completed !== "boolean") {
      res.status(400).json({
        error: "Summary, author, and completed (boolean) are required.",
      });
      return;
    }
    const newTodo: Todo = {
      id,
      description,
      completed,
      creation,
      last_updated,
    };
    todos.push(newTodo);
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({
      error:
        "Invalid request body. Expected: Description, Completed",
    });
  }
});

app.options("/todos/:id", (req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "*");
  res.send();
});

// POST /todos/:id/completed - update only the completed field of a todo
app.post("/todos/:id", (req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "*");
  const { id } = req.params;
  const { completed } = req.body;
  const todo = todos.find((t) => id === id);
  if (!todo) {
    res.status(404).json({ error: "Todo not found." });
    return;
  }
  if (typeof completed !== "boolean") {
    res.status(400).json({ error: "Completed (boolean) is required." });
    return;
  }
  todo.completed = completed;
  res.json(todo);
});

// DELETE /todos/:id - delete a todo by its unique id
app.delete("/todos/:id", (req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "*");
  const { id } = req.params;
  const idx = todos.findIndex((todo) => todo.id === id);
  if (idx === -1) {
    res.status(404).json({ error: "Todo not found." });
    return;
  }
  const deleted = todos.splice(idx, 1)[0];
  res.json(deleted);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export { app, todos };
