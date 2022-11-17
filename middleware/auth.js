const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
    const token = req.cookies.token || req.body.token || req.query.token || req.header('Authorization').replace('Bearer ', '');

    if (!token) {
        return res.status(403).send("NO Token Found")
    }

    try {
        const decode = jwt.verify(token, process.env.SECRET_KEY);
        console.log(decode);
        req.user = decode;
    }
    catch (err) {
        return res.status(403).send("Invalid Token")
    }

    return next();
}

module.exports = auth;
