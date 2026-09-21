import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // Books
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");

  // Add/Edit book
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [availability, setAvailability] = useState("Available");

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Fetch books
  const fetchBooks = async (searchText = "") => {
    try {
      const response = await fetch(
        `${API_URL}/api/books?search=${encodeURIComponent(searchText)}`
      );

      const data = await response.json();

      if (response.ok) {
        setBooks(data);
      }
    } catch (error) {
      setMessage("Cannot connect to the backend");
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchBooks();
    }
  }, [isLoggedIn]);

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setIsLoggedIn(true);
        setMessage("");
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (error) {
      setMessage("Cannot connect to the backend");
    }
  };

  // Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Signup successful! You can now login.");

        setSignupName("");
        setSignupEmail("");
        setSignupPassword("");

        setShowLogin(true);
      } else {
        setMessage(data.message || "Signup failed");
      }
    } catch (error) {
      setMessage("Cannot connect to the backend");
    }
  };

  // Add or update book
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const bookData = {
      title,
      author,
      category,
      availability,
    };

    try {
      let response;

      if (editingId) {
        response = await fetch(`${API_URL}/api/books/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookData),
        });
      } else {
        response = await fetch(`${API_URL}/api/books`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookData),
        });
      }

      const data = await response.json();

      if (response.ok) {
        setMessage(
          editingId
            ? "Book updated successfully!"
            : "Book added successfully!"
        );

        clearBookForm();
        fetchBooks(search);
      } else {
        setMessage(data.message || "Operation failed");
      }
    } catch (error) {
      setMessage("Cannot connect to the backend");
    }
  };

  // Edit book
  const handleEdit = (book) => {
    setEditingId(book._id);
    setTitle(book.title);
    setAuthor(book.author);
    setCategory(book.category);
    setAvailability(book.availability);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete book
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/books/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Book deleted successfully!");
        fetchBooks(search);
      } else {
        setMessage(data.message || "Delete failed");
      }
    } catch (error) {
      setMessage("Cannot connect to the backend");
    }
  };

  // Change availability
  const toggleAvailability = async (book) => {
    const newStatus =
      book.availability === "Available" ? "Issued" : "Available";

    try {
      const response = await fetch(`${API_URL}/api/books/${book._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          availability: newStatus,
        }),
      });

      if (response.ok) {
        fetchBooks(search);
      }
    } catch (error) {
      setMessage("Cannot connect to the backend");
    }
  };

  // Clear form
  const clearBookForm = () => {
    setTitle("");
    setAuthor("");
    setCategory("");
    setAvailability("Available");
    setEditingId(null);
  };

  // Search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    fetchBooks(value);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setShowLogin(true);
    clearBookForm();
  };

  // Dashboard
  if (isLoggedIn) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <div>
            <h1>📚 Book Library</h1>
            <p>Book Library Management System</p>
          </div>

          <div className="user-section">
            <span>Welcome, {user?.name || "User"}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <main className="dashboard-content">
          <section className="book-form-card">
            <h2>{editingId ? "✏️ Edit Book" : "➕ Add New Book"}</h2>

            <form onSubmit={handleBookSubmit} className="book-form">
              <input
                type="text"
                placeholder="Book Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />

              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              >
                <option value="Available">Available</option>
                <option value="Issued">Issued</option>
              </select>

              <div className="form-buttons">
                <button type="submit">
                  {editingId ? "Update Book" : "Add Book"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={clearBookForm}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {message && <p className="dashboard-message">{message}</p>}
          </section>

          <section className="books-section">
            <div className="books-heading">
              <div>
                <h2>📖 Library Books</h2>
                <p>{books.length} book(s) found</p>
              </div>

              <input
                className="search-box"
                type="text"
                placeholder="🔍 Search title or author..."
                value={search}
                onChange={handleSearch}
              />
            </div>

            {books.length === 0 ? (
              <div className="empty-books">
                <h3>No books found</h3>
                <p>Add a book to your library.</p>
              </div>
            ) : (
              <div className="books-grid">
                {books.map((book) => (
                  <div className="book-card" key={book._id}>
                    <div className="book-icon">📚</div>

                    <h3>{book.title}</h3>

                    <p>
                      <strong>Author:</strong> {book.author}
                    </p>

                    <p>
                      <strong>Category:</strong> {book.category}
                    </p>

                    <button
                      className={
                        book.availability === "Available"
                          ? "status available"
                          : "status issued"
                      }
                      onClick={() => toggleAvailability(book)}
                    >
                      {book.availability}
                    </button>

                    <div className="book-actions">
                      <button onClick={() => handleEdit(book)}>
                        ✏️ Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() => handleDelete(book._id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  // Login / Signup
  return (
    <div className="app">
      <div className="auth-container">
        <h1>📚 Book Library</h1>
        <p className="subtitle">Book Library Management System</p>

        {showLogin ? (
          <div>
            <h2>Login</h2>

            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />

              <button type="submit">Login</button>
            </form>

            {message && <p>{message}</p>}

            <p>
              Don't have an account?{" "}
              <span
                onClick={() => {
                  setShowLogin(false);
                  setMessage("");
                }}
              >
                Sign Up
              </span>
            </p>
          </div>
        ) : (
          <div>
            <h2>Sign Up</h2>

            <form onSubmit={handleSignup}>
              <input
                type="text"
                placeholder="Name"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
              />

              <button type="submit">Sign Up</button>
            </form>

            {message && <p>{message}</p>}

            <p>
              Already have an account?{" "}
              <span
                onClick={() => {
                  setShowLogin(true);
                  setMessage("");
                }}
              >
                Login
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;