// 解析2、8/10/16进制的字符串为对应的10进制数字
function StringToNumber(str) {
  //   "bin", "oct", "hex", "dec"
  const reg = /(^0b[01]+$)|(^0[0-7]+$)|(^0[xX][0-9a-fA-F]+$)|(^[0-9]+$)/g;
  let result = reg.exec(str);
  let num = null;
  if (result) {
    if (result[1]) {
      num = parseInt(str.replace("0b", ""), 2);
    } else if (result[2]) {
      num = parseInt(str, 8);
    } else if (result[3]) {
      num = parseInt(str, 16);
    } else if (result[4]) {
      num = parseInt(str, 10);
    }
  }
  return num;
}

console.log("BIN :>> ", StringToNumber("0b100000"));
console.log("OCT :>> ", StringToNumber("040"));
console.log("HEX :>> ", StringToNumber("0x20"));
console.log("DEC :>> ", StringToNumber("32"));

// 10进制数字转换成2、8/10/16进制的字符串
function NumberToString(num, radix) {
  let str = "NaN";
  if (radix === 2) {
    str = "0b" + num.toString(2);
  } else if (radix === 8) {
    str = "0" + num.toString(8);
  } else if (radix === 16) {
    str = "0x" + num.toString(16);
  } else if (radix === 10) {
    str = num.toString(10);
  }
  return str;
}

console.log("BIN_STR :>> ", NumberToString(32, 2));
console.log("OCT_STR :>> ", NumberToString(32, 8));
console.log("HEX_STR :>> ", NumberToString(32, 16));
console.log("DEC_STR :>> ", NumberToString(32, 10));
