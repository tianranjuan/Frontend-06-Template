import { Animation, Timeline } from "./animation.js";
import { ease, easeInOut } from "./ease.js";


let t = new Timeline();

t.start();

t.add(new Animation(document.querySelector("#el").style, "transform", 0, 500, 5000, 0, easeInOut, v => `translateX(${v}px)`));

document.querySelector("#resume-btn").addEventListener("click", () => {t.resume()});
document.querySelector("#pause-btn").addEventListener("click", () => {t.pause()});