function Wildcard(source, pattern) {
  let starCount = 0;

  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === "*") {
      starCount++;
    }
  }

  console.log("starCount :>> ", starCount);

  //   没有*的情况
  if (starCount === 0) {
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] !== source[i] && pattern[i] !== "?") {
        return false;
      }
    }
  }

  let i = 0;
  let lastIndex = 0;

  //   处理第一个*之前的pattern是否能够匹配上
  for (i = 0; pattern[i] !== "*"; i++) {
    if (pattern[i] !== source[i] && pattern[i] !== "?") {
      return false;
    }
  }

  lastIndex = i;

  for (let p = 0; p < starCount - 1; p++) {
    i++;
    let subPattern = "";
    while (pattern[i] !== "*") {
      subPattern += pattern[i];
      i++;
    }

    let reg = new RegExp(subPattern.replace(/\?/g, "[\\s\\S]", "g"));
    reg.lastIndex = lastIndex;
    if (!reg.exec(source)) return false;
    // reg.exec(source)
    lastIndex = reg.lastIndex;
  }

  for (
    let j = 0;
    j < source.length - lastIndex && pattern[pattern.length - j] !== "*";
    j++
  ) {
    if (
      pattern[pattern.length - j] !== source[source.length - j] &&
      pattern[pattern.length - j] !== "?"
    ) {
      return false;
    }
  }

  return true;
}

console.log(Wildcard("abcabcabxaac", "a*b?*b?x*c"));
