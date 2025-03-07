export enum ROLE {
  SUPER_ADMIN = "super-admin",
  ADMIN = "admin",
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

export enum PERMISSIONS {
  // Admin Management Permissions for super-admin
  CREATE_ADMIN = "create-admin",
  VIEW_ADMIN_LIST = "view-admin-list",
  UPDATE_ADMIN_STATUS = "update-admin-status",
  DELETE_ADMIN = "delete-admin",

  // User Profile Management Permissions (Admin perspective)
  VIEW_USER_PROFILE = "view-user-profile",
  UPDATE_USER_PRICE_PLAN = "update-user-price-plan",

  // Dashboard Permissions
  VIEW_CONVERSATION_LIST = "view-conversation-list",
  VIEW_CONVERSATION_DETAIL = "view-conversation-detail",

  // Bot Management Permissions
  CREATE_BOT = "create-bot",
  EDIT_BOT = "edit-bot",
  VIEW_BOT_LIST = "view-bot-list",
  UPDATE_BOT_STATUS = "update-bot-status",
  DEPLOY_BOT = "deploy-bot",

  // Bot Builder Permissions
  UPLOAD_KNOWLEDGE_DOCUMENT = "upload-knowledge-document",
  SET_WELCOME_MESSAGE = "set-welcome-message",
  SET_FALLBACK_MESSAGE = "set-fallback-message",
  ADD_HANDOVER_TO_HUMAN = "add-handover-to-human",
  MANAGE_INTENTS = "manage-intents",
  SET_SYSTEM_PROMPT = "set-system-prompt",
  TEST_BOT = "test-bot",

  // General System Permissions (likely Super Admin only)
  MANAGE_ALL_USERS = "manage-all-users",
  MANAGE_SYSTEM_SETTINGS = "manage-system-settings",
}
