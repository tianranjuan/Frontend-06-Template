import { Component, STATE, ATTRIBUTE, createElement } from "./framework";
import { enableGesture } from "./gesture.js";

export { STATE, ATTRIBUTE } from "./framework";

export class Button extends Component {
  constructor() {
    super();
  }
  render() {
    this.childContainer = <span></span>;
    this.root = (<div>{this.childContainer}</div>).render();
    return this.root;
  }

  appendChild(child) {
    if (!this.childContainer) {
      this.render();
    }
    this.childContainer.appendChild(child);
  }
}
