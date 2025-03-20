# API Endpoints Documentation

## Authentication
- POST /api/auth/signup - User signup
- POST /api/auth/admin-login - Admin login
- GET /api/auth/verify-email/:token - Verify email
- POST /api/auth/forgot-password - Request password reset
- POST /api/auth/reset-password/:token - Reset password

## Users
- POST /api/users - Create new user (Admin)
- GET /api/users - Get all users with pagination
- GET /api/users/:id - Get user by ID
- PUT /api/users/:id - Update user

## Bots
- POST /api/bots - Create new bot
- GET /api/bots - Get all bots with pagination
- GET /api/bots/:botId - Get bot by ID
- PATCH /api/bots/:botId - Update bot
- DELETE /api/bots/:id - Delete bot

## QnA
- POST /api/qna - Create new QnA
- POST /api/qna/batch - Create multiple QnAs in batch
- GET /api/qna - Get all QnAs with pagination
- GET /api/qna/:id - Get QnA by ID
- PUT /api/qna/:id - Update QnA
- DELETE /api/qna/:id - Delete QnA


## Conversations
- POST /api/conversations - Create new conversation
- GET /api/conversations - Get all conversations with pagination
- GET /api/conversations/:id - Get conversation by ID
- PATCH /api/conversations/:id - Update conversation
- DELETE /api/conversations/:id - Delete conversation

## Unresolved Queries

- GET /api/unresolved-queries - Get all unresolved queries with pagination
- GET /api/unresolved-queries/:id - Get unresolved query by ID
- PATCH /api/unresolved-queries/:id - Update unresolved query status
- DELETE /api/unresolved-queries/:id - Delete unresolved query

