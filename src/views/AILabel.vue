<template>
  <div class="wrapper">
    <a-divider orientation="left" class="tipName"> AILabel.js </a-divider>
    <div class="typeBox">
      <a-radio-group default-value="" button-style="solid">
        <a-radio-button
          v-for="item in typeList"
          :key="item.id"
          :id="item.idName"
          @click="setMode(item.data)"
          :value="item.val"
        >
          {{ item.name }}
        </a-radio-button>
      </a-radio-group>
    </div>
    <!-- 画布 -->
    <div id="map"></div>
  </div>
</template>

<script>
import AILabel from "ailabel";
export default {
  name: "AILable",
  components: {},
  props: {},
  data() {
    return {
      typeList: [
        {
          id: "1",
          idName: "drawMask",
          name: "自由绘制",
          data: "drawMask",
          val: "drawMask",
        },
        {
          id: "2",
          idName: "drawRect",
          name: "矩形",
          data: "drawRect",
          val: "drawRect",
        },
        {
          id: "3",
          idName: "clearMask",
          name: "涂抹",
          data: "clearMask",
          val: "clearMask",
        },
        {
          id: "4",
          idName: "textMask",
          name: "文本",
          data: "textMask",
          val: "textMask",
        },
        {
          id: "5",
          idName: "drawPolygon",
          name: "多边形",
          data: "drawPolygon",
          val: "drawPolygon",
        },
        {
          id: "6",
          idName: "drawPolyline",
          name: "线段",
          data: "drawPolyline",
          val: "drawPolyline",
        },
        {
          id: "7",
          idName: "drawPoint",
          name: "点",
          data: "drawPoint",
          val: "drawPoint",
        },
        {
          id: "8",
          idName: "clear",
          name: "清空",
          data: "clear",
          val: "clear",
        },
      ],
      gMaskLayer: "", //涂抹层
      gTextLayer: "", //文本层
      gImageLayer: "", //图片层
      gFeatureLayer: "", //数据层（点、线、面）
      Mode: "",
      gMap: "",
      mappingStyles: {
        //定义样式
        drawRect: {
          //矩形样式
          drawStyle: { strokeColor: "#FF0000", opacity: 1, lineWeight: 1 },
          featureStyle: {
            strokeColor: "#00FF00",
            fillColor: "#0000FF",
            opacity: 0.3,
            lineWeight: 1,
          },
        },
        drawMask: {
          //绘制样式
          drawStyle: {
            strokeColor: "#FF0000",
            fillColor: "#0000FF",
            opacity: 1,
            lineWeight: 1,
          },
          featureStyle: {},
        },
        clearMask: {
          //涂抹样式
          drawStyle: { lineWeight: 10 },
          featureStyle: {},
        },
        textMask: {
          //文本样式
          drawStyle: {
            strokeColor: "#FF0000",
            fillColor: "#0000FF",
            opacity: 1,
            lineWeight: 1,
          },
          featureStyle: {},
        },
        drawPolygon: {
          //多边形样式
          drawStyle: { strokeColor: "#00FF00", opacity: 1, lineWeight: 1 },
          featureStyle: {
            strokeColor: "#0000FF",
            fillColor: "#00FF00",
            opacity: 0.3,
            lineWeight: 1,
          },
        },
        drawPolyline: {
          //多线段样式
          drawStyle: {
            strokeColor: "#FF0000",
            fillColor: "#0000FF",
            opacity: 1,
            lineWeight: 6,
          },
          featureStyle: {
            strokeColor: "#0000FF",
            fillColor: "#FF0000",
            opacity: 0.5,
            lineWeight: 6,
          },
        },
        drawPoint: {
          //点样式
          drawStyle: { pointRadius: 5 },
          featureStyle: {
            strokeColor: "#0000FF",
            fillColor: "#8B008B",
            opacity: 1,
            pointRadius: 5,
          },
        },
        clear: {
          //点样式
          drawStyle: {},
          featureStyle: {
            strokeColor: "#0000FF",
            fillColor: "#8B008B",
            opacity: 1,
            pointRadius: 5,
          },
        },
      },
    };
  },
  methods: {
    // 模式
    setMode(mode, color, size) {
      const drawStyle = this.mappingStyles[mode].drawStyle;
      if (color) {
        if (mode === "drawPolyline") {
          drawStyle.strokeColor = color;
        } else {
          drawStyle.fillColor = color;
        }
      }
      if (size) {
        drawStyle.lineWeight = size;
      }
      if (mode == "clear") {
        // this.gMaskLayer.removeAllMarkers();//涂抹层
        this.gTextLayer.removeAllTexts(); //文本层
        this.gFeatureLayer.removeAllFeatures(); //数据层
      }
      this.Mode = mode;
      this.gMap && this.gMap.setMode(mode, new AILabel.Style(drawStyle)); // 设置当前模式（模式名，样式）
      console.log(this.gMap.getMode());
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
    //声明实例
    this.gMap = new AILabel.Map("map", {
      zoom: 1280, //初始缩放级别
      cx: 0, //初始中心坐标x
      cy: 0, //初始中心坐标y
      zoomMax: 650 * 10, //缩放最大级别
      zoomMin: 650 / 10, //缩放最小级别
      autoPan: true, //绘制过程中是否禁止自动平移
      drawZoom: true, //绘制过程中是否禁止滑轮缩放
      autoFeatureSelect: true, //默认是否双击选中feature
    });

    // 添加text对象
    const gTextStyle = new AILabel.Style({ strokeColor: "#0000FF" });
    this.gTextLayer = new AILabel.Layer.Text("text", { zIndex: 4 });
    this.gMap.addLayer(this.gTextLayer);

    //添加图片
    this.gImageLayer = new AILabel.Layer.Image(
      "img",
      require("../assets/img/tip.jpg"),
      { w: 1180, h: 620 },
      { zIndex: 1 }
    );
    this.gMap.addLayer(this.gImageLayer);

    //矢量层实例添加
    this.gFeatureLayer = new AILabel.Layer.Feature("featureLayer", {
      zIndex: 3,
      transparent: false,
    });
    this.gMap.addLayer(this.gFeatureLayer);

    //涂抹
    this.gMaskLayer = new AILabel.Layer.Mask("maskLayer", {
      zIndex: 2,
      opacity: 0.8,
    });
    this.gMap.addLayer(this.gMaskLayer);

    //监听鼠标按下
    this.gMap.events.on("mouseDown", (xy) => {
      if (this.Mode == "textMask") {
        const timestamp = new Date().getTime();
        const text2 = new AILabel.Text(
          `text-${timestamp}`,
          {
            pos: { x: xy.x, y: xy.y }, //坐标
            offset: { x: 0, y: 0 }, //偏移值
            width: 140, //文本宽度
            text: "中国", //文本内容
          },
          gTextStyle
        );

        this.gTextLayer.addText(text2);
      }
      console.log("xy", xy);
    });

    //监听元素编辑
    this.gMap.events.on("geometryEditDone", (type, activeFeature, points) => {
      if (type === "rect" || type === "polygon" || type === "polyline") {
        activeFeature.update({ points });
      } else if (type === "roi") {
        // 判断编辑后的多边形是否有效
        const activeFeatureValidate = roiLayer.validateFeatureWithNewPoints(
          activeFeature,
          points
        );
        activeFeatureValidate && activeFeature.update({ points });
      } else if (type === "mask") {
        for (let i = 0, len = activeFeature.length; i < len; i++) {
          const { layerId, masks } = activeFeature[i];
          const maskLayer = gMap.getLayerById(layerId);
          maskLayer && maskLayer.addMasks(masks, true);
        }
      }
    });

    // 目前此事件钩子只针对point类型数据
    this.gMap.events.on("geometryRemove", (type, removeFeature) => {
      if (type === "point") {
        this.gFeatureLayer.removeFeatureById(removeFeature.id);
      }
    });

    //监听鼠标滑动
    this.gMap.events.on("geometryDrawDone", (type, points, options) => {
      // 生成元素唯一标志（时间戳）
      const timestamp = new Date().getTime();
      const cMode = this.gMap.getMode();
      const featureStyle = this.mappingStyles[cMode].featureStyle;
      // 元素添加展示
      if (type === "point") {
        console.log("--points--", points);
        const { radius = 5 } = options || {};
        let fea = new AILabel.Feature.Point(
          `feature-${timestamp}`,
          points,
          {
            name: "中国",
          },

          featureStyle
        );
        this.gFeatureLayer.addFeature(fea);
      }
      if (type === "rect") {
        const fea = new AILabel.Feature.Rect(
          `feature-${timestamp}`,
          points,
          {
            name: "中国",
          },
          featureStyle,
          { activeColor: "#000", cross: true }
        );
        this.gFeatureLayer.addFeature(fea);
      } else if (type === "mask") {
        // 包含绘制&涂抹事件
        const maskAction = points;
        console.log("--maskAction--", maskAction);
        maskAction.name = "标签A";
        this.gMaskLayer.addMaskAction(maskAction);
      } else if (type === "polygon") {
        let fea = new AILabel.Feature.Polygon(
          `feature-${timestamp}`,
          points,
          { name: "中国" },
          featureStyle,
          { edgeFixed: true } // edgeFixed标识是否固定边
        );
        this.gFeatureLayer.addFeature(fea);
      } else if (type === "polyline") {
        const { width = 5 } = options || {};
        let fea = new AILabel.Feature.Polyline(
          `feature-${timestamp}`,
          points,
          {
            name: "中国",
          },
          featureStyle,
          { width, activeColor: "#000" }
        );
        this.gFeatureLayer.addFeature(fea);
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
  }
  #map {
    width: 700px;
    height: 400px;
    border: 1px solid #3f3f3f;
    position: relative;
    cursor: pointer;
  }
}
</style>