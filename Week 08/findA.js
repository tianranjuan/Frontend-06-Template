let str = "geekbang";

let charArr = str.split("");

function state(char) {
    if (char === "a"){
        return true;
    } else {
        return state
    }
}

let i = 0;
while(charArr.length) {
    let char = charArr.shift();
    let s = state(char);
    if (s === true) {
        console.log('s :>> ', s, ";at :>>", i);
        return;
    }
    i++;
}