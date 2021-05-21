<!--
 * @Author: your name
 * @Date: 2021-04-28 13:45:04
 * @LastEditTime: 2021-05-08 17:36:28
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \DataAnnotationsDome\src\views\tab1.vue
-->
<template>
  <div class="wrapper">
    <a-divider orientation="left" class="tipName"> Fabric.js </a-divider>
    <div class="typeBox">
      <!-- 模式 -->
      <div class="type">
        <a-radio-group default-value="" class="wrap" button-style="solid">
          <a-radio-button
            v-for="item in typeList"
            :key="item.id"
            @click="drawfn(item.data)"
            :value="item.data"
          >
            {{ item.name }}
          </a-radio-button>
        </a-radio-group>

        <!-- 笔触滑块 -->
        <div class="line-slider">
          <a-slider
            :range="false"
            v-model="drawWidth"
            @change="slider"
            :disabled="disabled"
          />
        </div>

        <!-- 颜色选择器 -->
        <input type="color" @change="colorInput" />
      </div>
      <br />

      <!-- 功能区 -->
      <a-radio-group default-value="" button-style="solid">
        <a-radio-button
          v-for="item in functionList"
          :key="item.id"
          @click="drawfn(item.data)"
          :value="item.data"
        >
          {{ item.name }}
        </a-radio-button>
      </a-radio-group>
    </div>

    <!-- 画布 -->
    <canvas id="canvas" width="600" height="350"></canvas>
    <div class="msg">{{ savecontent }}</div>
  </div>
</template>
<script>
import { fabric } from "fabric";

