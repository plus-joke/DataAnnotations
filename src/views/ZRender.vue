
<template>
  <div>
    <div class="ring-circle">
      <a-divider orientation="left" class="tipName"> ZRerder.js （画板）</a-divider>
      <div class="action-bar">
        <a-tag
          v-for="item in actionList"
          :key="item.type"
          :class="{ checkedTag: drawType === item.type }"
          @click="switchType(item.type)"
          >{{ item.text }}</a-tag
        >
        <div class="line-slider">
          <a-slider :range="false" v-model="lineWidth" :disabled="disabled" />
        </div>
        <input type="color" @change="colorInput" />
        <a-tag @click="retreat">撤销</a-tag>
        <a-tag @click="clear">清空</a-tag>
        <a-tag @click="save">保存</a-tag>
      </div>
      <!-- 画布 -->
      <div id="circle_canvas"></div>
    </div>
  </div>
</template>

<script>
import * as zrender from "zrender";
export default {
  name: "ZRerder",
  data() {
    return {
      disabled: false,
      zr: null,
      group: null,
      drawType: "brush",
      startPos: [],
      graphId: null,
      color: "#000", // 默认颜色
      lineWidth: 10, // 画笔粗细
      dataurl: "", // 绘制图片的下载路径
      actionList: [
        { text: "画笔", type: "brush" },
        { text: "直线", type: "line" },
        { text: "矩形", type: "rect" },
        { text: "圆", type: "circle" },
        { text: "椭圆", type: "ellipse" },
        { text: "玫瑰", type: "rose" },
        { text: "心形", type: "heart" },
        { text: "五角星", type: "star" },
        { text: "正六边形", type: "isogon" },
        { text: "水滴", type: "droplet" },
        { text: "橡皮", type: "eraser" },
        { text: "裁剪", type: "clip" },
        // { text: "填充", type: "fill" },
        // { text: '拖拽', type: 'drag' }
      ],
      timer: null,
    };
  },
  methods: {

    init() {
      this.zr = zrender.init(document.getElementById("circle_canvas"));
      this.group = new zrender.Group().add(this.underpaint());
      this.zr.add(this.group);
      this.optionalDraw();
    },

    // 初始化画布底色
    underpaint() {
      return new zrender.Rect({
        shape: {
          x: 0,
          y: 0,
          width: this.zr.painter._width,
          height: this.zr.painter._height,
        },
        style: {
          fill: "#f5f5f5",
        },
      });
    },

    // 鼠标绘图事件
    optionalDraw() {
      let _this = this;
      // 定义鼠标按下可以移动的标志
      let flag = false;
      // 定义存放画框起点坐标数组
      _this.zr.on("mousedown", (e) => {
        flag = true;
        _this.startPos = [e.event.zrX, e.event.zrY];
        if (_this.drawType === "brush" || _this.drawType === "eraser") {
          let obj = _this.brush(_this.startPos, _this.startPos);
          _this.group.add(obj);
        }
      });
      _this.zr.on("mousemove", (e) => {
        // 鼠标按下flag=true移动才有效,拖拽状态下不执行move操作
        if (!flag || _this.drawType === "drag") {
          return false;
        }
        let endPos = [e.event.zrX, e.event.zrY];
        let obj = null;
        _this.group.eachChild((el) => {
          if (el.id === _this.graphId) {
            _this.group.remove(el);
          }
        });
        // 判断绘制类型并调用相应的绘制图形函数
        if (_this.drawType === "brush" || _this.drawType === "eraser") {
          obj = _this.brush(_this.startPos, endPos, "move");
          if (_this.lineWidth > 2) {
            _this.group.add(_this.brushCircle(_this.startPos, endPos));
          }
        } else if (_this.drawType === "line") {
          obj = _this.drawLine(_this.startPos, endPos);
        } else if (_this.drawType === "rect") {
          obj = _this.drawRect(_this.startPos, endPos);
        } else if (_this.drawType === "circle") {
          obj = _this.drawCircle(_this.startPos, endPos);
        } else if (_this.drawType === "clip") {
          obj = _this.drawClip(_this.startPos, endPos);
        } else if (_this.drawType === "rose") {
          obj = _this.drawRose(_this.startPos, endPos);
        } else if (_this.drawType === "star") {
          obj = _this.drawStar(_this.startPos, endPos);
        } else if (_this.drawType === "droplet") {
          obj = _this.drawDroplet(_this.startPos, endPos);
        } else if (_this.drawType === "ellipse") {
          obj = _this.drawEllipse(_this.startPos, endPos);
        } else if (_this.drawType === "heart") {
          obj = _this.drawHeart(_this.startPos, endPos);
        } else if (_this.drawType === "isogon") {
          obj = _this.drawIsogon(_this.startPos, endPos);
        }

        _this.group.add(obj);
      });
      _this.zr.on("mouseup", (e) => {
        // 裁剪状态下鼠标抬起时设置描边为白色
        if (_this.drawType === "clip") {
          _this.group.childAt(_this.group.childCount() - 1).animateTo(
            {
              style: {
                stroke: "#f5f5f5",
              },
            },
            1
          );
        }
        flag = false;
        this.graphId = null;
      });
    },

    // 画笔和橡皮
    brush(startPos, endPos, move) {
      if (move) {
        let line = new zrender.Line({
          shape: {
            x1: startPos[0],
            y1: startPos[1],
            x2: endPos[0],
            y2: endPos[1],
          },
          style: {
            lineWidth: this.lineWidth,
            stroke: this.drawType === "eraser" ? "#fff" : this.color,
          },
        });
        this.startPos = endPos;
        return line;
      } else {
        
        let circle = new zrender.Circle({
          shape: {
            cx: startPos[0],
            cy: startPos[1],
            r: this.lineWidth / 2,
          },
          style: {
            fill: this.drawType === "eraser" ? "#fff" : this.color,
          },
        });
        return circle;
      }
    },

    // 画笔粗细大于2像素时辅助直线共同完成线条的绘制
    brushCircle(startPos, endPos) {
      let circle = new zrender.Circle({
        shape: {
          cx: startPos[0],
          cy: startPos[1],
          r: this.lineWidth / 2,
        },
        style: {
          fill: this.drawType === "eraser" ? "#fff" : this.color,
        },
      });
      return circle;
    },

    // 直线
    drawLine(startPos, endPos) {
      let line = new zrender.Line({
        shape: {
          x1: startPos[0],
          y1: startPos[1],
          x2: endPos[0],
          y2: endPos[1],
        },
        style: {
          lineWidth: this.lineWidth,
          stroke: this.color,
        },
      });
      this.graphId = line.id;
      return line;
    },

    // 绘制矩形
    drawRect(startPos, endPos) {
      let rect = new zrender.Rect({
        shape: {
          x: startPos[0],
          y: startPos[1],
          width: endPos[0] - startPos[0],
          height: endPos[1] - startPos[1],
        },
        style: {
          lineWidth: this.lineWidth,
          fill: "transparent",
          stroke: this.color,
        },
        onclick: (e) => {
          if (this.drawType === "fill") {
            this.fillColor(e.target.id);
          }
        },
      });
      this.graphId = rect.id;
      return rect;
    },

    // 绘制圆
    drawCircle(startPos, endPos) {
      let circle = new zrender.Circle({
        shape: {
          cx: startPos[0],
          cy: startPos[1],
          r: this.radius(startPos, endPos),
        },
        style: {
          lineWidth: this.lineWidth,
          fill: "transparent",
          stroke: this.color,
        },
        onclick: (e) => {
          if (this.drawType === "fill") {
            this.fillColor(e.target.id);
          }
        },
      });
      this.graphId = circle.id;
      return circle;
    },

    // 椭圆
    drawEllipse(startPos, endPos) {
      let ellipse = new zrender.Ellipse({
        shape: {
          cx: startPos[0],
          cy: startPos[1],
          rx: startPos[0] - endPos[0],
          ry: startPos[1] - endPos[1],
        },
        style: {
          lineWidth: this.lineWidth,
          fill: "transparent",
          stroke: this.color,
        },
        onclick: (e) => {
          if (this.drawType === "fill") {
            this.fillColor(e.target.id);
          }
        },
      });
      this.graphId = ellipse.id;
      return ellipse;
    },

    // 玫瑰
    drawRose(startPos, endPos) {
      let rose = new zrender.Rose({
        shape: {
          cx: startPos[0],
          cy: startPos[1],
          r: [this.radius(startPos, endPos)],
          k: 16,
          n: 10,
        },
        style: {
          lineWidth: this.lineWidth > 4 ? 4 : this.lineWidth,
          fill: this.color,
          stroke: "#ff0",
        },
      });
      this.graphId = rose.id;
      return rose;
    },

    // 心形
    drawHeart(startPos, endPos) {
      let heart = new zrender.Heart({
        shape: {
          cx: startPos[0],
          cy: startPos[1],
          width: endPos[0] - startPos[0],
          height: endPos[1] - startPos[1],
        },
        style: {
          lineWidth: this.lineWidth,
          fill: "transparent",
          stroke: this.color,
        },
        onclick: (e) => {
          if (this.drawType === "fill") {
            this.fillColor(e.target.id);
          }
        },
      });
      this.graphId = heart.id;
      return heart;
    },

    // 五角星
    drawStar(startPos, endPos) {
      let star = new zrender.Star({
        shape: {
          cx: startPos[0],
          cy: startPos[1],
          n: 5,
          r: this.radius(startPos, endPos),
          r0: this.radius(startPos, endPos) / 2,
        },
        style: {
          lineWidth: this.lineWidth,
          fill: "transparent",
          stroke: this.color,
        },
        onclick: (e) => {
          if (this.drawType === "fill") {
            this.fillColor(e.target.id);
          }
        },
      });
      this.graphId = star.id;
      return star;
    },

    // 正六边形
    drawIsogon(startPos, endPos) {
      let isogon = new zrender.Isogon({
        shape: {
          x: startPos[0],
          y: startPos[1],
          r: this.radius(startPos, endPos),
          n: 6,
        },
        style: {
          lineWidth: this.lineWidth,
          fill: "transparent",
          stroke: this.color,
        },
        onclick: (e) => {
          if (this.drawType === "fill") {
            this.fillColor(e.target.id);
          }
        },
      });
      this.graphId = isogon.id;
      return isogon;
    },

    // 水滴
    drawDroplet(startPos, endPos) {
      let droplet = new zrender.Droplet({
        shape: {
          cx: startPos[0],
          cy: startPos[1],
          width: endPos[0] - startPos[0],
          height: endPos[1] - startPos[1],
        },
        style: {
          lineWidth: this.lineWidth,
          fill: "transparent",
          stroke: this.color,
        },
        onclick: (e) => {
          if (this.drawType === "fill") {
            this.fillColor(e.target.id);
          }
        },
      });
      this.graphId = droplet.id;
      return droplet;
    },

    // 裁剪
    drawClip(startPos, endPos) {
      let clip = new zrender.Rect({
        shape: {
          x: startPos[0],
          y: startPos[1],
          width: endPos[0] - startPos[0],
          height: endPos[1] - startPos[1],
        },
        style: {
          fill: "#f5f5f5",
          stroke: "#000",
          lineDash: [0, 3, 30, 3],
        },
      });
      // clip._id = clip.id + 'clip'
      this.graphId = clip.id;
      return clip;
    },

    // 填充
    fillColor(id) {
      let _this=this
      this.group.eachChild((el, index) => {
        if (el.id === id) {
          // debugger
          // 修改当前点击元素的填充颜色
          el.style.fill = _this.color;
          // 暂存当前元素
          let cyel = el;
          // 移除当前点击元素
          _this.group.remove(el);
          // 获取点击元素下标对应的当前元素
          let newel = _this.group.childAt(index);
          // 判断当前下标有没有元素，如果有插入修改后的元素到原来位置，否则追加到最后
          if (newel) {
            _this.group.addBefore(cyel, newel);
          } else {
            _this.group.add(cyel);
          }
        }
      });
    },

    // 返回想画圆的半径
    radius(startPos, endPos) {
      return Math.sqrt(
        Math.pow(endPos[0] - startPos[0], 2) +
          Math.pow(endPos[1] - startPos[1], 2)
      );
    },

    // 选择绘图类型
    switchType(type) {
      // 由于影响橡皮檫和裁剪功能【拖拽】暂且注掉
      // 为提升性能，在点击拖拽并且当前不是拖拽状态下才把元素置为可拖拽
      // if (type === 'drag' && this.drawType !== 'drag') {
      //   this.group.eachChild(el => {
      //     if (!(el._id && el._id.includes('clip'))) {
      //       el.draggable = true
      //     }
      //   })
      // }
      // 为提升性能，在点击的不是拖拽并且只有在当前状态是拖拽的情况下才把元素置为不可拖拽
      // if (type !== 'drag' && this.drawType === 'drag') {
      //   this.group.eachChild(el => {
      //     el.draggable = false
      //   })
      // }
      // 最后赋值点击状态，注意一定放在上边两个判断后赋值，否则判断失效
      this.drawType = type;
    },

    // 撤销 此操作每次移除group最后一个元素
    retreat() {
      this.group.remove(this.group.childAt(this.group.childCount() - 1));
    },

    // 颜色选择器
    colorInput(e) {
      this.color = e.target.value;
    },

    // 保存绘制的图像
    save() {
      // 获取canvas,由于zrender没有toDataURL方法
      let canvas = document.getElementsByTagName("canvas")[0];
      if (this.group.childCount() !== 0) {
        const elink = document.createElement("a");
        elink.style.display = "none";
        // toDataURL方法默认转换为base64/png格式
        elink.href = canvas.toDataURL("image/jpeg");
        elink.download = "canvas";
        document.body.appendChild(elink);
        elink.click();
        document.body.removeChild(elink);
      } else {
        this.$message.error("暂无绘制任何图形");
      }
    },

    // 清空画布  注意：不可用zrender.clear() 否则清空后无法继续绘制
    clear() {
      // 移除group所有子元素
      this.group.removeAll().add(this.underpaint());
      // 强制立即刷新画布
      this.zr.refreshImmediately();
    },
  },
  computed: {
    //计算属性
  },
  watch: {
    //监听属性
  },
  created() {},
  mounted() {
    this.init();
  },
};
</script>

<style lang="less" scoped>
.ring-circle {
  #circle_canvas {
    height: 400px;
    background-color: #f5f5f5;
    overflow: hidden;
  }
  // border: 1px solid #aaa;
  padding: 0 15px;
  background-color: #fff;
  .tipName {
    margin: 20px 0 0;
  }
  .action-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    height: 80px;
    user-select: none;
  }
  .el-tag {
    margin: 0 6px;
    cursor: pointer;
  }
  .checkedTag {
    background: #eee;
  }
  .line-slider {
    width: 120px;
    display: inline-block;
    padding-bottom: 2px;
    margin: 0 8px;
  }
  .el-slider__runway {
    margin: 0;
  }
}
</style>
