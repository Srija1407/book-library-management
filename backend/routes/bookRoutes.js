const express = require("express");
const Book = require("../models/Book");

const router = express.Router();

// Add a new book
router.post("/", async (req, res) => {
    try {
        const { title, author, category, availability } = req.body;

        if (!title || !author || !category) {
            return res.status(400).json({
                message: "Title, author and category are required"
            });
        }

        const book = await Book.create({
            title,
            author,
            category,
            availability: availability || "Available"
        });

        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({
            message: "Failed to add book",
            error: error.message
        });
    }
});

// Get all books and search by title or author
router.get("/", async (req, res) => {
    try {
        const { search } = req.query;

        let filter = {};

        if (search) {
            filter = {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { author: { $regex: search, $options: "i" } }
                ]
            };
        }

        const books = await Book.find(filter).sort({ createdAt: -1 });

        res.json(books);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch books",
            error: error.message
        });
    }
});

// Update a book
router.put("/:id", async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.json(book);
    } catch (error) {
        res.status(500).json({
            message: "Failed to update book",
            error: error.message
        });
    }
});

// Delete a book
router.delete("/:id", async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.json({
            message: "Book deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete book",
            error: error.message
        });
    }
});

module.exports = router;