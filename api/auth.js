const querystring = require('querystring');
const request = require('request-promise');

const auth = require('../src/auth');
const server = require('../server');

module.exports = function (data) {
  return data.res.sendStatus(403);
  try {
    if (auth.sessionValid(data.authUserID, data.authSession)) {
      data.res.redirect("/#sessionValid");
    } else {
      if (!data.req.query.code) {
        data.res.redirect("/login#invalidCode");
      } else {
        var bodyObj = {
          'client_id': server.bot.user.id,
          'client_secret': process.env.DISCORD_SECRET,
          'grant_type': 'authorization_code',
          'redirect_uri': `https://sn-moty.glitch.me/auth`,
          'scope': 'identify',
          'code': data.req.query.code,
        };
        var body = querystring.stringify(bodyObj);

        request.post({
          uri: "https://discordapp.com/api/oauth2/token",
          body: body,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then(async response => {
          var reqObj = JSON.parse(response);

          var tokenType = reqObj.token_type;
          var accessToken = reqObj.access_token;

          var userData = await auth.getUserData(accessToken, tokenType);
          var userID = userData.id;
          var sessionToken = auth.generateToken();

          auth.setToken(userID, sessionToken, accessToken);
          auth.setCookies(data.res, userID, sessionToken);

          data.res.redirect("/#loggedIn");
        }).catch(e => {
          console.error(e);
          if (e.response && e.response.body)
            data.res.send(e.response.body);
          else
            data.res.redirect("/login#promiseRejected");
        });
      }
    }
  } catch (e) {
    console.error(e);
    data.res.redirect("/login#caughtError");
  }
}