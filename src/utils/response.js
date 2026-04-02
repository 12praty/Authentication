export function userCreateSuccess(res, statusCode = 200) {
  res.status(statusCode).json({
    success: true,
    message: "User Created Sucessfully",
    error: null,
  });
}

export function sendError(res, errorType) {
  return res.status(errorType.status).json({
    success: false,
    data: null,
    error: {
      code: errorType.code,
      message: errorType.message,
    },
  });
}
