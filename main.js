import Vue from "vue";
import App from "./App";
import TextTabBar from "./components/text-tab-bar/text-tab-bar.vue";

Vue.component("text-tab-bar", TextTabBar);

Vue.config.productionTip = false;
App.mpType = "app";

const app = new Vue({
  ...App
});
app.$mount();
