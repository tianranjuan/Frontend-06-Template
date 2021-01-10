let EOF = "$";
let selectorList = [];
let selectorModel = {};

function start(c) {
  if (c.match(/[a-zA-Z]/)) {
    selectorModel = {
      type: "typeSelector",
      selector: c,
    };
    return typeSelector;
  } else if (c === "#") {
    selectorModel = {
      type: "idSelector",
      selector: c,
    };
    return idSelector;
  } else if (c === ".") {
    selectorModel = {
      type: "clsSelector",
      selector: c,
    };
    return classSelector;
  }
}

function typeSelector(c) {
  if (c.match(/[a-zA-Z]/)) {
    selectorModel.selector += c;
    return typeSelector;
  } else if (c === " ") {
    selectorList.push(selectorModel);
    return start;
  } else {
    return start(c);
  }
}

function idSelector(c) {
  if (c === "#" || c.match(/[a-zA-Z]/)) {
    selectorModel.selector += c;
    return idSelector;
  } else if (c === ".") {
    selectorModel.type = "compSelector";
    selectorModel.selector += c;
    return classSelector;
  } else {
    selectorList.push(selectorModel);
    return start(c);
  }
}

function classSelector(c) {
  if (c === EOF) {
    selectorList.push(selectorModel);
    return start(c);
  } else if (c.match(/[a-zA-Z]/)) {
    selectorModel.selector += c;
    return classSelector;
  } else if (c === ".") {
    selectorModel.selector += c;
    selectorModel.type = "compSelector";
    return classSelector;
  }
}

function match(selector, element) {
  if (!selector || !element) {
    return false;
  }
  let state = start;
  for (let char of selector) {
    state = state(char);
  }

  state(EOF);

  while (selectorList.length) {
    let select = selectorList.pop();
    if (select.type === "compSelector") {
      let arr = select.selector.split(".");
      if (select.selector.charAt(0) === "#") {
        if (arr.shift() != "#" + element.id) return false;
      }
      for (let a of arr) {
        if (
          !Array.prototype.slice.call(element.classList).includes(a) &&
          a !== ""
        ) {
          return false;
        }
      }
    }

    if (select.type === "typeSelector") {
      if (element.tagName.toLowerCase() !== select.selector) return false;
    }
  }

  return true;
}

console.log(
  "match div #id.class.test :>> ",
  match("div #id.class.test", document.getElementById("id"))
);
console.log(
  "match div .class.test:>> ",
  match("div .class.test", document.getElementById("id"))
);
console.log(
  "match div #id.test:>> ",
  match("div #id.test", document.getElementById("id"))
);

console.log("match div :>> ", match("div ", document.getElementById("id")));

console.log("match span :>> ", match("span #id.class", document.getElementById("id")));
