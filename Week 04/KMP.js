function KMP(source, pattern) {
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
        ++i;
      }
    }
  }

  {
    let i = 0;
    let j = 0;
    while (i < source.length) {
      if (source[i] === pattern[j]) {
        ++i;
        ++j;
      } else {
        // 如果j是0了那么证明模式串已经回拨到头了，该移动源串了
        if (j > 0) j = table[j];
        else ++i;
      }

      // 如果在源串循环完以前，模式串线到头了，证明已经找到该子串了
      if (j === pattern.length) {
        return true;
      }
    }
    // 源串循环了的话，证明没有匹配到内容
    return false;
  }
}

console.log("object :>> ", KMP("hello", "ll"));
