// Test if Copilot knows our project structure

// Test 1: Try creating a controller following project specs
// Type the comment below and see what Copilot suggests:
// Create a new auth controller using Express and JWT following the architecture specs

//Create a new auth controller using Express and JWT following the architecture specs
// This should handle user registration and login
// 1. Validate user input
// 2. Hash passwords    
// 3. Generate JWT tokens
// 4. Return appropriate response format
// Start typing below and see what Copilot suggests:
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/user'); // Assuming you have a User model defined

// Test 2: Try creating a route following the specs
// Type this comment and see what Copilot suggests:
// Create a POST route for project creation following the feature specification



// Test 3: Check if Copilot knows about the database structure
// Type this comment and see what Copilot suggests:
// Create a PostgreSQL User model following db-schema.md
// Must use: UUID id, name field (not username), password_hash, role enum
const { v4: uuidv4 } = require('uuid');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a Sequelize instance configured

// Define the User model
const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
});
// Sync the model with the database
User.sync()
    .then(() => console.log('User model synced'))
    .catch(err => console.error('Error syncing User model:', err)); 
// Export the User model
module.exports = User;
// This should create an Express route that:
// 1. Requires authentication (JWT)
// 2. Validates project title and description
// 3. Creates project in PostgreSQL database
// 4. Returns appropriate response format       
const fs = require('fs');
const path = require('path');   
const { v4: uuidv4 } = require('uuid');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'postgres'
}); 

// Test 4: Check middleware knowledge
// Type this comment and see what Copilot suggests:
// Create authentication middleware following the security specifications

