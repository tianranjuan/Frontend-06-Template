const net = require("net");

class Request {
  constructor(options) {
    this.method = options.method || "GET";
    this.host = options.host;
    this.port = options.port || "80";
    this.path = options.path || "/";
    this.body = options.body || {};
    this.headers = options.headers || {};
    if (!this.headers["Content-Type"]) {
      this.headers["Content-Type"] = "application/x-www-form-unrlencoded";
    }

    if (this.headers["Content-Type"] === "application/json") {
      this.bodyText = JSON.stringify(this.body);
    } else if (
      this.headers["Content-Type"] === "application/x-www-form-unrlencoded"
    ) {
      this.bodyText = Object.keys(this.body)
        .map((key) => `${key}=${encodeURIComponent(this.body[key])}`)
        .join("&");
    }

    this.headers["Content-Length"] = this.bodyText.length;

    return this;
  }

  send(connection) {
    return new Promise((resolve, reject) => {
      let parser = new ResponseParser();
      if (connection) {
        connection.write(this.toString());
      } else {
        connection = net.createConnection(
          {
            host: this.host,
            port: this.port,
          },
          () => {
            connection.write(this.toString());
          }
        );

        connection.on("data", (data) => {
          parser.receive(data.toString());
          if (parser.isFinished) {
            resolve(parser.response);
            connection.end();
          }
        });
        connection.on("error", (err) => {
          console.log("err :>> ", err);
          reject(err);
          connection.end();
        });
      }
    });
  }

  toString() {
    return `${this.method.toUpperCase()} ${this.path} HTTP/1.1\r
${Object.keys(this.headers)
  .map((key) => `${key}: ${this.headers[key]}`)
  .join("\r\n")}\r
\r
${this.bodyText}`;
  }
}

class ResponseParser {
  constructor() {
    this.currStatus = this.WaitStatusLine;
    this.headers = {};
    this.statusLine = "";
    this.headerName = "";
    this.headerValue = "";
    this.bodyParser = null;
  }

  get isFinished() {
    return this.bodyParser && this.bodyParser.isFinished;
  }

  get response() {
    this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\S\s]+)/);
    return {
      statusCode: RegExp.$1,
      statusText: RegExp.$2,
      headers: this.headers,
      body: this.bodyParser.content.join(""),
    };
  }

  receive(string) {
    for (let i = 0; i < string.length; i++) {
      let statusFn = this.currStatus(string[i]);
      if (statusFn) {
        this.currStatus = statusFn;
      }
    }
  }

  WaitStatusLine(char) {
    if (char === "\r") {
      return this.WaitStatusLineEnd;
    } else {
      this.statusLine += char;
      return this.WaitStatusLine;
    }
  }

  WaitStatusLineEnd(char) {
    if (char === "\n") {
      return this.WaitHeaderName;
    }
  }

  WaitHeaderName(char) {
    if (char === ":") {
      return this.WaitHeaderSpace;
    } else if (char === "\r") {
      if (this.headers["Transfer-Encoding"] === "chunked") {
        this.bodyParser = new ChunkBodyParser();
      }
      return this.WaitHeaderBlockEnd;
    } else {
      this.headerName += char;
      return this.WaitHeaderName;
    }
  }
  WaitHeaderSpace(char) {
    if (char === " ") {
      return this.WaitHeaderValue;
    }
  }
  WaitHeaderValue(char) {
    if (char === "\r") {
      this.headers[this.headerName] = this.headerValue;
      this.headerName = "";
      this.headerValue = "";
      return this.WaitHeaderLineEnd;
    } else {
      this.headerValue += char;
      return this.WaitHeaderValue;
    }
  }
  WaitHeaderLineEnd(char) {
    if (char === "\n") {
      return this.WaitHeaderName;
    }
  }
  WaitHeaderBlockEnd(char) {
    if (char === "\n") {
      return this.WaitBody;
    }
  }

  WaitBody(char) {
    this.bodyParser.receive(char);
    return this.WaitBody;
  }
}

class ChunkBodyParser {
  constructor() {
    this.currStatus = this.WaitLength;
    this.length = 0;
    this.content = [];
    this.isFinished = false;
  }

  receive(char) {
    const statusFn = this.currStatus(char);
    if (statusFn) {
      this.currStatus = statusFn;
    }
  }

  WaitLength(char) {
    if (char === "\r") {
      if (this.length === 0) {
        this.isFinished = true;
      }
      return this.WaitLengthEnd;
    } else {
      this.length *= 16;
      this.length += parseInt(char, 16);
      return this.WaitLength;
    }
  }

  WaitLengthEnd(char) {
    if (char === "\n") {
      return this.ReadingChunk;
    }
    if (this.isFinished) {
      return;
    }
  }

  ReadingChunk(char) {
    this.content.push(char);
    this.length--;
    if (this.length === 0) {
      return this.WaitNewLine;
    }
    return this.ReadingChunk;
  }

  WaitNewLine(char) {
    if (char === "\r") {
      return this.WaitNewLineEnd;
    }
  }

  WaitNewLineEnd(char) {
    if (char === "\n") {
      return this.WaitLength;
    }
  }
}

new Request({
  method: "GET",
  host: "127.0.0.1",
  port: "8088",
  path: "/",
  headers: {
    "Content-Type": "application/x-www-form-unrlencoded",
    token: "123456",
  },
  body: {
    name: "tianranjuan",
    group: "1",
  },
}).send();
