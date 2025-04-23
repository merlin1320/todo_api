import express, { Request, Response } from "express";
import { randomUUID } from "crypto";

const app = express();
const port = 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Todo type definition
interface Todo {
  id: string;
  summary: string;
  author: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  completed: boolean;
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
    const { summary, author, description, imageUrl, category, completed } =
      req.body;
    if (!summary || !author || typeof completed !== "boolean") {
      res.status(400).json({
        error: "Summary, author, and completed (boolean) are required.",
      });
      return;
    }
    const newTodo: Todo = {
      id: randomUUID(),
      summary,
      author,
      description,
      imageUrl,
      category,
      completed,
    };
    todos.push(newTodo);
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({
      error:
        "Invalid request body. Expected: Summary, Author, Description, ImageURL, category, and Completed",
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
  const todo = todos.find((t) => t.id === id);
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
