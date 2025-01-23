const express = require("express");
require("dotenv").config();
const app = express();
const PORT = process.env.APP_API_PORT || 3000; // Start the Server
const { Sequelize, DataTypes } = require("sequelize");
app.use(express.json());

// Sequelize configuration
const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        }
    }
});

sequelize.sync().then(() => {
    console.log("Database connected");
}).catch((err) => {
    console.log(err);
});

// Sequelize model definition
const Post = sequelize.define("post", {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Fetch posts from the database
app.get("/api/posts", async (req, res) => {
    try {
        const posts = await Post.findAll(); // Corrected model name
        res.json(posts);
    } catch (err) {
        res.status(500).send("Error fetching posts: " + err.message);
    }
});

app.get("/", (req, res) => {
    res.send("Hello World");
});

// Register route to handle user registration
app.post("/api/app/register", async (req, res) => {
    const { username, email, password, usertype } = req.body;

    // Validate inputs (you can use validation libraries like express-validator)
    if (!username || !email || !password || !usertype) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Create new post in the database (repurposing for registration info)
        const newPost = await Post.create({
            title: username, // Use the username for the title
            content: `User email: ${email}, User type: ${usertype}`, // Content contains basic information
        });

        // Respond with the new post details
        res.status(201).json({ message: "User registered successfully", post: newPost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error registering user" });
    }
});

app.listen(PORT, () => {
    console.log(`App Server running on port http://localhost:${PORT}`);
});
