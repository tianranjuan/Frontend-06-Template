const http = require("http");
const fs = require("fs");
const path = require("path");

http
  .createServer((request, response) => {
    let body = [];

    request
      .on("error", (err) => {
        console.log("err :>> ", err);
      })
      .on("data", (chunk) => {
        body.push(chunk);
      })
      .on("end", () => {
        body = Buffer.concat(body).toString();
        response.writeHead(200, { "Content-Type": "text/html" });
        response.end(
          fs.readFileSync(path.join(__dirname, "./index.html")).toString()
        );
      });
  })
  .listen(8088);
