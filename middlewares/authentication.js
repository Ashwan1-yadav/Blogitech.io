const { validateToken } = require("../services/authServices");

function checkForAuthenticationCookie() {
  return (req, res, next) => {
    const tokenCookieVal = req.cookies?.cookie;

    if (!tokenCookieVal) {
      return res.render("login", { error: "Please login to continue !" });
    }

    try {
      const payload = validateToken(tokenCookieVal);
      req.user = payload;
      return next();
    } catch (error) {
      return res.render("login", { error: "Login first" });
    }
  };
}

module.exports = {
  checkForAuthenticationCookie
};
