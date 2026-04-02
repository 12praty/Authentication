import userModel from "../user.model";
import { ErrorType } from "../error/error";
import { sendError, userCreateSuccess } from "../utils/response";
import argon from "argon";

export async function register(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return sendError(res, ErrorType.ALL_FIELD_IS_IMPORTANT);
  }

  try {
    const isAlreadyRegister = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (isAlreadyRegister)  {
      return sendError(res, ErrorType.EMAIL_USERNAME_EXISTS);
    }

    const hashedPassword = await argon.hash(password);
    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });
    userCreateSuccess(res);
  } catch (error) {
    return sendError(res, ErrorType.INTERNAL_SERVER_ERROR);
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendError(res, ErrorType.ALL_FIELD_IS_IMPORTANT);
  }
  const user = await userModel.findOne({ email });
  if (!user) {
    return sendError(res, ErrorType.INVALID_REQUEST);
  }
  const isPasswordValid = await argon.verify(user.password, password);
  if(!isPasswordValid){
    return sendError(res,ErrorType.INVALID_REQUEST)
  }
  
}
