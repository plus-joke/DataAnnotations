<!--
 * @Author: your name
 * @Date: 2021-04-29 11:19:20
 * @LastEditTime: 2021-05-08 10:01:30
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \DataAnnotationsDemo-jxl\src\views\Konva.vue
-->
<template>
  <div class="wrapper"> 
    <a-divider orientation="left" class="tipName"> Konva.js （效果图）</a-divider>
    <v-stage
      ref="stage"
      :config="configKonva"
      @dragstart="handleDragstart"
      @dragend="handleDragend"
    >
      <v-layer ref="layer">
        <v-star
          v-for="item in list"
          :key="item.id"
          :config="{
            x: item.x,
            y: item.y,
            rotation: item.rotation,
            id: item.id,
            numPoints: 5,
            innerRadius: 30,
            outerRadius: 50,
            fill: '#89b717',
            opacity: 0.8,
            draggable: true,
            scaleX: dragItemId === item.id ? item.scale * 1.2 : item.scale,
            scaleY: dragItemId === item.id ? item.scale * 1.2 : item.scale,
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffsetX: dragItemId === item.id ? 15 : 5,
            shadowOffsetY: dragItemId === item.id ? 15 : 5,
            shadowOpacity: 0.6,
          }"
        ></v-star>
        <v-star
          v-for="item in arr"
          :key="item.id"
          :config="{
            x: item.x,
            y: item.y,
            rotation: item.rotation,
            id: item.id,
            numPoints: 6,
            innerRadius: 30,
            outerRadius: 50,
            fill: 'pink',
            opacity: 0.8,
            draggable: true,
            scaleX: dragItemId === item.id ? item.scale * 1.2 : item.scale,
            scaleY: dragItemId === item.id ? item.scale * 1.2 : item.scale,
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffsetX: dragItemId === item.id ? 15 : 5,
            shadowOffsetY: dragItemId === item.id ? 15 : 5,
            shadowOpacity: 0.6,
          }"
        ></v-star>
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
const width = 1000;
const height = 450;
export default {
  name:'Konva',
  data() {
    return {
      list: [],
      arr:[],
      dragItemId: null,
      configKonva: {
        width: width,
        height: height,
      },
    };
  },
  methods: {
    handleDragstart(e) {
      this.dragItemId = e.target.id();
      const item = this.list.find((i) => i.id === this.dragItemId);
      const index = this.list.indexOf(item);
      this.list.splice(index, 1);
      this.list.push(item);
    },
    handleDragend(e) {
      this.dragItemId = null;
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
    for (let n = 0; n < 20; n++) {
      this.list.push({
        id: Math.round(Math.random() * 10000).toString(),
        x: Math.random() * width,
        y: Math.random() * height,
        rotation: Math.random() * 180,
        scale: Math.random(),
      });
      this.arr.push({
        id: Math.round(Math.random() * 100000).toString(),
        x: Math.random() * width,
        y: Math.random() * height,
        rotation: Math.random() * 160,
        scale: Math.random(),
      });
    }
  },
};
</script>

<style lang="less" scoped>
.wrapper{
   display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  .tipName {
    margin: 20px;
  }
}

</style>