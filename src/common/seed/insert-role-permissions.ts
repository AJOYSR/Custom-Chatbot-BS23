import * as dotenv from "dotenv";
dotenv.config();
import { Db, MongoClient, ObjectId } from "mongodb";
import { dbConfig } from "../../config/database/index";

const client = new MongoClient(dbConfig.mongodb.URI);

export const up = async (db: Db): Promise<void> => {
  console.log("Starting seed process...");
  try {
    const roles = [
      {
        _id: new ObjectId("65e5ba573d7272e56ee23123"),
        name: "super-admin",
      },
      {
        _id: new ObjectId("65e990138dc8b15a12a49c6d"),
        name: "admin",
      },
    ];

    const permissions = [
      {
        _id: new ObjectId("65e5ba3f3d7272e56ee23120"),
        name: "add-long-shot-admin",
      },
      {
        _id: new ObjectId("6790d217fc97155a1ecb92b7"),
        name: "assign-new-role",
      },
    ];

    const role_permissions = [
      {
        _id: new ObjectId("66be0376f649da49be80643a"),
        roleId: new ObjectId("65e5ba573d7272e56ee23123"),
        permissionId: new ObjectId("65e5ba3f3d7272e56ee23120"),
      },
      {
        _id: new ObjectId("66be0382ed4b3db7612bae24"),
        roleId: new ObjectId("65e5ba573d7272e56ee23123"),
        permissionId: new ObjectId("65e5ba3f3d7272e56ee23120"),
      },
    ];

    // Insert collections one at a time for better error handling
    await db.collection("roles").insertMany(roles);
    await db.collection("permissions").insertMany(permissions);
    await db.collection("role-permissions").insertMany(role_permissions);

    console.log("✅Seed:Up completed successfully!");
  } catch (error) {
    console.error("Seed migration failed:", error);
    throw error;
  }
};

export const down = async (db: Db): Promise<void> => {
  console.log("Running down migration...");
  try {
    // In the down function, reverse the action of the up function
    await db.collection("role-permissions").deleteMany({});
    await db.collection("permissions").deleteMany({});
    await db.collection("roles").deleteMany({});

    console.log("✅ Seed:Down migration completed successfully!");
  } catch (error) {
    console.error("Down migration failed:", error);
    throw error;
  }
};

// Run the script when executed
(async () => {
  try {
    await client.connect();
    console.log("Connected successfully!");

    const db = client.db("custom-chatbot");

    if (process.argv.includes("--down")) {
      await down(db);
    } else {
      await up(db);
    }

    await client.close();
  } catch (error) {
    console.error("Database operation failed:", error);
    process.exit(1);
  }
})();
