<!--
 * @Author: your name
 * @Date: 2021-04-28 12:42:02
 * @LastEditTime: 2021-05-08 10:00:10
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \DataAnnotationsDome\src\App.vue
-->
<template>
  <div id="app">
    <a-layout id="components-layout-demo-responsive">
      <a-layout-sider
        breakpoint="lg"
        collapsed-width="0"
        @collapse="onCollapse"
        @breakpoint="onBreakpoint"
      >
        <div class="logo" />
        <a-menu theme="dark" mode="inline" :default-selected-keys="[current]">
          <a-menu-item :key="item.id" v-for="item in list" @click="handleClick">
            <router-link :to="item.path">
              <a-icon :type="item.icon" />
              <span class="nav-text">{{ item.name }}</span>
            </router-link>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout>
        <a-layout-content
          :style="{
            margin: '16px 16px 0',
            background: '#fff',
            height: '100vh',
          }"
        >
          <router-view />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>

<script>
export default {
  data() {
    return {
      list: [
        { id: "1", name: "Fabric", icon: "dot-chart", path: "/Fabric" },
        { id: "2", name: "AILabel", icon: "bar-chart", path: "/AILabel" },
        { id: "3", name: "ZRender", icon: "line-chart", path: "/ZRender" },
        { id: "4", name: "Konva", icon: "area-chart", path: "/Konva" },
      ],
      current: "1",
    };
  },
  methods: {
    handleClick(e) {
      console.log("click", e);
      this.current = e.key;
    },

    onCollapse(collapsed, type) {
      console.log(collapsed, type);
    },
    onBreakpoint(broken) {
      console.log(broken);
    },
  },
};
</script>

<style lang="less" scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
#components-layout-demo-responsive {
  height: 100vh;
  .logo {
    height: 32px;
    background: rgba(255, 255, 255, 0.2);
    margin: 16px;
  }
}
</style>
