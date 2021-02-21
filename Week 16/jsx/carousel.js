import { Component, STATE, ATTRIBUTE } from "./framework";
import { enableGesture } from "./gesture.js";
import { Timeline, Animation } from "./animation.js";
import { ease } from "./ease";

export { STATE, ATTRIBUTE } from "./framework";

export class Carousel extends Component {
  constructor() {
    super();
    this.durationTime = 500;
  }
  render() {
    this.root = document.createElement("div");
    this.root.classList = "carousel";
    for (let record of this[ATTRIBUTE].src) {
      const child = document.createElement("div");
      child.style.backgroundImage = `url('${record.img}')`;
      this.root.appendChild(child);
    }
    // 给根元素绑定手势监听
    enableGesture(this.root);
    // 创建timeline并直接启动
    const timeline = new Timeline();
    timeline.start();
    const children = this.root.children;
    // let position = 0;
    this[ATTRIBUTE].position = 0;
    // 动画的开始时间
    let t = 0;
    // 动画造成的位移
    let ax = 0;

    let handelr = null;
    this.root.addEventListener("start", (event) => {
      timeline.pause();
      clearInterval(handelr);
      let progress = (Date.now() - t) / this.durationTime;
      ax = ease(progress) * 500 - 500;
    });
    this.root.addEventListener("tap", (event) => {
      this.triigerEvent("click", {
        data: this[ATTRIBUTE].src[this[ATTRIBUTE].position],
        position: this[ATTRIBUTE].position,
      });
    });

    this.root.addEventListener("pan", (event) => {
      let x = event.clientX - event.startX - ax;
      let current = this[ATTRIBUTE].position - (x - (x % 500)) / 500;
      for (let offset of [-1, 0, 1]) {
        let pos = current + offset;
        pos = ((pos % children.length) + children.length) % children.length;
        children[pos].style.transition = "none";
        children[pos].style.transform = `translateX(${
          -pos * 500 + offset * 500 + (x % 500)
        }px)`;
      }
    });

    this.root.addEventListener("end", (event) => {
      timeline.reset();
      timeline.start();
      handelr = setInterval(nextPicture, 3000);

      let x = event.clientX - event.startX - ax;
      let current = this[ATTRIBUTE].position - (x - (x % 500)) / 500;
      let direction = Math.round((x % 500) / 500);
      if (event.isFlick) {
        if (event.velocity > 0) {
          direction = Math.ceil((x % 500) / 500);
        } else {
          direction = Math.floor((x % 500) / 500);
        }
      }
      for (let offset of [-1, 0, 1]) {
        let pos = current + offset;
        pos = ((pos % children.length) + children.length) % children.length;
        children[pos].style.transition = "none";
        timeline.add(
          new Animation(
            children[pos].style,
            "transform",
            -pos * 500 + offset * 500 + (x % 500),
            -pos * 500 + offset * 500 + direction * 500,
            this.durationTime,
            0,
            ease,
            (v) => `translateX(${v}px)`
          )
        );
      }
      this[ATTRIBUTE].position =
        this[ATTRIBUTE].position - (x - (x % 500)) / 500 - direction;
      this[ATTRIBUTE].position =
        ((this[ATTRIBUTE].position % children.length) + children.length) %
        children.length;
      this.triigerEvent("change", { position: this[ATTRIBUTE].position });
    });

    let nextPicture = () => {
      let nextIndex = (this[ATTRIBUTE].position + 1) % children.length;
      let current = children[this[ATTRIBUTE].position];
      let next = children[nextIndex];
      t = Date.now();
      timeline.add(
        new Animation(
          current.style,
          "transform",
          -this[ATTRIBUTE].position * 500,
          -500 - this[ATTRIBUTE].position * 500,
          this.durationTime,
          0,
          ease,
          (v) => `translateX(${v}px)`
        )
      );
      timeline.add(
        new Animation(
          next.style,
          "transform",
          500 - nextIndex * 500,
          -nextIndex * 500,
          this.durationTime,
          0,
          ease,
          (v) => `translateX(${v}px)`
        )
      );
      this[ATTRIBUTE].position = nextIndex;
      this.triigerEvent("change", { position: this[ATTRIBUTE].position });
    };

    handelr = setInterval(nextPicture, 3000);
    return this.root;
  }

  // mountTo(parent) {
  //   parent.appendChild(this.render());
  // }
}
