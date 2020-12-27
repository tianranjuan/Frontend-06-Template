const css = require("css");

const EOF = Symbol("EOF");
let currentToken = {};
let currentAttribute = {};
let currentTextNode = null;

const stack = [{ type: "document", children: [] }];
const rules = [];

function addCSSRules(text) {
  let ast = css.parse(text);
  rules.push(...ast.stylesheet.rules);
}

function matchSelector(element, selector) {
  if (!selector || !element.attributes) {
    return false;
  }

  // 支持通配符*
  if (selector === "*") {
    return true;
    // 支持复合选择器 -> 直接子代组合器 不支持在>中添加" "
  } else if (selector.includes(">")) {
    let selectors = selector.split(">").reverse();
    let tmp = { parent: element };
    let rs = selectors.every((s) => {
      let result = matchSelector(tmp.parent, s);
      tmp = tmp.parent;
      return result;
    });

    return rs;
  } else if (selector.charAt(0) === "#") {
    let attr = element.attributes.filter((attr) => attr.name === "id")[0];
    if (attr && attr.value === selector.replace("#", "")) {
      return true;
    }
  } else if (selector.charAt(0) === ".") {
    let attr = element.attributes.filter((attr) => attr.name === "class")[0];
    // 支持多个class的
    if (attr && attr.value.split(" ").includes(selector.replace(".", ""))) {
      return true;
    }
  } else if (element.tagName === selector) {
    return true;
  }
  return false;
}

function computeCSS(element) {
  const elements = stack.slice().reverse();
  if (!element.computedStyle) {
    element.computedStyle = {};
  }
  for (let rule of rules) {
    let selectorParts = rule.selectors[0].split(" ").reverse();

    if (!matchSelector(element, selectorParts[0])) {
      continue;
    }
    let matched = false;
    let j = 1;
    for (let i = 0; i < elements.length; i++) {
      if (matchSelector(elements[i], selectorParts[j])) {
        j++;
      }
    }

    if (j >= selectorParts.length) {
      matched = true;
    }

    if (matched) {
      let sp = specificity(rule.selectors[0]);
      const computedStyle = element.computedStyle;
      for (let declaration of rule.declarations) {
        if (!computedStyle[declaration.property]) {
          computedStyle[declaration.property] = {};
        }

        if (!computedStyle[declaration.property].specificity) {
          computedStyle[declaration.property].value = declaration.value;
          computedStyle[declaration.property].specificity = sp;
        } else if (
          compare(computedStyle[declaration.property].specificity, sp) < 0
        ) {
          computedStyle[declaration.property].value = declaration.value;
          computedStyle[declaration.property].specificity = sp;
        }
      }
      // console.log("element :>> ", element, "matched rule :>> ", rule);
    }
  }
}

function specificity(selector) {
  const p = [0, 0, 0, 0];
  let selectorParts = selector.split(" ");
  for (let part of selectorParts) {
    if (part === "*") {
      return p;
    } else if (selector.includes(">")) {
      let selectors = part.split(">");
      selectors.map((s) => {
        let sp = specificity(s);
        p[0] += sp[0];
        p[1] += sp[1];
        p[2] += sp[2];
        p[3] += sp[3];
      });

      return p;
    } else if (part.charAt(0) === "#") {
      p[1] += 1;
    } else if (part.charAt(0) === ".") {
      p[2] += 1;
    } else {
      p[3] += 1;
    }
  }
  return p;
}

function compare(sp1, sp2) {
  if (sp1[0] - sp2[0]) {
    return sp1[0] - sp2[0];
  }
  if (sp1[1] - sp2[1]) {
    return sp1[1] - sp2[1];
  }
  if (sp1[2] - sp2[2]) {
    return sp1[2] - sp2[2];
  }
  return sp1[3] - sp2[3];
}

function emit(token) {
  let top = stack[stack.length - 1];
  if (token.__type === "startTag") {
    const element = {
      type: "element",
      children: [],
      attributes: [],
    };

    element.tagName = token.__tagName;

    for (let attr in token) {
      if (attr !== "__type" && attr !== "__tagName") {
        element.attributes.push({ name: attr, value: token[attr] });
      }
    }

    top.children.push(element);
    element.parent = top;

    // 计算css样式
    computeCSS(element);

    if (!token.__isSelfClose) {
      stack.push(element);
    }
    currentTextNode = null;
  } else if (token.__type === "endTag") {
    if (token.__tagName !== top.tagName) {
      throw Error("标签不匹配");
    } else {
      // 收集CSS规则
      if (token.__tagName === "style") {
        addCSSRules(top.children[0].content);
      }
      stack.pop();
    }
    currentTextNode = null;
  } else if (token.__type === "text") {
    if (currentTextNode) {
      currentTextNode.content += token.__content;
    } else {
      currentTextNode = {
        type: "text",
        content: "",
      };
      top.children.push(currentTextNode);
    }
  }
}

