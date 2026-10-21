const jwt = require('jsonwebtoken');

const { User } = require('../models');

async function auth(req, res, next) {
  const authorization = req.get('Authorization') || '';

  if (!authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      message: '缺少有效的登录令牌',
    });
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      message: '缺少有效的登录令牌',
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({
        message: '登录用户不存在',
      });
    }

    req.user = {
      id: user._id.toString(),
      username: user.username,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      message: '登录令牌无效或已过期',
    });
  }
}

module.exports = auth;