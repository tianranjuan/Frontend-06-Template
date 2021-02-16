class Listener {
  constructor(element, recognizer) {
    const contexts = new Map();
    let isListeningMouse = false;
    // 鼠标事件
    element.addEventListener("mousedown", (event) => {
      let context = Object.create(null);
      contexts.set("mouse" + (1 << event.button), context);
      recognizer.start(event, context);
      const moveHandler = (event) => {
        let button = 1;
        while (button <= event.buttons) {
          if (button & event.buttons) {
            // 调整 按下事件与移动事件 按键代码不一致的问题
            let key;
            if (button === 2) key = 4;
            else if (button === 4) key = 2;
            else key = button;
            let context = contexts.get("mouse" + key);
            recognizer.move(event, context);
          }
          button = button << 1;
        }
      };
      const upHandler = (event) => {
        let context = contexts.get("mouse" + (1 << event.button));
        recognizer.end(event, context);
        contexts.delete("mouse" + (1 << event.button));
        if (event.buttons === 0) {
          document.removeEventListener("mouseup", upHandler);
          document.removeEventListener("mousemove", moveHandler);
          isListeningMouse = false;
        }
      };

      if (!isListeningMouse) {
        document.addEventListener("mousemove", moveHandler);
        document.addEventListener("mouseup", upHandler);
        isListeningMouse = true;
      }
    });

    // 触摸事件
    element.addEventListener("touchstart", (touchEvent) => {
      for (let touch of touchEvent.changedTouches) {
        const context = Object.create(null);
        contexts.set(touch.identifier, context);
        recognizer.start(touch, context);
      }
    });
    element.addEventListener("touchmove", (touchEvent) => {
      for (let touch of touchEvent.changedTouches) {
        let context = contexts.get(touch.identifier);
        recognizer.move(touch, context);
      }
    });
    element.addEventListener("touchend", (touchEvent) => {
      for (let touch of touchEvent.changedTouches) {
        let context = contexts.get(touch.identifier);
        recognizer.end(touch, context);
        contexts.delete(touch.identifier);
      }
    });
    element.addEventListener("touchcancel", (touchEvent) => {
      for (let touch of touchEvent.changedTouches) {
        let context = contexts.get(touch.identifier);
        recognizer.cancel(touch, context);
        contexts.delete(touch.identifier);
      }
    });
  }
}

class Recognizer {
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
  }

  // 抽象的模型
  start(point, context) {
    (context.startX = point.clientX), (context.startY = point.clientY);
    context.points = [
      {
        t: Date.now(),
        x: point.clientX,
        y: point.clientY,
      },
    ];
    context.isPan = false;
    context.isTap = true;
    context.isPress = false;
    context.handler = setTimeout(() => {
      this.dispatcher.dispatch("press", {});
      context.isPan = false;
      context.isTap = false;
      context.isPress = true;
      context.handler = null;
    }, 500);
  }
  move(point, context) {
    let dx = point.clientX - context.startX,
      dy = point.clientY - context.startY;
    if (!context.isPan && dx ** 2 + dy ** 2 > 100) {
      context.isVertical = Math.abs(dx) < Math.abs(dy);
      this.dispatcher.dispatch("panstart", {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
      });
      context.isPan = true;
      context.isTap = false;
      context.isPress = false;
      clearTimeout(context.handler);
    }

    if (context.isPan) {
      this.dispatcher.dispatch("pan", {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
      });
    }

    context.points.push({
      t: Date.now(),
      x: point.clientX,
      y: point.clientY,
    });
  }
  end(point, context) {
    if (context.isTap) {
      this.dispatcher.dispatch("tap", {});
      clearTimeout(context.handler);
    }

    if (context.isPress) {
      this.dispatcher.dispatch("pressend", {});
    }
    // 取样500毫秒内的点
    context.points = context.points.filter(
      (point) => Date.now() - point.t < 500
    );
    let d, v;
    if (!context.points.length) {
      v = 0;
    } else {
      d = Math.sqrt(
        (point.clientX - context.points[0].x) ** 2 +
          (point.clientY - context.points[0].y) ** 2
      );

      v = d / (Date.now() - context.points[0].t);
    }

    if (v > 1.5) {
      context.isFlick = true;
      this.dispatcher.dispatch("flick", {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
        isFlick: context.isFlick,
        velocity: v,
      });
    } else {
      context.isFlick = false;
    }

    if (context.isPan) {
      this.dispatcher.dispatch("panend", {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
        isFlick: context.isFlick,
      });
    }
  }
  cancel(point, context) {
    clearTimeout(context.handler);
    this.dispatcher.dispatch("cancel", {});
  }
}

class Dispatcher {
  constructor(element) {
    this.element = element;
  }

  dispatch(type, properties) {
    const event = new Event(type);
    for (let key in properties) {
      event[key] = properties[key];
    }
    this.element.dispatchEvent(event);
  }
}

function enableGesture(element) {
  new Listener(element, new Recognizer(new Dispatcher(element)));
}
