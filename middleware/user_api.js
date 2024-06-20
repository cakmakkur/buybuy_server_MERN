const jwt = require('jsonwebtoken')

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization']
  if (!authHeader) {
    console.log('Auth header missing')
    return res.sendStatus(401)
  }
  const token = authHeader.split(' ')[1]
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (err, decoded) => {
      if (err) {
        console.log('invalid token', err);
        return res.sendStatus(403);
      }
      if (!decoded) {
        console.log('No data decoded');
        return res.sendStatus(403);
      }
      req.user = decoded.UserInfo.username;
      req.roles = decoded.UserInfo.roles || [];
      next();
    }
  );
}

const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.roles) return res.sendStatus(401)
    const rolesArray = [...allowedRoles]
    const hasRole = req.roles.some(role => rolesArray.includes(role));
    if (!hasRole) return res.sendStatus(401)
    next()
  }
}


module.exports = {verifyJWT, verifyRoles}