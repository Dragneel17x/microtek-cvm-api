const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {

  const bearerHeader = req.headers['authorization'];
  if (!bearerHeader) {
    return res.status(401).json({
      status: 401,
      success: false,
      valid_token: false,
      message: 'Token Required'
    });
  }
  try {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    jwt.verify(bearerToken, "process.env.TOKEN_KEY", (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: 401,
          success: false,
          valid_token: false,
          message: 'Unauthorized User!'
        });
      }
      else if(Date.now() > (decoded.exp * 1000)-1920000){
        return res.status(401).json({
          status: 401,
          success: false,
          valid_token: false,
          message: 'Unauthorized User!'
        });
      }
      req.decoded = decoded;
      next();
    });
  } catch (err) {
    return res.status(401).json({
      status: 401,
      success: false,
      valid_token: false,
      message: 'Unauthorized User!'
    });
  }
};

module.exports = verifyToken;
