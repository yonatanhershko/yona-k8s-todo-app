const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(bodyParser.json());

// SQLite database (free, persistent, no external service needed)
const db = new Database("todos.db");

// Initialize database table
const initDatabase = () => {
    try {
        db.exec(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Add sample data if table is empty
        const count = db.prepare("SELECT COUNT(*) as count FROM todos").get();
        if (count.count === 0) {
            const insert = db.prepare(
                "INSERT INTO todos (text, completed) VALUES (?, ?)"
            );
            insert.run("Learn Kubernetes", 0);
            insert.run("Deploy to Fly.io", 0);
            insert.run("Share on LinkedIn", 0);
            console.log("Sample todos added to database");
        }
        console.log("Database initialized successfully");
    } catch (err) {
        console.error("Database initialization error:", err);
    }
};

initDatabase();

app.get("/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.get("/api/todos", (req, res) => {
    try {
        const todos = db.prepare("SELECT * FROM todos ORDER BY id ASC").all();
        // Convert completed from 0/1 to false/true for consistency
        const formattedTodos = todos.map((todo) => ({
            ...todo,
            completed: Boolean(todo.completed),
        }));
        res.json(formattedTodos);
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
        const stmt = db.prepare(
            "INSERT INTO todos (text, completed) VALUES (?, ?)"
        );
        const result = stmt.run(text, 0);
        const newTodo = db
            .prepare("SELECT * FROM todos WHERE id = ?")
            .get(result.lastInsertRowid);
        res.status(201).json({
            ...newTodo,
            completed: Boolean(newTodo.completed),
        });
    } catch (err) {
        console.error("Error creating todo:", err);
        res.status(500).json({ error: "Failed to create todo" });
    }
});

app.put("/api/todos/:id", (req, res) => {
    const { id } = req.params;
    const { completed, text } = req.body;

    try {
        // Build dynamic update query
        const updates = [];
        const values = [];

        if (completed !== undefined) {
            updates.push("completed = ?");
            values.push(completed ? 1 : 0);
        }
        if (text !== undefined) {
            updates.push("text = ?");
            values.push(text);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        values.push(id);
        const query = `UPDATE todos SET ${updates.join(", ")} WHERE id = ?`;

        const stmt = db.prepare(query);
        const result = stmt.run(...values);

        if (result.changes === 0) {
            return res.status(404).json({ error: "Todo not found" });
        }

        const updatedTodo = db
            .prepare("SELECT * FROM todos WHERE id = ?")
            .get(id);
        res.json({
            ...updatedTodo,
            completed: Boolean(updatedTodo.completed),
        });
    } catch (err) {
        console.error("Error updating todo:", err);
        res.status(500).json({ error: "Failed to update todo" });
    }
});

app.delete("/api/todos/:id", (req, res) => {
    const { id } = req.params;

    try {
        const stmt = db.prepare("DELETE FROM todos WHERE id = ?");
        const result = stmt.run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: "Todo not found" });
        }

        res.status(204).send();
    } catch (err) {
        console.error("Error deleting todo:", err);
        res.status(500).json({ error: "Failed to delete todo" });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend running on port ${PORT}`);
});
