# Model Examples

## User Model Example
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "john.doe@example.com",
  "role": "customer",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}

## Bot Model Example
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Customer Support Bot",
  "description": "24/7 customer support assistant",
  "color": "#007bff",
  "icon": "https://example.com/bot-icon.png",
  "logo": "https://example.com/bot-logo.png",
  "status": "active",
  "welcomeMessage": "Hello! How can I help you today?",
  "fallbackMessage": "I'm sorry, I don't understand. Could you rephrase that?",
  "suggestionMessage": "You might want to try asking about:",
  "handoverToHuman": true,
  "handOverToHumanMessage": "Would you like to speak with a human agent?",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}

## QnA Model Example
{
  "id": "507f1f77bcf86cd799439013",
  "question": "What are your business hours?",
  "answer": "We are open Monday through Friday, 9 AM to 5 PM EST.",
  "botId": "507f1f77bcf86cd799439012",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}

## Conversation Model Example
{
  "_id": "507f1f77bcf86cd799439014",
  "botId": "507f1f77bcf86cd799439012",
  "messages": [
    {
      "content": "Hi, I need help with my order",
      "senderType": "user",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    {
      "content": "I'll be happy to help. Could you provide your order number?",
      "senderType": "bot",
      "timestamp": "2024-01-01T00:00:00.001Z"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:01.000Z"
}

## Unresolved Query Model Example
{
  "_id": "507f1f77bcf86cd799439015",
  "question": "Where can I find the refund policy?",
  "botId": "507f1f77bcf86cd799439012",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
