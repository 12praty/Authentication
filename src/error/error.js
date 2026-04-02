export const ErrorType = {
  EMAIL_USERNAME_EXISTS: {
    status: 409,
    code: "EMAIL_USERNAME_EXISTS",
    message: "username or email already exist",
  },
  BAD_REQUEST: {
    status: 400,
    code: "BAD_REQUEST",
    message: "Invalid request Data",
  },
  UNAUTHORIZED: {
    status: 401,
    code: "UNAUTHORIZED",
    message: "Unauthorized",
  },
  ALL_FIELD_IS_IMPORTANT: {
    status: 400,
    code: "ALL_FIELD_IS_IMPORTANT",
    message: "fill all the fields",
  },
  INVALID_REQUEST: {
    status: 404,
    code: "INVALID_REQUEST",
    message: "Invalid email or password",
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
  },
};