export default {
  name: "Fabric",
  data() {
    return {
      typeList: [
        { id: "1", name: "自由绘制", data: "modeSwitching" },
        { id: "2", name: "三角形", data: "Triangle" },
        { id: "3", name: "文本", data: "makeText" },
        { id: "4", name: "矩形", data: "makeRect" },
        { id: "5", name: "直线", data: "line" },
        { id: "6", name: "虚线", data: "dottedline" },
        { id: "7", name: "圆", data: "Circl" },
        { id: "8", name: "点标注（组合）", data: "Point" },
      ],
      functionList: [
        { id: "1", name: "开启选择", data: "block" },
        { id: "2", name: "复制选择", data: "cloneActive" },
        { id: "3", name: "点击删除", data: "deleteActive" },
        { id: "4", name: "清除画布", data: "clear" },
        { id: "5", name: "移动", data: "play" },
        { id: "6", name: "插入图片", data: "photo" },
        { id: "7", name: "保存", data: "save" },
        { id: "8", name: "svg", data: "svg" },
      ],
      lineWidth: 1,
      disabled: false,
      canvas: null,
      mouseTo: {}, //鼠标开始移动点位置
      mouseFrom: {}, //鼠标结束移动点位置
      textbox: null, //文本
      drawWidth: 2, //笔触宽度
      color: "#000", //画笔颜色 66B5F5
      drawingObject: null, //当前绘制对象
      moveCount: 1, //绘制移动计数器
      doDrawing: false, // 绘制状态
      drawType: "makeRect", //绘制类型
      savecontent: "", //存储内容
      pointNum: 0, //组合标注点数
      img: require("../assets/img/2.jpg"),
    };
  },
  methods: {
    // 颜色选择器
    colorInput(e) {
      this.color = e.target.value;
      this.canvas.freeDrawingBrush.color = this.color;
    },

    // 笔触修改
    slider(e) {
      this.drawWidth = e;
      this.canvas.freeDrawingBrush.width = this.drawWidth;
    },

    //绘制类型
    drawfn(type) {
      this.drawType = type;
      this.canvas.isDrawingMode = false;
      let target = this.canvas.getActiveObject();

      if (this.textbox) {
        //退出文本编辑状态
        this.textbox.exitEditing();
        this.textbox = null;
      }

      if (this.drawType == "play") {
        this.play(target);
      } else if (this.drawType == "svg") {
        let svg = this.canvas.toSVG();
        console.log(svg);
      } else if (this.drawType == "save") {
        this.savecontent = this.canvas.toDataURL();
        console.log(JSON.stringify(this.savecontent));
      } else if (this.drawType == "cloneActive") {
        this.cloneActive(target);
      } else if (this.drawType == "photo") {
        this.addPhoto();
      } else if (this.drawType == "clear") {
        this.clear();
        this.pointNum = 0;
      } else if (this.drawType == "modeSwitching") {
        this.canvas.isDrawingMode = true;
        this.canvas.freeDrawingBrush.color = this.color;
      } else if (this.drawType == "block" || this.drawType == "deleteActive") {
        this.canvas.selectable = true;
        this.canvas.selection = true;
        this.canvas.skipTargetFind = false;
      } else {
        this.canvas.skipTargetFind = true; //画板元素不能被选中
        this.canvas.selection = false; //画板不显示选中
        this.canvas.selectable = false; //控件不能被选择
      }
    },

    // 插入图片
    addPhoto() {
      let _this = this;
      fabric.Image.fromURL(_this.img, function (oImg) {
        _this.canvas.add(oImg.set({ left: 100, top: 50, angle: 0 }).scale(0.05));//图片插入的位置以及缩小倍数
      });
    },

    // 绘制文本
    makeText(
      left,
      top,
      text = "hello world",
      color = "transparent",
      height = 40
    ) {
      let textbox = new fabric.IText(text, {
        left: left, //距离画布左侧的距离，单位是像素
        top: top, //距离画布上边的距离
        height: height,
        MIN_TEXT_WIDTH: 3,
        backgroundColor: color,
        fontSize: "12",
        textAlign: "center",
        hoverCursor: "pointer", //鼠标选中时的样式
      });
      this.canvas.add(textbox);
      this.textbox = textbox;
      //文本聚焦
      textbox.enterEditing();
      textbox.hiddenTextarea.focus();
    },

    // 矩形
    makeRect(left, top, width, height) {
      let _this = this;
      let rectObj = new fabric.Rect({
        left: left, //距离画布左侧的距离，单位是像素
        top: top, //距离画布上边的距离
        fill: "rgba(102, 181, 245, 0.4)", //填充的颜色
        width: _this.mouseTo.x - left, //方形的宽度
        height: _this.mouseTo.y - top, //方形的高度
        stroke: this.color,
        hoverCursor: "pointer", //鼠标选中时的样式
      });
      if (rectObj) {
        _this.canvas.remove(_this.drawingObject);
        _this.canvas.add(rectObj); //
        _this.drawingObject = rectObj;
      }
    },

    // 圆
    makeCircle(left, top, r) {
      let circleObj = new fabric.Circle({
        left: left,
        top: top,
        strokeWidth: this.drawWidth,
        radius: this.mouseTo.x - left > 0 ? this.mouseTo.x - left : 10,
        fill: "rgba(102, 181, 245, 0.4)",
        stroke: this.color,
        originX: "center",
        originY: "center",
        hoverCursor: "pointer", //鼠标选中时的样式
      });
      if (circleObj) {
        this.canvas.remove(this.drawingObject);
        this.canvas.add(circleObj); //
        this.drawingObject = circleObj;
      }
    },

    // 三角形
    makeTriangle(left, top) {
      let triangle = new fabric.Triangle({
        left: left,
        top: top,
        width: this.mouseTo.x - left,
        height: this.mouseTo.y - top,
        strokeWidth: this.drawWidth,
        fill: "rgba(102, 181, 245, 0.4)",
        stroke: this.color,
        hoverCursor: "pointer", //鼠标选中时的样式
      });
      if (triangle) {
        this.canvas.remove(this.drawingObject);
        this.canvas.add(triangle); //
        this.drawingObject = triangle;
      }
    },

    // 直线
    makeLine(left, top) {
      let canvasObject = new fabric.Line(
        [left, top, this.mouseTo.x, this.mouseTo.y],
        {
          stroke: this.color,
          strokeWidth: this.drawWidth,
        }
      );
      if (canvasObject) {
        this.canvas.remove(this.drawingObject);
        this.canvas.add(canvasObject); //
        this.drawingObject = canvasObject;
      }
    },

    //虚线
    makeDottedline() {
      let canvasObject = new fabric.Line(
        [this.mouseFrom.x, this.mouseFrom.y, this.mouseTo.x, this.mouseTo.y],
        {
          stroke: this.color,
          strokeWidth: this.drawWidth,
          strokeDashArray: [3, 1],
        }
      );
      if (canvasObject) {
        this.canvas.remove(this.drawingObject);
        this.canvas.add(canvasObject); //
        this.drawingObject = canvasObject;
      }
    },

    // 清除画布
    clear() {
      this.canvas.clear();
    },

    // 组合绘制
    makeArr(left, top) {
      let _this = this;
      this.pointNum = parseInt(this.pointNum) + 1;
      this.pointNum = this.pointNum.toString();

      let circleObj = new fabric.Circle({
        left: left,
        top: top,
        strokeWidth: 2,
        radius: 3,
        fill: "rgba(102, 181, 245, 0.4)",
        stroke: "#666",
        originX: "center",
        originY: "center",
        hoverCursor: "pointer", //鼠标选中时的样式
      });

      let text = new fabric.IText(_this.pointNum, {
        left: left, //距离画布左侧的距离，单位是像素
        top: top - 10, //距离画布上边的距离
        MIN_TEXT_WIDTH: 3,
        fontSize: "16",
        originX: "center", //调整中心点的X轴坐标
        originY: "bottom", //调整中心点的Y轴坐标
        textAlign: "center",
        borderColorl: "#3c3c3c",
      });

      // 添加组合至画布
      let block = new fabric.Group([circleObj, text], {
        left: left - 3, //距离画布左侧的距离，单位是像素
        top: top - 27, //距离画布上边的距离
      });
      if (block) {
        this.canvas.remove(this.drawingObject);
        this.canvas.add(block); //
        this.drawingObject = block;
      }
      // this.canvas.add(block);
    },

    // 复制当前所选
    cloneActive(target) {
      let _this = this;
      target.clone(function (cloned) {
        cloned.left += 10;
        cloned.top += 10;
        _this.canvas.add(cloned);
      });
    },

    // 运动
    play(target) {
      // 移动动画
      target.animate("left", target.left === 25 ? 275 : 25, {
        duration: 1000,
        onChange: this.canvas.renderAll.bind(this.canvas),
        onComplete: function () {
          console.log("播放结束!");
        },
        easing: fabric.util.ease.easeInCubic,
      });

      // 旋转动画
      target.animate("angle", target.left === 25 ? 360 : 0, {
        duration: 1000,
        onChange: this.canvas.renderAll.bind(this.canvas),
        onComplete: function () {
          console.log("播放结束!");
        },
        easing: fabric.util.ease.easeInCubic,
      });
    },

    // 绘画
    drawing() {
      let _this = this;
      switch (_this.drawType) {
        case "makeText": //文本
          _this.makeText(_this.mouseFrom.x, _this.mouseFrom.y);
          break;
        case "makeRect": //矩形
          _this.makeRect(_this.mouseFrom.x, _this.mouseFrom.y);
          break;
        case "Circl": //圆
          _this.makeCircle(_this.mouseFrom.x, _this.mouseFrom.y);
          break;
        case "line": //直线
          _this.makeLine(_this.mouseFrom.x, _this.mouseFrom.y);
          break;
        case "dottedline": //虚线
          _this.makeDottedline(_this.mouseFrom.x, _this.mouseFrom.y);
          break;
        case "Triangle": //三角形
          _this.makeTriangle(_this.mouseFrom.x, _this.mouseFrom.y);
          break;
        default:
          return;
      }
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
    // 绘制不规则路径： let path = new fabric.Path()
    // 绘制椭圆： let ellipse = new fabric.Ellipse()
    // 绘制多边形： let polygon = new fabric.Polygon()
    // 自由绘画： let freeDrawingBrush = new fabric.FreeDrawingBrush()

    // 声明画布
    this.canvas = new fabric.Canvas("canvas", {
      // backgroundColor: "pink",//画布背景色
      isDrawingMode: false,
      skipTargetFind: true,
      selectable: false,
      selection: false,
    });

    let _this = this;

    // 监听鼠标右键按下
    this.canvas.on("mouse:down", function (options) {
      // 获取按下时的坐标
      let pointer = _this.canvas.getPointer(options.e);
      _this.mouseFrom.x = pointer.x;
      _this.mouseFrom.y = pointer.y;
      _this.doDrawing = true;
    });

    // 监听鼠标右键抬起
    this.canvas.on("mouse:up", function (options) {
      //获取鼠标抬起时的坐标
      let pointer = _this.canvas.getPointer(options.e);
      _this.mouseTo.x = pointer.x;
      _this.mouseTo.y = pointer.y;

      if (_this.drawType == "makeText") {
        _this.makeText(_this.mouseFrom.x, _this.mouseFrom.y);
      }
      if (_this.drawType == "Point") {
        _this.makeArr(_this.mouseFrom.x, _this.mouseFrom.y);
      }

      _this.doDrawing = false;
      _this.drawingObject = null;
      _this.moveCount = 1;
    });

    // 监听鼠标移动
    this.canvas.on("mouse:move", function (options) {
      if (_this.moveCount % 2 && !_this.doDrawing) {
        //减少绘制频率
        return;
      }
      _this.moveCount++;
      //获取鼠标抬起时的坐标
      let pointer = _this.canvas.getPointer(options.e);
      _this.mouseTo.x = pointer.x;
      _this.mouseTo.y = pointer.y;

      //获取当前选中的对象
      let target = _this.canvas.getActiveObject();
      // 判断是否是在标注内圈选和是否只是点击
      if (!target && _this.mouseTo.x !== _this.mouseFrom.x) {
        _this.drawing();
      }
    });

    // 监听对象选中
    this.canvas.on("selection:created", function (e) {
      if (_this.drawType == "deleteActive") {
        let target = _this.canvas.getActiveObject();
        if (e.target._objects) {
          _this.pointNum = parseInt(_this.pointNum) - 1;
          // 获取当前被删除的对象
          // let text = e.target._objects[1].text;
        }
        _this.canvas.remove(target);

        // _this.canvas.discardActiveObject(); //清除选中框
      }
    });

    // 防止对象移动时移出画布
    this.canvas.on("object:moving", function (e) {
      let obj = e.target;
      if (
        obj.currentHeight > obj.canvas.height ||
        obj.currentWidth > obj.canvas.width
      ) {
        return;
      }
      obj.setCoords();
      // top-left  corner
      if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
        obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top);
        obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left);
      }
      // bot-right corner
      if (
        obj.getBoundingRect().top + obj.getBoundingRect().height >
          obj.canvas.height ||
        obj.getBoundingRect().left + obj.getBoundingRect().width >
          obj.canvas.width
      ) {
        obj.top = Math.min(
          obj.top,
          obj.canvas.height -
            obj.getBoundingRect().height +
            obj.top -
            obj.getBoundingRect().top
        );
        obj.left = Math.min(
          obj.left,
          obj.canvas.width -
            obj.getBoundingRect().width +
            obj.left -
            obj.getBoundingRect().left
        );
      }
    });
  },
};
</script>

<style lang="less" scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  .tipName {
    margin: 20px;
  }
  .typeBox {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    flex-direction: column;
    margin: 20px;
    .type {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      .line-slider {
        width: 200px;
        padding: 0 20px;
      }
    }
  }
  #canvas {
    background: url("../assets/img/one.jpg") no-repeat center center;
    background-size: contain;
  }
  .msg {
    width: 100%;
    height: 40px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
