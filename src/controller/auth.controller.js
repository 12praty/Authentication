import userModel from "../user.model";
import { ErrorType } from "../error/error";
import { sendError, userCreateSuccess } from "../utils/response";
import argon from "argon";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export async function register(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return sendError(res, ErrorType.ALL_FIELD_IS_IMPORTANT);
  }

  try {
    const isAlreadyRegister = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (isAlreadyRegister) {
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
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, ErrorType.ALL_FIELD_IS_IMPORTANT);
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return sendError(res, ErrorType.INVALID_REQUEST);
    }
    const isPasswordValid = await argon.verify(user.password, password);
    if (!isPasswordValid) {
      return sendError(res, ErrorType.INVALID_REQUEST);
    }

    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign({ id: user._id }, REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "logged in successfully",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return sendError(res, ErrorType.INTERNAL_SERVER_ERROR);
  }
}

export async function refresh(req, res) {
  try {
    const token = req.cookie.refreshToken;
    if (!token) {
      return sendError(res, ErrorType.INVALID_REQUEST);
    }
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);

    const user = await userModel.findOne({
      _id: decoded._id,
      refreshToken: token,
    });
    if (!user) {
      return sendError(res, ErrorType.INVALID_REQUEST);
    }

    const newAccessToken = jwt.sign(
      { id: user._id, email: user.email },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );
    return res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    return sendError(res, ErrorType.INTERNAL_SERVER_ERROR);
  }
}
export async function logout(req, res) {
  try {
    const token = req.cookie.refreshToken;
    if (token) {
      const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
      await userModel.findByIdAndUpdate(decoded.id, { refreshToken: null });
    }
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Logout successfully" });
  } catch (error) {
    return sendError(res, ErrorType.INTERNAL_SERVER_ERROR);
  }
}
