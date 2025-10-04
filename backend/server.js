const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(bodyParser.json());

// JSON file storage
const DB_FILE = path.join(__dirname, "todos.json");

// Initialize database file
const initDatabase = () => {
    try {
        if (!fs.existsSync(DB_FILE)) {
            const initialData = [
                { id: 1, text: "Learn Kubernetes", completed: false },
                { id: 2, text: "Deploy to Fly.io", completed: false },
                { id: 3, text: "Share on LinkedIn", completed: false },
            ];
            fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
            console.log("Database initialized with sample todos");
        } else {
            console.log("Database file found");
        }
    } catch (err) {
        console.error("Database initialization error:", err);
    }
};

// Read todos from file
const readTodos = () => {
    try {
        const data = fs.readFileSync(DB_FILE, "utf8");
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading todos:", err);
        return [];
    }
};

// Write todos to file
const writeTodos = (todos) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(todos, null, 2));
    } catch (err) {
        console.error("Error writing todos:", err);
    }
};

initDatabase();

app.get("/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.get("/api/todos", (req, res) => {
    try {
        const todos = readTodos();
        res.json(todos);
    } catch (err) {
        console.error("Error fetching todos:", err);
        res.status(500).json({ error: "Failed to fetch todos" });
    }
});

app.post("/api/todos", (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: "Text is required" });
    }
    try {
        const todos = readTodos();
        const newTodo = {
            id: Date.now(),
            text,
            completed: false,
        };
        todos.push(newTodo);
        writeTodos(todos);
        res.status(201).json(newTodo);
    } catch (err) {
        console.error("Error creating todo:", err);
        res.status(500).json({ error: "Failed to create todo" });
    }
});

app.put("/api/todos/:id", (req, res) => {
    const { id } = req.params;
    const { completed, text } = req.body;

    try {
        const todos = readTodos();
        const todo = todos.find((t) => t.id === parseInt(id));

        if (!todo) {
            return res.status(404).json({ error: "Todo not found" });
        }

        if (completed !== undefined) todo.completed = completed;
        if (text !== undefined) todo.text = text;

        writeTodos(todos);
        res.json(todo);
    } catch (err) {
        console.error("Error updating todo:", err);
        res.status(500).json({ error: "Failed to update todo" });
    }
});

app.delete("/api/todos/:id", (req, res) => {
    const { id } = req.params;

    try {
        const todos = readTodos();
        const index = todos.findIndex((t) => t.id === parseInt(id));

        if (index === -1) {
            return res.status(404).json({ error: "Todo not found" });
        }

        todos.splice(index, 1);
        writeTodos(todos);
        res.status(204).send();
    } catch (err) {
        console.error("Error deleting todo:", err);
        res.status(500).json({ error: "Failed to delete todo" });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend running on port ${PORT}`);
});
