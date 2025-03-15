import * as dotenv from 'dotenv';
dotenv.config();
import { Db, MongoClient, ObjectId } from 'mongodb';
import { dbConfig } from '../../config/database/index';
import { PERMISSIONS } from '../../entities/enum.entity';

const client = new MongoClient(dbConfig.mongodb.URI);

export const up = async (db: Db): Promise<void> => {
  console.log('Starting seed process...');
  try {
    const roles = [
      {
        _id: new ObjectId('65e5ba573d7272e56ee23123'),
        name: 'super-admin',
      },
      {
        _id: new ObjectId('65e990138dc8b15a12a49c6d'),
        name: 'customer',
      },
    ];

    const permissions = [
      // Admin Management Permissions for super-admin
      {
        _id: new ObjectId('65e5ba3f3d7272e56ee23120'),
        name: PERMISSIONS.CREATE_ADMIN,
      },
      {
        _id: new ObjectId('65e5baa93d7272e56ee23129'),
        name: PERMISSIONS.VIEW_ADMIN_LIST,
      },
      {
        _id: new ObjectId('65e98fe98dc8b15a12a49c6b'),
        name: PERMISSIONS.DELETE_ADMIN,
      },
      {
        _id: new ObjectId('65e98ff28dc8b15a12a49c6c'),
        name: PERMISSIONS.UPDATE_ADMIN_STATUS,
      },

      // User Profile Management Permissions (Admin perspective)
      {
        _id: new ObjectId('65eaf4ef2df9a772d0ca238f'),
        name: PERMISSIONS.VIEW_USER_PROFILE,
      },
      {
        _id: new ObjectId('65eaf4f62df9a772d0ca2390'),
        name: PERMISSIONS.UPDATE_USER_PRICE_PLAN,
      },

      // Dashboard's Conversation Permissions
      {
        _id: new ObjectId('65eaf5012df9a772d0ca2391'),
        name: PERMISSIONS.VIEW_CONVERSATION_LIST,
      },
      {
        _id: new ObjectId('65eaf5092df9a772d0ca2392'),
        name: PERMISSIONS.VIEW_CONVERSATION_DETAIL,
      },
      {
        _id: new ObjectId('67cabc76c6b267a0b3383d2f'),
        name: PERMISSIONS.DELETE_CONVERSATION,
      },

      // Bot Management Permissions (Admin perspective)
      {
        _id: new ObjectId('65eaf5262df9a772d0ca2393'),
        name: PERMISSIONS.CREATE_BOT,
      },
      {
        _id: new ObjectId('65f03d0a02cf86afc4cb5c70'),
        name: PERMISSIONS.UPDATE_BOT,
      },
      {
        _id: new ObjectId('65f0419002cf86afc4cb5c72'),
        name: PERMISSIONS.VIEW_BOT_LIST,
      },
      {
        _id: new ObjectId('65f1804d400e079ad7a3ff19'),
        name: PERMISSIONS.VIEW_BOT,
      },
      {
        _id: new ObjectId('65f7f59e71d785b823d8b6ec'),
        name: PERMISSIONS.DELETE_BOT,
      },
    ];

    const role_permissions = [
      // Super-admin (65e5ba573d7272e56ee23123) permissions
      {
        _id: new ObjectId('67cabec739c17d826586a663'),
        roleId: new ObjectId('65e5ba573d7272e56ee23123'), // super-admin
        permissionId: new ObjectId('65e5ba3f3d7272e56ee23120'), // CREATE_ADMIN
      },
      {
        _id: new ObjectId('67cabed0d71feb84d9b76df9'),
        roleId: new ObjectId('65e5ba573d7272e56ee23123'), // super-admin
        permissionId: new ObjectId('65e5baa93d7272e56ee23129'), // VIEW_ADMIN_LIST
      },
      {
        _id: new ObjectId('67cabed6501c26d3615dbca8'),
        roleId: new ObjectId('65e5ba573d7272e56ee23123'), // super-admin
        permissionId: new ObjectId('65e98fe98dc8b15a12a49c6b'), // DELETE_ADMIN
      },
      {
        _id: new ObjectId('67cabedce8fe4e2cdf758dcf'),
        roleId: new ObjectId('65e5ba573d7272e56ee23123'), // super-admin
        permissionId: new ObjectId('65e98ff28dc8b15a12a49c6c'), // UPDATE_ADMIN_STATUS
      },
      {
        _id: new ObjectId('67cabee19b0dcdbcb6a8c1a5'),
        roleId: new ObjectId('65e5ba573d7272e56ee23123'), // super-admin
        permissionId: new ObjectId('65eaf4ef2df9a772d0ca238f'), // VIEW_USER_PROFILE
      },
      {
        _id: new ObjectId('67cabee7cf14d698d4e27841'),
        roleId: new ObjectId('65e5ba573d7272e56ee23123'), // super-admin
        permissionId: new ObjectId('65eaf4f62df9a772d0ca2390'), // UPDATE_USER_PRICE_PLAN
      },
      {
        _id: new ObjectId('67cabeed5a8561fb58611be5'),
        roleId: new ObjectId('65e5ba573d7272e56ee23123'), // super-admin
        permissionId: new ObjectId('65eaf5012df9a772d0ca2391'), // VIEW_CONVERSATION_LIST
      },
      {
        _id: new ObjectId('67cabef2baa42cc0f3ff2141'),
        roleId: new ObjectId('65e5ba573d7272e56ee23123'), // super-admin
        permissionId: new ObjectId('65eaf5092df9a772d0ca2392'), // VIEW_CONVERSATION_DETAIL
      },
      {
        _id: new ObjectId('67cabef875f74a075aaaf663'),
        roleId: new ObjectId('65e5ba573d7272e56ee23123'), // super-admin
        permissionId: new ObjectId('67cabc76c6b267a0b3383d2f'), // DELETE_CONVERSATION
      },
      {
        _id: new ObjectId('67cabf0ae4983438197241a7'),
        roleId: new ObjectId('65e5ba573d7272e56ee23123'), // super-admin
        permissionId: new ObjectId('65eaf5262df9a772d0ca2393'), // CREATE_BOT
      },
      {
        _id: new ObjectId('67cabf105951b0962469770f'),
        roleId: new ObjectId('65e5ba573d7272e56ee23123'), // super-admin
        permissionId: new ObjectId('65f03d0a02cf86afc4cb5c70'), // UPDATE_BOT
      },
      {
        _id: new ObjectId('67cabf16fdc3a9031738c0d4'),
        roleId: new ObjectId('65e5ba573d7272e56ee23123'), // super-admin
        permissionId: new ObjectId('65f0419002cf86afc4cb5c72'), // VIEW_BOT_LIST
      },
      {
        _id: new ObjectId('67cabf1c3387ca347c024999'),
        roleId: new ObjectId('65e5ba573d7272e56ee23123'), // super-admin
        permissionId: new ObjectId('65f1804d400e079ad7a3ff19'), // VIEW_BOT
      },
      {
        _id: new ObjectId('67cabf21bbdf4cd88e5c659b'),
        roleId: new ObjectId('65e5ba573d7272e56ee23123'), // super-admin
        permissionId: new ObjectId('65f7f59e71d785b823d8b6ec'), // DELETE_BOT
      },

      // Customer (65e990138dc8b15a12a49c6d) permissions
      {
        _id: new ObjectId('67cabf30fdd9b88d2aba1517'),
        roleId: new ObjectId('65e990138dc8b15a12a49c6d'), // customer
        permissionId: new ObjectId('65eaf4ef2df9a772d0ca238f'), // VIEW_USER_PROFILE
      },
      {
        _id: new ObjectId('67cabf41a4f36967746a4978'),
        roleId: new ObjectId('65e990138dc8b15a12a49c6d'), // customer
        permissionId: new ObjectId('65f0419002cf86afc4cb5c72'), // VIEW_BOT_LIST
      },
      {
        _id: new ObjectId('67cabf46af806e5836bd9385'),
        roleId: new ObjectId('65e990138dc8b15a12a49c6d'), // customer
        permissionId: new ObjectId('65f1804d400e079ad7a3ff19'), // VIEW_BOT
      },
      // Conversation Permissions
      {
        _id: new ObjectId('67cabf358009bf35bba3ab67'),
        roleId: new ObjectId('65e990138dc8b15a12a49c6d'), // customer
        permissionId: new ObjectId('65eaf5012df9a772d0ca2391'), // VIEW_CONVERSATION_LIST
      },
      {
        _id: new ObjectId('67cabf3aa03036ceafbb96ca'),
        roleId: new ObjectId('65e990138dc8b15a12a49c6d'), // customer
        permissionId: new ObjectId('65eaf5092df9a772d0ca2392'), // VIEW_CONVERSATION_DETAIL
      },
      {
        _id: new ObjectId('67d2bf3b5abda879dec802cc'),
        roleId: new ObjectId('65e990138dc8b15a12a49c6d'), // customer
        permissionId: new ObjectId('67cabc76c6b267a0b3383d2f'), // DELETE_CONVERSATION
      },
    ];

    // Insert roles if they don't exist yet
    let insertedRoles = 0;
    for (const role of roles) {
      const existingRole = await db
        .collection('roles')
        .findOne({ _id: role._id });
      if (!existingRole) {
        await db.collection('roles').insertOne(role);
        insertedRoles++;
      }
    }

    // Insert permissions if they don't exist yet
    let insertedPermissions = 0;
    for (const permission of permissions) {
      const existingPermission = await db
        .collection('permissions')
        .findOne({ _id: permission._id });
      if (!existingPermission) {
        await db.collection('permissions').insertOne(permission);
        insertedPermissions++;
      }
    }

    // Check and insert only new role_permissions
    let insertedRolePermissions = 0;
    for (const rolePermission of role_permissions) {
      // First check if the exact document exists
      const existingByExactMatch = await db
        .collection('role-permissions')
        .findOne({
          _id: rolePermission._id,
        });

      if (!existingByExactMatch) {
        // Then check if a relationship between the same role and permission already exists
        const existingByRelationship = await db
          .collection('role-permissions')
          .findOne({
            roleId: rolePermission.roleId,
            permissionId: rolePermission.permissionId,
          });

        if (!existingByRelationship) {
          await db.collection('role-permissions').insertOne(rolePermission);
          insertedRolePermissions++;
        } else {
        }
      } else {
      }
    }

    console.log(`Inserted roles: ${insertedRoles}`);
    console.log(`Inserted permissions: ${insertedPermissions}`);
    console.log(`Inserted role-permissions: ${insertedRolePermissions}`);
    console.log('✅Seed:Up completed successfully!');
  } catch (error) {
    console.error('Seed migration failed:', error);
    throw error;
  }
};

export const down = async (db: Db): Promise<void> => {
  console.log('Running down migration...');
  try {
    // In the down function, reverse the action of the up function
    await db.collection('role-permissions').deleteMany({});
    await db.collection('permissions').deleteMany({});
    await db.collection('roles').deleteMany({});

    console.log('✅ Seed:Down migration completed successfully!');
  } catch (error) {
    console.error('Down migration failed:', error);
    throw error;
  }
};

// Run the script when executed
(async () => {
  try {
    await client.connect();
    console.log('Connected successfully!');

    const db = client.db('custom-chatbot');

    if (process.argv.includes('--down')) {
      await down(db);
    } else {
      await up(db);
    }

    await client.close();
  } catch (error) {
    console.error('Database operation failed:', error);
    process.exit(1);
  }
})();
