# NestJS Chatbot with pgvector

A custom chatbot built with NestJS, MongoDB, PostgreSQL with pgvector extension for vector similarity search.

##Demo
![image](https://github.com/user-attachments/assets/782ad9d0-a063-4dbe-9d4d-990c67dbb5e7)


## Prerequisites

- Node.js (>= v16)
- MongoDB
- PostgreSQL (with pgvector extension)
- Ollama (for text embeddings)

## Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and update the following variables:

```env
# Application
PORT=
NODE_ENV=

# PostgreSQL
POSTGRES_HOST=
POSTGRES_PORT=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=
DB_SCHEMA=

# MongoDB
MONGODB_URI=your_mongodb_connection_string
```

## Project Overview

This README provides:
1. Clear setup instructions
2. Environment configuration
3. Database setup requirements
4. Available API endpoints
5. Project structure
6. Testing instructions

Feel free to customize this README further based on any specific requirements or additional features of your project.
