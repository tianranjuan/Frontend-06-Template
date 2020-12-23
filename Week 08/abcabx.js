function start(c) {
  if (c === "a") {
    return findB;
  } else {
    return start;
  }
}
 
function end() {
  return end;
}
function match(str) {
  let state = start;
  for (let c of str) {
    state = state(c);
  }

  return state === end;
}

console.log("object :>> ", match("abcabcabx"));
