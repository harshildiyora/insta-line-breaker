import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { validationResult } from 'express-validator';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const register = catchAsync(async (req, res, next) => {
  // console.log("Register Request Body: ", req.body);

  const errors = validationResult(req);
  // console.log("Register errors: ", errors.array());

  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const { name, email, password } = req.body;

  let user = await User.findOne({ email });
  if (user) {
    return next(new AppError('User already exists', 400));
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  user = new User({
    name,
    email,
    password: hashedPassword,
    authProvider: 'local'
  });

  await user.save();

  const token = generateToken(user._id);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: { id: user._id, name: user.name, email: user.email }
    }
  });
});

export const login = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  if (user.authProvider !== 'local') {
    return next(new AppError(`Please login using ${user.authProvider}`, 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppError('Invalid email or password', 401));
  }

  const token = generateToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: { id: user._id, name: user.name, email: user.email }
    }
  });
});

export const googleLogin = catchAsync(async (req, res, next) => {
  const { credential } = req.body;
  if (!credential) {
    return next(new AppError('Google credential is required', 400));
  }

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name, sub: googleId } = payload;

  let user = await User.findOne({ email });

  if (!user) {
    user = new User({
      name,
      email,
      googleId,
      authProvider: 'google'
    });
    await user.save();
  } else if (user.authProvider !== 'google') {
    user.googleId = googleId;
    user.authProvider = 'google';
    await user.save();
  }

  const token = generateToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: { id: user._id, name: user.name, email: user.email }
    }
  });
});

export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user).select('-password');
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});