function data(c) {
  if (c === "<") {
    return tagOpenState;
  } else if (c === EOF) {
    emit({
      __type: "end-of-file",
    });
  } else {
    emit({
      __type: "text",
      __content: c,
    });
    return data;
  }
}

function tagOpenState(c) {
  if (c === "/") {
    return endTagOpenState;
  } else if (c === EOF) {
    throw Error("文档解析错误，已退出解析！");
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      __type: "startTag",
      __tagName: "",
    };
    return tagNameState(c);
  } else {
    throw Error("文档解析错误，已退出解析！");
  }
}

function endTagOpenState(c) {
  if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      __type: "endTag",
      __tagName: "",
    };
    return tagNameState(c);
  } else if (c === ">") {
    console.log("缺少闭合标签 :>> ");
    return data;
  } else {
    throw Error("文档解析错误，已退出解析！");
  }
}

function tagNameState(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeNameState;
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken.__tagName += c;
    return tagNameState;
  } else if (c === "/") {
    return selfClosingStartTagState;
  } else if (c === ">") {
    emit(currentToken);
    return data;
  } else {
    currentToken.__tagName += c;
    return tagNameState;
  }
}

function beforeAttributeNameState(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    // <img
    return beforeAttributeNameState;
  } else if (c === ">" || c === "/" || c === EOF) {
    // <img > || <img / || eof
    return afterAttributeNameState(c);
  } else if (c === "=") {
    console.log("属性名前的意外=号解析错误");
    //  <img =
    currentAttribute = {
      __name: c,
      __value: "",
    };
    return attributeNameState;
  } else {
    // <img a
    currentAttribute = {
      __name: "",
      __value: "",
    };
    return attributeNameState(c);
  }
}

function afterAttributeNameState(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    // <img src
    return afterAttributeNameState;
  } else if (c === "/") {
    // <img src/
    return selfClosingStartTagState;
  } else if (c === "=") {
    // <img src=
    return beforeAttributeValueState;
  } else if (c === ">") {
    emit(currentToken);
    return data;
  } else {
    return attributeNameState(c);
  }
}

function attributeNameState(c) {
  if (c.match(/^[\t\n\f ]$/) || c === "/" || c === ">" || c === EOF) {
    return afterAttributeNameState(c);
  } else if (c === "=") {
    return beforeAttributeValueState;
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentAttribute.__name += c;
    return attributeNameState;
  } else if (c === "\u0000") {
    currentAttribute.__name += "\uFFFD";
    return;
  } else if (c === "'" || c === '"' || c === "<") {
    currentAttribute.__name += c;
    return attributeNameState;
  } else {
    currentAttribute.__name += c;
    return attributeNameState;
  }
}

function beforeAttributeValueState(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    // <img src=
    return beforeAttributeValueState;
  } else if (c === '"') {
    // <img src="
    return doubleQuotedState;
  } else if (c === "'") {
    // <img src='
    return singleQuotedState;
  } else if (c === ">") {
    console.log("丢失属性value解析异常");
    // <img src=>
    emit(currentToken);
    return data;
  } else {
    // <img src=1
    return unQuotedState(c);
  }
}
function afterQuotedAttributeValueState(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeNameState;
  } else if (c === "/") {
    return selfClosingStartTagState;
  } else if (c === ">") {
    emit(currentToken);
    return data;
  } else if (c === EOF) {
    emit({
      __type: "end-of-file",
    });
  } else {
    console.log("属性间缺少空格错误");
    return beforeAttributeNameState(c);
  }
}

function doubleQuotedState(c) {
  if (c === '"') {
    currentToken[currentAttribute.__name] = currentAttribute.__value;
    return afterQuotedAttributeValueState;
  } else if (c === EOF) {
    emit({
      __type: "end-of-file",
    });
  } else {
    currentAttribute.__value += c;
    return doubleQuotedState;
  }
}

function singleQuotedState(c) {
  if (c === "'") {
    currentToken[currentAttribute.__name] = currentAttribute.__value;
    return afterQuotedAttributeValueState;
  } else if (c === EOF) {
    emit({
      __type: "end-of-file",
    });
  } else {
    currentAttribute.__value += c;
    return singleQuotedState;
  }
}

function unQuotedState(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    // <img src=1
    return beforeAttributeNameState;
  } else if (c === ">") {
    emit(currentToken);
    return data;
  } else if (c === EOF) {
    emit({
      __type: "end-of-file",
    });
  } else if (c === "'" || c === '"' || c === "<" || c === "=" || c === "`") {
    console.log("无引号属性值解析异常");
    currentAttribute.__value += c;
  } else {
    currentAttribute.__value += c;
    return unQuotedState;
  }
}

function selfClosingStartTagState(c) {
  if (c === ">") {
    currentToken.__isSelfClose = true;
    emit(currentToken);
    return data;
  } else {
    return beforeAttributeNameState(c);
  }
}

module.exports.parserHTML = function (html) {
  let state = data;
  for (let c of html) {
    state = state(c);
  }

  state = state(EOF);
  return stack[0];
};
