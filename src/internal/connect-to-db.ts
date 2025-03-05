import * as Mongoose from "mongoose";
import { dbConfig } from "src/config/database";
Mongoose.set("strictQuery", true);

export async function connect() {
  console.log("Connecting to MongoDB...");
  await Mongoose.connect(dbConfig.mongodb.URI);
  const { connection } = Mongoose;

  connection.on("connected", () => {
    console.info("Success! Connected to MongoDB.");
  });

  connection.on("disconnected", () => {
    console.error("!!!!!!!!!! MongoDB Disconnected !!!!!!!!!!");
  });

  connection.on("reconnected", () => {
    console.warn("!!!!!!!!!! MongoDB Reconnected  !!!!!!!!!!");
  });

  connection.on("error", (error) => {
    console.error("Failed! MongoDB connection failed. \n", error);
  });
}

export async function disconnect() {
  console.log("Disconnecting from MongoDB...");
  await Mongoose.disconnect();
}
