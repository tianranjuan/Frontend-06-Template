const TICK = Symbol("tick");
const TICK_HANDLER = Symbol("tick-handler");
const ANIMATIONS = Symbol("animations");
const START_TIME = Symbol("start-time");
const PAUSE_START = Symbol("pause-start");
const PAUSE_TIME = Symbol("pause-time");

export class Timeline {
  constructor() {
    this.state = "inited";
    this[ANIMATIONS] = new Set();
    this[START_TIME] = new Map();
  }

  start() {
    if (this.state !== "inited") 
      return;
    this.state = "started";
    // 记录时间线的开启时间，相当于是给动画世界添加了一个创始时间
    const startTime = Date.now();
    this[PAUSE_TIME] = 0;
    this[TICK] = () => {
      const now = Date.now();
      for (let animation of this[ANIMATIONS]) {
        let t;
        // 动画开始时间在timeline开始时间之前
        if (this[START_TIME].get(animation) < startTime) t = now - startTime;
        // 动画开始时间在timeline开始时间之后
        else t = now - this[START_TIME].get(animation);
        // 考虑到暂停时长
        t -= this[PAUSE_TIME];

        t - animation.delay;
        if (animation.duration < t) {
          this[ANIMATIONS].delete(animation);
          this[START_TIME].delete(animation);
          t = animation.duration;
        }

        if (t > 0) animation.receive(t);
      }
      this[TICK_HANDLER] = requestAnimationFrame(this[TICK]);
    };
    this[TICK]();
  }

  pause() {
    if (this.state !== "started")
      return;
    this.state = "paused";
    this[PAUSE_START] = Date.now();
    cancelAnimationFrame(this[TICK_HANDLER]);
  }

  resume() {
    if (this.state !== "paused")
      return;
    this.state = "started";
    this[PAUSE_TIME] += Date.now() - this[PAUSE_START];
    this[TICK]();
  }

  reset() {
    this.pause();
    this.state = "inited";
    this[PAUSE_TIME] = 0;
    this[ANIMATIONS] = new Set();
    this[START_TIME] = new Map();
    this[TICK_HANDLER] = null;
    this[PAUSE_START] = 0;
  }

  add(animation, startTime = Date.now()) {
    this[ANIMATIONS].add(animation);
    this[START_TIME].set(animation, startTime);
  }
}

// 这里是属性动画器
export class Animation {
  constructor(object, prop, start, end, duration, delay, timingFcuntion, template) {
    this.object = object;
    this.prop = prop;
    this.start = start;
    this.end = end;
    this.duration = duration;
    this.timingFcuntion = timingFcuntion || (v => v);
    this.delay = delay;
    this.template = template || (v => v);
  }
  // 真正的动画执行函数
  receive(time) {
    const range = this.end - this.start;
    const progress = this.timingFcuntion(time / this.duration);
    this.object[this.prop] = this.template(this.start + range * progress);
  }
}
