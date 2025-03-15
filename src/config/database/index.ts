const { MONGODB_URI } = process.env;

export const dbConfig = {
  mongodb: {
    URI: MONGODB_URI || 'mongodb://localhost:27017/custom-chatbot',
  },
};
