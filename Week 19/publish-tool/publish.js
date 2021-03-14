const http = require("http");
const archiver = require("archiver");
const child_process = require("child_process");
const querystring = require("querystring");

child_process.exec(
  `start https://github.com/login/oauth/authorize?client_id=80d57cc31fa4e30e47fe`
);

http
  .createServer(function (request, response) {
    const query = querystring.parse(request.url.match(/^\/\?([\s\S]+)$/)[1]);
    publish(query.token);
    response.end("success");
  })
  .listen(3002);

function publish(token) {
  const request = http.request(
    {
      hostname: "127.0.0.1",
      port: 3001,
      method: "POST",
      path: `/publish?token=${token}`,
      headers: {
        "Content-Type": "application/octet-stream",
      },
    },
    (response) => {
      response.on("end", () => {
        response.end();
      });
    }
  );

  const archive = archiver("zip", {
    zlib: { level: 9 }, // Sets the compression level.
  });
  archive.directory("./publish/", false);
  archive.pipe(request); //z转写流
  archive.finalize(); // 标志已结束
}
