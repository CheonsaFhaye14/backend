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

// Sequelize model definition for "users"
const User = sequelize.define("users", {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Ensures no duplicate emails
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    usertype: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Register route to handle user registration
app.post("/api/app/register", async (req, res) => {
    const { username, email, password, usertype } = req.body;

    // Validate inputs
    if (!username || !email || !password || !usertype) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Check if the email already exists in the database
        const existingUser = await User.findOne({
            where: { email: email },
        });

        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Create a new user in the database
        const newUser = await User.create({
            username: username,
            email: email,
            password: password, // Remember to hash passwords before saving them in production
            usertype: usertype,
        });

        // Respond with the new user details
        res.status(201).json({
            message: "User registered successfully",
            user: newUser,
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Error registering user" });
    }
});

app.listen(PORT, () => {
    console.log(`App Server running on port http://localhost:${PORT}`);
});
