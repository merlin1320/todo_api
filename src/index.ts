import express, { Request, Response } from "express";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Todo type definition
interface Todo {
  summary: string;
  author: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  completed: boolean;
}

// In-memory todos array
const todos: Todo[] = [];

// GET /todos - return all todos
app.get("/todos", (req: Request, res: Response) => {
  res.json(todos);
});

// POST /todos - add a new todo
app.post("/todos", (req : Request, res: Response) => {
  const { summary, author, description, imageUrl, category, completed } = req.body;
  if (!summary || !author || typeof completed !== "boolean") {
    res.status(400).json({ error: "Summary, author, and completed (boolean) are required." });
    return 
  }
  const newTodo: Todo = { summary, author, description, imageUrl, category, completed };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// DELETE /todos/:index - delete a todo by its index
app.delete("/todos/:index", (req: Request, res: Response) => {
  const idx = parseInt(req.params.index, 10);
  if (isNaN(idx) || idx < 0 || idx >= todos.length) {
    res.status(404).json({ error: "Todo not found." });
    return 
  }
  const deleted = todos.splice(idx, 1)[0];
  res.json(deleted);
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Express These Nuts!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export { app, todos };