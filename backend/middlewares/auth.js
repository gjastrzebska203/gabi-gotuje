const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Brak tokenu autoryzacyjnego" });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: "Nieprawidłowy token" });
  }
};

module.exports = authenticate;

// const jwt = require("jsonwebtoken");

// module.exports = (req, res, next) => {
//   const token = req.headers.authorization;

//   if (!token || !token.startsWith("Bearer ")) {
//     return res
//       .status(403)
//       .json({ error: "Brak tokena lub niepoprawny format" });
//   }

//   try {
//     const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(403).json({ error: "Niepoprawny token" });
//   }
// };
