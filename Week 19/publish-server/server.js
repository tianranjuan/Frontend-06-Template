const http = require("http");
const https = require("https");
const unzipper = require("unzipper");
const querystring = require("querystring");

function auth(request, response) {
  const query = querystring.parse(request.url.match(/^\/auth\?([\s\S]+)$/)[1]);
  getToken(query.code, (info) => {
    response.write(
      `<a href="http://localhost:3002?token=${info.access_token}">publish</a>`
    );
    response.end();
  });
}

function getToken(code, callback) {
  const request = https.request(
    {
      hostname: "github.com",
      port: 443,
      path: `/login/oauth/access_token?client_id=80d57cc31fa4e30e47fe&client_secret=a2a46f2e148197dbf4ac471f2c0b4362f9a2e23a&code=${code}`,
      method: "POST",
    },
    function (response) {
      let body = "";
      response.on("data", (chunk) => {
        body += chunk.toString();
      });
      response.on("end", () => {
        callback(querystring.parse(body));
      });
    }
  );
  request.end();
}

function getUser(token, callback) {
  const request = https.request(
    {
      hostname: "api.github.com",
      port: 443,
      path: `/user`,
      method: "GET",
      headers: {
        Authorization: `token ${token}`,
        "User-Agent": "toy-publish"
      },
    },
    function (response) {
      let body = "";
      response.on("data", (chunk) => {
        body += chunk.toString();
      });
      response.on("end", () => {
        callback(JSON.parse(body));
      });
    }
  );
  request.end();
}

function publish(request, response) {
  const query = querystring.parse(request.url.match(/^\/publish\?([\s\S]+)$/)[1]);
  getUser(query.token, (user) => {
    if (user.login === "tianranjuan"){
      request.pipe(unzipper.Extract({ path: "../server/public" }));
      request.on("end", () => {
        response.end("success");
      });
    }
  });
}

http
  .createServer(function (request, response) {
    if (request.url.match(/^\/auth\?/)) {
      auth(request, response);
    } else if (request.url.match(/^\/publish\?/)) {
      publish(request, response);
    }
  })
  .listen(3001);

// a2a46f2e148197dbf4ac471f2c0b4362f9a2e23a
