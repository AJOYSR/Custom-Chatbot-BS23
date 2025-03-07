export const enum AuthErrorMessages {
  EMAIL_ALREADY_EXISTS = "message.auth.errors.emailAlreadyExists",
  INVALID_ROLE_ID = "message.auth.errors.invalidRoleId",
  SIGNUP_ERROR = "message.auth.errors.signupError",
  INVALID_CREDENTIALS = "message.auth.errors.invalidCredentials",
  INVALID_TOKEN = "message.auth.errors.invalidToken",
  INVALID_EMAIL = "message.auth.errors.invalidEmail",
  FORGOT_PASSWORD_ERROR = "message.auth.errors.forgotPasswordError",
  RESET_PASSWORD_ERROR = "message.auth.errors.resetPasswordError",
}

export const enum CommonErrorMessages {
  SOMETHING_WENT_WRONG = "message.common.errors.somethingWentWrong",
}

export const enum UnauthorizedErrorMessages {
  ACCOUNT_INACTIVE = "message.unauthorized.errors.accountInactive",
  INVALID_USER = "message.unauthorized.errors.invalidUser",
  ACTION_RESTRICTED = "message.unauthorized.errors.actionRestricted",
}

export const enum UserErrorMessages {
  COULD_NOT_GET_USER = "message.user.errors.couldNotGetUser",
  COULD_NOT_DELETE_USER = "message.user.errors.couldNotDeleteUser",
  EMAIL_ALREADY_EXISTS = "message.user.errors.emailAlreadyExists",
  INVALID_ROLE_ID = "message.user.errors.invalidRoleId",
  FORBIDDEN_PERMISSION = "message.user.errors.forbiddenPermission",
  COULD_NOT_CREATE_USER = "message.user.errors.couldNotCreateUser",
  COULD_NOT_UPDATE_USER = "message.user.errors.couldNotUpdateUser",
  INVALID_USER_ID = "message.user.errors.invalidUserId",
  CURRENT_PASSWORD_IS_INCORRECT = "message.user.errors.currentPasswordIsInvalid",
  FAILED_TO_CHANGE_PASSWORD = "message.user.errors.failedToChangePassword",
  FAILED_TO_CHANGE_EMAIL = "message.user.errors.failedToChangeEmail",
  INVALID_CODE = "message.user.errors.invalidCode",
}

export const enum MediaErrorMessages {
  FAILED_TO_UPLOAD = "message.media.errors.failedToUpload",
  INVALID_FILE_TYPE = "message.media.errors.invalidFileType",
  NO_FILE_FOUND = "message.media.errors.noFileFound",
}

export const enum MediaSuccessMessages {
  MOVED_FILES = "message.media.success.transferredMedia",
  DELETED_FILES = "message.media.success.deletedMedia",
}

export const enum AuthSuccessMessages {
  SIGNUP_SUCCESSFUL = "message.auth.success.signupSuccessful",
  VERIFICATION_SUCCESSFUL = "message.auth.success.verificationSuccessful",
  PASSWORD_RESET_SUCCESSFUL = "message.auth.success.passwordResetSuccessful",
  SEND_EMAIL = "message.auth.success.sendEmail",
  PASSWORD_CHANGED_SUCCESSFUL = "message.auth.success.passwordChangedSuccessful",
}

export const enum UserSuccessMessages {
  EMAIL_CHANGED_SUCCESSFUL = "message.user.success.emailChangedSuccessful",
}
