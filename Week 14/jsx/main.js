import { Component, createElement } from "./framework";

class Carousel extends Component {
  constructor() {
    super();
    this.attributes = Object.create(null);
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  render() {
    this.root = document.createElement("div");
    this.root.classList = "carousel";
    for (let url of this.attributes.src) {
      const child = document.createElement("div");
      child.style.backgroundImage = `url('${url}')`;
      this.root.appendChild(child);
    }

    const children = this.root.children;
    let position = 0;
    this.root.addEventListener("mousedown", (e) => {
      let startX = e.clientX;
      let move = (e) => {
        let x = e.clientX - startX;
        let current = position - (x - (x % 500)) / 500;
        for (let offset of [-1, 0, 1]) {
          let pos = current + offset;
          pos = (pos + children.length) % children.length;
          children[pos].style.transition = "none";
          children[pos].style.transform = `translateX(${
            -pos * 500 + offset * 500 + (x % 500)
          }px)`;
        }
      };

      let up = (e) => {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);

        let x = e.clientX - startX;
        position = position - Math.round(x / 500);
        console.log('position :>> ', position);
        for (let offset of [0, -Math.sign(Math.round(x / 500) - x + 250 * Math.sign(x))]) {
          let pos = position + offset;
          pos = (pos + children.length) % children.length;
          if (offset === 0) {
            position = pos;
          }
          children[pos].style.transition = "";
          children[pos].style.transform = `translateX(${
            -pos * 500 + offset * 500
          }px)`;
        }
      };

      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    });

    // let currentIndex = 0;
    // setInterval(() => {
    //   let nextIndex = (currentIndex + 1) % children.length;
    //   let current = children[currentIndex];
    //   let next = children[nextIndex];

    //   next.style.transition = "none"; // 取消动画
    //   next.style.transform = `translateX(${100 - nextIndex * 100}%)`;
    //   setTimeout(() => {
    //     next.style.transition = ""; // 置空让css的动画生效
    //     current.style.transform = `translateX(${-100 - currentIndex * 100}%)`;
    //     next.style.transform = `translateX(${-nextIndex * 100}%)`;
    //     currentIndex = nextIndex;
    //   }, 16);
    // }, 3000);

    return this.root;
  }

  mountTo(parent) {
    parent.appendChild(this.render());
  }
}

let d = [
  "https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg",
  "https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg",
  "https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg",
  "https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg",
];

let a = <Carousel src={d}></Carousel>;
a.mountTo(document.body);
