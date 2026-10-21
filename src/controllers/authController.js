const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { User } = require('../models');

function createToken(userId) {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function getPublicUser(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    createdAt: user.createdAt,
  };
}

async function register(req, res, next) {
  try {
    const username =
      typeof req.body.username === 'string'
        ? req.body.username.trim().toLowerCase()
        : '';

    const password =
      typeof req.body.password === 'string'
        ? req.body.password
        : '';

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({
        message: '用户名长度必须为 3 至 30 个字符',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: '密码长度不能少于 8 个字符',
      });
    }
    if (bcrypt.truncates(password)) {
      return res.status(400).json({
      message: '密码不能超过 72 个 UTF-8 字节',
      });
    }

    const existingUser = await User.exists({ username });

    if (existingUser) {
      return res.status(409).json({
        message: '用户名已存在',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      passwordHash,
    });

    const token = createToken(user._id.toString());

    return res.status(201).json({
      user: getPublicUser(user),
      token,
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({
        message: '用户名已存在',
      });
    }

    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const username =
      typeof req.body.username === 'string'
        ? req.body.username.trim().toLowerCase()
        : '';

    const password =
      typeof req.body.password === 'string'
        ? req.body.password
        : '';

    if (!username || !password) {
      return res.status(400).json({
        message: '用户名和密码不能为空',
      });
    }

    const user = await User.findOne({ username })
      .select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        message: '用户名或密码错误',
      });
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        message: '用户名或密码错误',
      });
    }

    const token = createToken(user._id.toString());

    return res.status(200).json({
      user: getPublicUser(user),
      token,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
};