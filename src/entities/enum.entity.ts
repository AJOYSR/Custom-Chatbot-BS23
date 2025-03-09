export enum ROLE {
  SUPER_ADMIN = "super-admin",
  ADMIN = "customer",
}

export enum BOT_STATUS {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum SENDER_TYPE {
  USER = "user",
  BOT = "bot",
  HUMAN = "human",
}
export enum UNPROCESSED_MESSAGE_STATUS {
  PENDING = "pending",
  SKIPPED = "skipped",
  RESOLVED = "resolved",
}

export enum QUERY_USER_TYPE {
  USER = "user",
  BOT = "bot",
}

export enum PERMISSIONS {
  // Admin Management Permissions for super-admin
  CREATE_ADMIN = "create-admin",
  VIEW_ADMIN_LIST = "view-admin-list",
  UPDATE_ADMIN_STATUS = "update-admin-status",
  DELETE_ADMIN = "delete-admin",

  // User Profile Management Permissions (Customer perspective)
  VIEW_USER_PROFILE = "view-user-profile",
  UPDATE_USER_PRICE_PLAN = "update-user-price-plan",

  // Dashboard's Conversation Permissions
  VIEW_CONVERSATION_LIST = "view-conversation-list",
  VIEW_CONVERSATION_DETAIL = "view-conversation-detail",
  DELETE_CONVERSATION = "delete-conversation",

  // Bot Management Permissions (Admin perspective)
  CREATE_BOT = "create-bot",
  UPDATE_BOT = "edit-bot",
  VIEW_BOT_LIST = "view-bot-list",
  VIEW_BOT = "view-bot",
  DELETE_BOT = "delete-bot",
}
