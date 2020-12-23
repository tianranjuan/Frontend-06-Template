let str = "testabcddef";

function match(str) {
  let bitmap = [0, 0, 0, 0, 0, 0];
  for (let char of str) {
    if (char === "a") {
      bitmap[0] = 1;
    } else if (char === "b" && bitmap[0] === 1 && !bitmap[1]) {
      bitmap[1] = 1;
    } else if (char === "c" && bitmap[1] === 1 && !bitmap[2]) {
      bitmap[2] = 1;
    } else if (char === "d" && bitmap[2] === 1 && !bitmap[3]) {
      bitmap[3] = 1;
    } else if (char === "e" && bitmap[3] === 1 && !bitmap[4]) {
      bitmap[4] = 1;
    } else if (char === "f" && bitmap[4] === 1) {
      return true;
    } else {
      bitmap = [0, 0, 0, 0, 0, 0];
    }
  }
  return false;
}

console.log("object :>> ", match(str));
