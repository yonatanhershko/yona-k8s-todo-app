import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "/api";

function App() {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/todos`);
            setTodos(response.data);
        } catch (error) {
            console.error("Error fetching todos:", error);
        } finally {
            setLoading(false);
        }
    };

    const addTodo = async (e) => {
        e.preventDefault();
        if (!newTodo.trim()) return;

        try {
            const response = await axios.post(`${API_URL}/todos`, {
                text: newTodo,
            });
            setTodos([...todos, response.data]);
            setNewTodo("");
        } catch (error) {
            console.error("Error adding todo:", error);
        }
    };

    const toggleTodo = async (id, completed) => {
        try {
            const response = await axios.put(`${API_URL}/todos/${id}`, {
                completed: !completed,
            });
            setTodos(
                todos.map((todo) => (todo.id === id ? response.data : todo))
            );
        } catch (error) {
            console.error("Error updating todo:", error);
        }
    };

    const deleteTodo = async (id) => {
        try {
            await axios.delete(`${API_URL}/todos/${id}`);
            setTodos(todos.filter((todo) => todo.id !== id));
        } catch (error) {
            console.error("Error deleting todo:", error);
        }
    };

    return (
        <div className="App">
            <div className="container">
                <header className="header">
                    <h1>📝 Kubernetes Todo List</h1>
                    <p className="subtitle">Deployed with Docker & Fly.io</p>
                </header>

                <form onSubmit={addTodo} className="todo-form">
                    <input
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        placeholder="Add a new task..."
                        className="todo-input"
                    />
                    <button type="submit" className="add-button">
                        Add
                    </button>
                </form>

                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <ul className="todo-list">
                        {todos.map((todo) => (
                            <li key={todo.id} className="todo-item">
                                <div className="todo-content">
                                    <input
                                        type="checkbox"
                                        checked={todo.completed}
                                        onChange={() =>
                                            toggleTodo(todo.id, todo.completed)
                                        }
                                        className="checkbox"
                                    />
                                    <span
                                        className={
                                            todo.completed ? "completed" : ""
                                        }
                                    >
                                        {todo.text}
                                    </span>
                                </div>
                                <button
                                    onClick={() => deleteTodo(todo.id)}
                                    className="delete-button"
                                >
                                    ✕
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {todos.length === 0 && !loading && (
                    <div className="empty-state">
                        No tasks yet. Add one above! 🚀
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
