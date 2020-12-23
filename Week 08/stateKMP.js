function stateKMP(pattern) {
  let stateTable = [];
  let table = new Array(pattern.length).fill(0);

  {
    let i = 1;
    let j = 0;
    while (i < pattern.length) {
      if (pattern[i] === pattern[j]) {
        ++i, ++j;
        table[i] = j;
      } else {
        // 判断的意义是避免j回到第0位
        if (j > 0) j = table[j];
        else ++i;
      }
    }

    console.log("table :>> ", table);
  }

  {
    for (let i = 0; i < pattern.length; i++) {
      let pc = pattern[i];
      stateTable[i] = (c) => {
        if (c === pc) {
          return i === pattern.length - 1 ? end : stateTable[i + 1];
        } else {
          if (i === 0) {
            return stateTable[0];
          } else {
            return stateTable[table[i]](c);
          }
        }
      };
    }
  }

  return stateTable;
}

function end() {
  return end;
}

function match(source, pattern) {
  let stateTable = stateKMP(pattern);
  let state = stateTable[0];
  for (let c of source) {
    state = state(c);
  }
  return state === end;
}

console.log("match :>> ", match("aabababababxxx", "abababx"));
