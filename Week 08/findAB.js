let str = "geekabng";

function match(str) {
  let s = "";
  for (let char of str) {
    if (s === "a" && char === "b") {
      return true;
    }

    if (s === "a" && char !== "b") {
      s = "";
    }

    if (char === "a") {
      s = char;
    }
  }
  return false;
}

console.log("object :>> ", match(str));
