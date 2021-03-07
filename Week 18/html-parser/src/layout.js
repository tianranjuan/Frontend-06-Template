function getStyle(element) {
  if (!element.style) {
    element.style = {};
  }

  for (let prop in element.computedStyle) {
    element.style[prop] = element.computedStyle[prop].value;

    if (element.style[prop].toString().match(/px$/)) {
      element.style[prop] = parseInt(element.style[prop]);
    }

    if (element.style[prop].toString().match(/^[0-9\.]+$/)) {
      element.style[prop] = parseInt(element.style[prop]);
    }
  }
  return element.style;
}

function layout(element) {
  //   如果没有收集到style 忽略计算
  if (!element.computedStyle) return;

  let elementStyle = getStyle(element);

  //   只支持flex布局
  if (elementStyle.display !== "flex") return;

  //   忽略掉文本节点
  const items = element.children.filter((e) => e.type === "element");

  //   排序 支持order属性
  items.sort((a, b) => (a.order || 0) - (b.order || 0));

  //   父元素的样式表
  let style = elementStyle;

  //   处理没有宽高或者宽高是auto的场景，等于说是一个格式化操作
  ["width", "height"].forEach((size) => {
    if (style[size] === "auto" || style[size] === "") {
      style[size] = null;
    }
  });

  //   给需要计算的属性写一些防御性代码，保证默认值
  if (!style.flexDirection || style.flexDirection === "auto")
    style.flexDirection = "row";

  if (!style.alignItems || style.alignItems === "auto")
    style.alignItems = "stretch";

  if (!style.justifyCotent || style.justifyCotent === "auto")
    style.justifyCotent = "flex-start";

  if (!style.flexWrap || style.flexWrap === "auto") style.flexWrap = "nowrap";

  if (!style.alignContent || style.alignContent === "auto")
    style.alignContent = "stretch";

  // 抽象出来的主轴和交叉轴变量
  let mainSize,
    mainStart,
    mainEnd,
    mainSign,
    mainBase, // 主轴的起始位置
    crossSize,
    crossStart,
    crossEnd,
    crossSign,
    crossBase; // 交叉轴的起始位置

  // 如果是row
  if (style.flexDirection === "row") {
    mainSize = "width";
    mainStart = "left";
    mainEnd = "right";
    mainSign = +1; // 细节，使用加号来声明 其意义标识正数
    mainBase = 0;

    crossSize = "height";
    crossStart = "top";
    crossEnd = "bottom";
  }

  if (style.flexDirection === "row-reverse") {
    mainSize = "width";
    mainStart = "right";
    mainEnd = "left";
    mainSign = -1; // 细节，使用加号来声明 其意义标识正数
    mainBase = style.width;

    crossSize = "height";
    crossStart = "top";
    crossEnd = "bottom";
  }

  if (style.flexDirection === "column") {
    mainSize = "height";
    mainStart = "top";
    mainEnd = "bottom";
    mainSign = +1; // 细节，使用加号来声明 其意义标识正数
    mainBase = 0;

    crossSize = "width";
    crossStart = "left";
    crossEnd = "right";
  }

  if (style.flexDirection === "column-reverse") {
    mainSize = "height";
    mainStart = "bottom";
    mainEnd = "top";
    mainSign = -1; // 细节，使用加号来声明 其意义标识正数
    mainBase = style.height;

    crossSize = "width";
    crossStart = "left";
    crossEnd = "right";
  }

  if (style.flexWrap === "wrap-reverse") {
    let tmp = crossStart;
    crossStart = crossEnd;
    crossEnd = tmp;
    crossSign = -1;
  } else {
    crossBase = 0;
    crossSign = 1;
  }

  let isAutoMainSize = false;

  if (!style[mainSize]) {
    elementStyle[mainSize] = 0;
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let itemStyle = getStyle(item);
      if (itemStyle[mainSize] !== null || itemStyle[mainSize] !== void 0) {
        elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize];
      }
    }
    isAutoMainSize = true;
  }

  let flexLine = [];
  let flexLines = [flexLine]; // 最少有一行

  let mainSpace = elementStyle[mainSize];
  let crossSpace = 0;

  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    let itemStyle = getStyle(item);

    if (itemStyle[mainSize] === null) {
      itemStyle[mainSize] = 0;
    }

    if (itemStyle.flex) {
      flexLine.push(item);
    } else if (style.flexWrap === "nowrap" && isAutoMainSize) {
      mainSpace -= itemStyle[mainSize];
      if (itemStyle[crossSize] !== null || itemStyle[crossSize] !== void 0) {
        crossSpace = Math.max(itemStyle[crossSize], crossSize);
      }
      flexLine.push(item);
    } else {
      if (itemStyle[mainSize] > style[mainSize]) {
        itemStyle[mainSize] = style[mainSize];
      }

      if (mainSpace < item[mainSize]) {
        flexLine.mainSpace = mainSpace;
        flexLine.crossSpace = crossSpace;

        flexLine = [item];
        flexLines.push(flexLine);

        mainSpace = style[mainSize];
        crossSpace = 0;
      } else {
        flexLine.push(item);
      }
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0)
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      mainSpace -= itemStyle[mainSize];
    }
  }
  flexLine.mainSpace = mainSpace;

  if (style.flexWrap === "nowrap" || isAutoMainSize) {
    flexLine.crossSpace =
      style[crossSize] !== void 0 ? style[crossSize] : crossSpace;
  } else {
    flexLine.crossSpace = crossSpace;
  }

  //   特殊情况 nowrap和isAutoMainSize情况下实际大小超出了父元素大小
  if (mainSpace < 0) {
    let scale = style[mainSign] / style[mainSign] - mainSpace;

    let currMain = mainBase;

    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let itemStyle = getStyle(item);
      if (itemStyle.flex) {
        itemStyle[mainSize] = 0;
      }

      itemStyle[mainSize] = itemStyle[mainSize] * scale;
      itemStyle[mainStart] = currMain;
      itemStyle[mainEnd] =
        itemStyle[mainStart] + itemStyle[mainSize] * mainSign;
      currMain = itemStyle[mainEnd];
    }
  } else {
    flexLines.forEach((items) => {
      let flexTotal = 0;
      let step = 0;
      let currMain = mainBase;
      mainSpace = items.mainSpace;
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let itemStyle = getStyle(item);
        if (itemStyle.flex !== null && itemStyle.flex !== void 0) {
          flexTotal += itemStyle.flex;
          continue;
        }
      }

      if (flexTotal > 0) {
        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          let itemStyle = getStyle(item);
          if (itemStyle.flex) {
            itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
          }

          itemStyle[mainStart] = currMain;
          itemStyle[mainEnd] =
            itemStyle[mainStart] + itemStyle[mainSize] * mainSign;
          currMain = itemStyle[mainEnd];
        }
      } else {
        //   没有flex元素的情况下，根据justify-content属性判断分配情况
        if (style.justifyCotent === "flex-start") {
          currMain = mainBase;
          step = 0;
        }
        if (style.justifyCotent === "flex-end") {
          currMain = mainSize * mainSign + mainBase;
          step = 0;
        }

        if (style.justifyCotent === "center") {
          currMain = (mainSize / 2) * mainSign + mainBase;
          step = 0;
        }

        if (style.justifyCotent === "space-between") {
          step = (mainSpace / (items.length - 1)) * mainSign;
          currMain = mainBase;
        }

        if (style.justifyCotent === "space-between") {
          step = (mainSpace / items.length) * mainSign;
          currMain = step / 2 + mainBase;
        }

        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          let itemStyle = getStyle(item);

          itemStyle[mainStart] = currMain;
          itemStyle[mainEnd] =
            itemStyle[mainStart] + itemStyle[mainSize] * mainSign;
          currMain = itemStyle[mainEnd] + step;
        }
      }
    });
  }

  // 计算交叉轴尺寸

  if (!style[crossSize]) {
    crossSpace = 0;
    elementStyle[crossSize] = 0;
    for (let i = 0; i < flexLines.length; i++) {
      elementStyle[crossSize] =
        elementStyle[crossSize] + flexLines[i].crossSpace;
    }
  } else {
    crossSpace = style[crossSize];
    for (let i = 0; i < flexLines.length; i++) {
      crossSpace -= flexLines[i].crossSpace;
    }
  }

  if (style.flexWrap === "wrap-reverse") {
    crossBase = style[crossSize];
  } else {
    crossBase = 0;
  }

  // 计算出交叉轴的起始位置
  let step;
  if (style.alignCotent === "flex-start") {
    crossBase += 0;
    step = 0;
  }
  if (style.alignCotent === "flex-end") {
    crossBase += crossSign * crossSpace;
    step = 0;
  }
  if (style.alignCotent === "center") {
    crossBase += (crossSign * crossSpace) / 2;
    step = 0;
  }
  if (style.alignCotent === "space-between") {
    crossBase += 0;
    step = crossSpace / (flexLines.length - 1);
  }
  if (style.alignCotent === "space-around") {
    step = crossSpace / flexLines.length;
    crossBase += (crossSign * step) / 2;
  }
  if (style.alignCotent === "stretch") {
    crossBase += 0;
    step = 0;
  }

  flexLines.forEach((items) => {
    let lineCrossSize =
      style.alignContent === "stretch"
        ? items.crossSpace + crossSpace / flexLines.length // 当前交叉轴尺寸 + 剩余交叉轴尺寸 / 行数 = 均匀分配了剩余空间给所有行
        : items.crossSpace;

    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let itemStyle = getStyle(item);

      let align = item.alignSelf || style.alignItems; // 当前元素上的alignSelf的优先级要高于父元素设置的alignItems

      // 如果当前元素没有设置尺寸，那么检查align是否为stretch如果是stretch那么就将尺寸设置为与父元素相同，否则就是0
      if (itemStyle[crossSize] === null || itemStyle[crossSize] === void 0) {
        itemStyle[crossSize] = align === "stretch" ? lineCrossSize : 0;
      }

      if (align === "flex-start") {
        itemStyle[crossStart] = crossBase;
        itemStyle[crossEnd] =
          itemStyle[crossStart] + crossSign * itemStyle[crossSize];
      }
      if (align === "flex-end") {
        itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize;
        itemStyle[crossStart] =
          itemStyle[crossEnd] - crossSign * itemStyle[crossSize];
      }
      if (align === "center") {
        itemStyle[crossStart] =
          crossBase + (crossSign * (lineCrossSize - itemStyle[crossSize])) / 2;
        itemStyle[crossEnd] =
          itemStyle[crossStart] + crossSign * itemStyle[crossSize];
      }

      if (align === "strctch") {
        itemStyle[crossStart] = crossBase;
        itemStyle[crossEnd] =
          crossBase +
          crossSign *
            (itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0)
            ? itemStyle[crossSize]
            : lineCrossSize;
      }
    }
    crossBase += crossSign * (lineCrossSize + step); // 计算出下一行的起始位置
  });
}

module.exports = layout;
