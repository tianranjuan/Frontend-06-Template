var assert = require("assert");

import { parserHTML } from "../src/parser";

const html = `
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      *{
        padding: 0px;
      }
      .container {
        display: flex;
        width: 300px;
        height: 300px;
        background: rgb(255, 255, 255);
      }
      .container .div1 {
        width: 50px;
        height: 50px;
        background: rgb(255, 0, 0);
      }

      .container .div2 {
        flex: 1;
        height: 100px;
        background: rgb(0, 255, 0);
      }
      .container .div3 {
        width: 150px;
        background: rgb(0, 0, 255);
      }
      .container>.div3 {
        width: 150px;
        background: rgb(0, 0, 255);
      }

      #d {
        color: blue;
      }

      div{
        color: green;
      }
    </style>
  </head>
  <body>
    <div id="d" class="container">
      <div class="div1"></div>
      <div class="div2"></div>
      <div class="div3"></div>
    </div>
  </body>
</html>

`;

describe("parser html:", function () {
  it("<a></a>", function () {
    const tree = parserHTML("<a></a>");
    assert.equal(tree.children[0].tagName, "a");
    assert.equal(tree.children[0].children.length, 0);
  });
  it("<A></A>", function () {
    const tree = parserHTML("<A></A>");
    assert.equal(tree.children[0].tagName, "A");
    assert.equal(tree.children[0].children.length, 0);
  });
  it("<a />", function () {
    const tree = parserHTML("<a />");
    assert.equal(tree.children[0].tagName, "a");
    assert.equal(tree.children[0].children.length, 0);
  });
  it("<a></>", function () {
    const tree = parserHTML("<a></>");
    assert.equal(tree.children[0].tagName, "a");
    assert.equal(tree.children[0].children.length, 0);
  });
  it("<a></&", function () {
    try {
      const tree = parserHTML("<a></&");
    } catch (error) {}
  });
  it("<a id='a'/>", function () {
    const tree = parserHTML("<a id='a'/>");
    assert.equal(tree.children[0].tagName, "a");
    assert.equal(tree.children[0].children.length, 0);
  });
  it('<a href="http://www.alloyteam.com/2019/07/13481/"></a>', function () {
    const tree = parserHTML(
      '<a href="http://www.alloyteam.com/2019/07/13481/"></a>'
    );
    assert.equal(tree.children.length, 1);
    assert.equal(tree.children[0].children.length, 0);
  });
  it("<a href></a>", function () {
    const tree = parserHTML("<a href></a>");
    assert.equal(tree.children.length, 1);
    assert.equal(tree.children[0].children.length, 0);
  });
  it("<a href id></a>", function () {
    const tree = parserHTML("<a href id></a>");
    assert.equal(tree.children.length, 1);
    assert.equal(tree.children[0].children.length, 0);
  });
  it('<a href id="a"></a>', function () {
    const tree = parserHTML('<a href id="a"></a>');
    assert.equal(tree.children.length, 1);
    assert.equal(tree.children[0].children.length, 0);
  });
  it("<a id=abc ></a>", function () {
    const tree = parserHTML("<a id=abc></a>");
    assert.equal(tree.children.length, 1);
    assert.equal(tree.children[0].children.length, 0);
  });
  it("<a id=abc />", function () {
    const tree = parserHTML("<a id=abc />");
    assert.equal(tree.children.length, 1);
    assert.equal(tree.children[0].children.length, 0);
  });
  it("<a id=abc / <a>123</a>", function () {
    const tree = parserHTML("<a id=abc / <a>123</a>");
  });
  it("<a id=abc /", function () {
    const tree = parserHTML("<a id=abc /");
  });
  it('<a id=abc" />', function () {
    const tree = parserHTML('<a id=abc" />');
  });
  it('<a id=abc"', function () {
    try {
      const tree = parserHTML('<a id=abc"');
    } catch (error) {}
  });
  it("<a id='", function () {
    try {
      const tree = parserHTML("<a id='");
    } catch (error) {}
  });
  it('<a id="', function () {
    try {
      const tree = parserHTML('<a id="');
    } catch (error) {}
  });
  it('<a id ="a"', function () {
    try {
      const tree = parserHTML('<a id ="a"');
    } catch (e) {
      // console.log("e :>> ", e);
    }
  });
  it('<a id="a"1', function () {
    try {
      const tree = parserHTML('<a id="a"1');
    } catch (e) {
      // console.log("e :>> ", e);
    }
  });
  it("<a  id=  />", function () {
    const tree = parserHTML("<a id= />");
  });
  it("<a id=>", function () {
    const tree = parserHTML("<a id=>");
  });
  it('<a id\u0000="a" />', function () {
    try {
      const tree = parserHTML('<a id\u0000="a"/>');
    } catch (error) {
      // console.log("error :>> ", error);
    }
  });
  it("<a id='abc' />", function () {
    const tree = parserHTML("<a id='abc' />");
    assert.equal(tree.children.length, 1);
    assert.equal(tree.children[0].children.length, 0);
  });
  it("<a = />", function () {
    const tree = parserHTML("<a =/>");
    assert.equal(tree.children.length, 1);
    assert.equal(tree.children[0].children.length, 0);
  });
  it("<a /", function () {
    const tree = parserHTML("<a /");
    assert.equal(tree.children.length, 0);
  });
  it("<a/>", function () {
    const tree = parserHTML("<a/>");
    assert.equal(tree.children.length, 1);
    assert.equal(tree.children[0].tagName, "a");
  });
  it("<my-component ></my-component>", function () {
    const tree = parserHTML("<my-component ></my-component>");
    assert.equal(tree.children.length, 1);
    assert.equal(tree.children[0].tagName, "my-component");
  });
  it("html", function () {
    const tree = parserHTML(html);
    console.log('tree :>> ', tree.children[1].children[3].children);
    assert.equal(tree.children.length, 3);
    assert.equal(tree.children[1].tagName, "html");
    assert.equal(tree.children[1].children.length, 5);
    assert.equal(tree.children[1].children[1].tagName, "head");
    assert.equal(tree.children[1].children[1].children.length, 9);
    assert.equal(tree.children[1].children[1].children[7].tagName, "style");
    assert.equal(tree.children[1].children[3].tagName, "body");
    assert.equal(tree.children[1].children[3].children[1].tagName, "div");
    assert.equal(tree.children[1].children[3].children[1].style.display, "flex");
    assert.equal(tree.children[1].children[3].children[1].style.color, "blue");
    assert.equal(tree.children[1].children[3].children[1].style.width, 300);
    assert.equal(tree.children[1].children[3].children[1].style.height, 300);
    assert.equal(tree.children[1].attributes.length, 1);
  });
  it("<style>body{padding: 0px;} </style>", function () {
    const tree = parserHTML("<style>body{padding: 0px;} </style>");
    assert.equal(tree.children[0].tagName, "style");
  });
});
