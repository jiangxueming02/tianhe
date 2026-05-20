<template>
  <view class="main-page">
    <!-- 三个标签页同时渲染，用 v-show 切换显隐（小程序不支持 keep-alive） -->
    <view class="tab-content">
      <view v-show="activeTab === 'home'" class="tab-panel">
        <TabHome :tabMode="true" :visible="activeTab === 'home'" @switchTab="onSwitchTab" />
      </view>
      <view v-show="activeTab === 'index'" class="tab-panel">
        <TabIndex :tabMode="true" :visible="activeTab === 'index'" @switchTab="onSwitchTab" />
      </view>
      <view v-show="activeTab === 'order'" class="tab-panel">
        <TabOrder :tabMode="true" :visible="activeTab === 'order'" @switchTab="onSwitchTab" />
      </view>
    </view>

    <!-- 底部导航栏（事件模式，只切换 activeTab，不触发页面跳转） -->
    <text-tab-bar
      :current="activeTab"
      :eventMode="true"
      @tabchange="onTabChange"
    />
  </view>
</template>

<script>
import TabHome from "../home/home.vue";
import TabIndex from "../index/index.vue";
import TabOrder from "../order/order.vue";

export default {
  components: { TabHome, TabIndex, TabOrder },
  data() {
    return {
      activeTab: "home"
    };
  },
  methods: {
    onTabChange(name) {
      this.activeTab = name;
    },
    onSwitchTab(name) {
      this.activeTab = name;
    }
  }
};
</script>

<style scoped>
.main-page {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #f5f0eb;
}

.tab-content {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.tab-panel {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
