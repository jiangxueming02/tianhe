<template>
  <view class="page" :class="{ 'page-tab': tabMode }">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 店铺头部 -->
    <view class="store-head">
      <view class="store-brand-line"></view>
      <text class="store-name">天和五行</text>
      <text class="store-tip">精选原叶 · 鲜奶现萃</text>
    </view>

    <!-- 自取/外卖切换 -->
    <view class="type-toggle">
      <view
        class="type-toggle-item"
        :class="{ active: topTab === 'pickup' }"
        @tap="setTopTab('pickup')"
      >
        <view class="type-toggle-icon type-icon-store"></view>
        <text class="type-toggle-label">门店自取</text>
      </view>
      <view class="type-toggle-divider"></view>
      <view
        class="type-toggle-item"
        :class="{ active: topTab === 'delivery' }"
        @tap="setTopTab('delivery')"
      >
        <view class="type-toggle-icon type-icon-delivery"></view>
        <text class="type-toggle-label">外卖配送</text>
      </view>
    </view>

    <!-- 分类切换 -->
    <view class="tabs">
      <view
        class="tab"
        :class="{ active: subTab === 'menu' }"
        @tap="setSubTab('menu')"
      >菜单</view>
      <view
        class="tab"
        :class="{ active: subTab === 'nearby' }"
        @tap="setSubTab('nearby')"
      >周边</view>
    </view>

    <!-- 商品列表 -->
    <scroll-view
      class="goods-scroll"
      scroll-y
    >
      <view v-if="subTab === 'menu'" class="goods-list">
        <view class="goods-card" v-for="good in menuGoods" :key="good.id">
          <view class="goods-img-wrap">
            <image class="goods-img" :src="good.image" mode="aspectFit" />
          </view>
          <view class="goods-body">
            <text class="goods-name">{{ good.name }}</text>
            <text class="goods-desc">{{ good.desc }}</text>
            <view class="goods-footer">
              <text class="goods-price">{{ good.price }}</text>
              <view class="stepper">
                <text
                  class="stepper-btn"
                  :class="{ disabled: !getCount(good.id) }"
                  @tap="decrease(good)"
                >−</text>
                <text
                  class="stepper-val"
                  v-if="getCount(good.id)"
                >{{ getCount(good.id) }}</text>
                <text class="stepper-btn stepper-add" @tap="addToCart(good)">+</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="goods-list">
        <view class="goods-card" v-for="good in nearbyGoods" :key="good.id">
          <view class="goods-img-wrap">
            <image class="goods-img" :src="good.image" mode="aspectFit" />
          </view>
          <view class="goods-body">
            <text class="goods-name">{{ good.name }}</text>
            <text class="goods-desc">{{ good.desc || '周边好物' }}</text>
            <view class="goods-footer">
              <text class="goods-price">{{ good.price }}</text>
              <view class="stepper">
                <text
                  class="stepper-btn"
                  :class="{ disabled: !getCount(good.id) }"
                  @tap="decrease(good)"
                >−</text>
                <text
                  class="stepper-val"
                  v-if="getCount(good.id)"
                >{{ getCount(good.id) }}</text>
                <text class="stepper-btn stepper-add" @tap="addToCart(good)">+</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 购物车底栏 -->
    <view class="cart-bar" v-if="cartCount > 0">
      <view class="cart-left" @tap="openCartDetail">
        <view class="cart-icon-wrap">
          <view class="cart-icon"></view>
          <text class="cart-badge">{{ cartCount }}</text>
        </view>
        <view class="cart-info">
          <text class="cart-total">￥{{ totalPrice }}</text>
          <text class="cart-label">预估总额</text>
        </view>
      </view>
      <view class="cart-action" @tap="goOrderPage">去结算</view>
    </view>

    <!-- 购物车弹窗 -->
    <view v-if="showCartDetail" class="modal-mask" @tap="closeCartDetail">
      <view class="cart-detail" @tap.stop>
        <view class="cart-detail-header">
          <text class="cart-detail-title">购物车</text>
          <view class="cart-detail-close" @tap="closeCartDetail">
            <view class="close-icon"></view>
          </view>
        </view>
        <scroll-view class="cart-detail-list" scroll-y>
          <view v-if="cartItems.length === 0" class="cart-empty">
            <text>购物车还是空的</text>
          </view>
          <view v-for="item in cartItems" :key="item.id" class="cart-detail-item">
            <view class="cart-detail-img-wrap">
              <image class="cart-detail-img" :src="item.image" mode="aspectFit" />
            </view>
            <view class="cart-detail-body">
              <text class="cart-detail-name">{{ item.name }}</text>
              <view class="cart-detail-bottom">
                <text class="cart-detail-price">￥{{ item.subtotal }}</text>
                <text class="cart-detail-qty">x{{ item.count }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <text-tab-bar v-if="!tabMode" current="index" />
  </view>
</template>

<script>
export default {
  props: {
    tabMode: { type: Boolean, default: false },
    visible: { type: Boolean, default: true }
  },
  watch: {
    visible(val) {
      if (val) {
        this.loadCart();
        const pending = uni.getStorageSync("pendingOrderType");
        if (pending === "delivery" || pending === "pickup") {
          this.handleOrderType(pending);
        }
      }
    }
  },
  data() {
    return {
      statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
      topTab: "pickup",
      subTab: "menu",
      menuGoods: [
        {
          id: "tea1",
          name: "绿茶",
          desc: "鲜爽回甘",
          price: "￥18",
          image: "/static/tea-green.png"
        },
        {
          id: "tea2",
          name: "乌龙茶",
          desc: "香高韵长",
          price: "￥16",
          image: "/static/tea-oolong.png"
        },
        {
          id: "tea3",
          name: "白茶",
          desc: "清润甜柔",
          price: "￥15",
          image: "/static/tea-puer.png"
        },
        {
          id: "tea4",
          name: "普洱茶",
          desc: "醇厚耐泡",
          price: "￥17",
          image: "/static/tea-white.png"
        },
        {
          id: "tea5",
          name: "红茶",
          desc: "温润甜醇",
          price: "￥19",
          image: "/static/tea-black.png"
        }
      ],
      nearbyGoods: [
        { id: "zb1", name: "餐具", price: "￥9", image: "/static/zb-cutlery.png" },
        { id: "zb2", name: "茶杯", price: "￥29", image: "/static/zb-teacup.png" },
        { id: "zb3", name: "香薰", price: "￥39", image: "/static/zb-aroma.png" },
        { id: "zb4", name: "马克杯", price: "￥49", image: "/static/zb-mug.png" },
        { id: "zb5", name: "礼盒", price: "￥59", image: "/static/zb-gift.png" },
        { id: "zb6", name: "眼罩", price: "￥19", image: "/static/zb-eye-mask.png" },
        { id: "zb7", name: "短袖 T 恤", price: "￥89", image: "/static/duanxiu.png" },
        { id: "zb8", name: "钥匙扣", price: "￥9.9", image: "/static/yaoshikou.png" },
        { id: "zb9", name: "魔术贴", price: "￥9.9", image: "/static/moshutie.png" }
      ],
      cartMap: {},
      showCartDetail: false
    };
  },
  computed: {
    cartCount() {
      return Object.keys(this.cartMap).reduce((sum, id) => sum + this.cartMap[id], 0);
    },
    totalPrice() {
      const all = this.menuGoods.concat(this.nearbyGoods);
      const priceMap = {};
      all.forEach((item) => {
        priceMap[item.id] = Number(item.price.replace("￥", ""));
      });
      const total = Object.keys(this.cartMap).reduce((sum, id) => {
        return sum + (priceMap[id] || 0) * this.cartMap[id];
      }, 0);
      return total.toFixed(2);
    },
    cartItems() {
      const all = this.menuGoods.concat(this.nearbyGoods);
      const allMap = {};
      all.forEach((item) => {
        allMap[item.id] = item;
      });
      return Object.keys(this.cartMap).map((id) => {
        const base = allMap[id] || {};
        const count = this.cartMap[id] || 0;
        const price = Number((base.price || "￥0").replace("￥", ""));
        return {
          id,
          name: base.name || "未知商品",
          image: base.image || "",
          count,
          subtotal: (price * count).toFixed(2)
        };
      });
    }
  },
  methods: {
    setTopTab(type) {
      this.topTab = type;
    },
    setSubTab(type) {
      this.subTab = type;
    },
    getCount(id) {
      return this.cartMap[id] || 0;
    },
    addToCart(good) {
      const next = Object.assign({}, this.cartMap);
      next[good.id] = (next[good.id] || 0) + 1;
      this.cartMap = next;
      uni.setStorageSync("cartMap", this.cartMap);
    },
    decrease(good) {
      const current = this.cartMap[good.id] || 0;
      if (!current) {
        return;
      }
      const next = Object.assign({}, this.cartMap);
      next[good.id] = current - 1;
      if (next[good.id] <= 0) {
        delete next[good.id];
      }
      this.cartMap = next;
      uni.setStorageSync("cartMap", this.cartMap);
    },
    openCartDetail() {
      this.showCartDetail = true;
    },
    closeCartDetail() {
      this.showCartDetail = false;
    },
    goOrderPage() {
      // 从购物车生成订单数据
      const items = this.cartItems;
      const type = this.topTab;
      const order = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        type: type,
        typeLabel: type === "delivery" ? "外卖配送" : "门店自取",
        status: "已完成",
        images: items.slice(0, 3).map(i => i.image),
        moreCount: items.length > 3 ? items.length - 3 : 0,
        itemCount: items.reduce((s, i) => s + i.count, 0),
        total: parseFloat(this.totalPrice),
        items: items,
        createdAt: Date.now()
      };
      // 保存到订单列表
      let orders = [];
      try { orders = uni.getStorageSync("orderList") || []; } catch (e) { orders = []; }
      orders.unshift(order);
      uni.setStorageSync("orderList", orders);
      // 清空购物车
      this.cartMap = {};
      uni.removeStorageSync("cartMap");
      uni.removeStorageSync("pendingOrderType");
      this.showCartDetail = false;
      if (this.tabMode) {
        this.$emit("switchTab", "order");
        return;
      }
      uni.reLaunch({
        url: "/pages/order/order"
      });
    },
    loadCart() {
      let saved = null;
      try {
        saved = uni.getStorageSync("cartMap");
      } catch (e) { /* ignore */ }
      if (saved && typeof saved === "object") {
        this.cartMap = saved;
      }
    },
    handleOrderType(type) {
      this.topTab = type === "delivery" ? "delivery" : "pickup";
    }
  },
  mounted() {
    // 组件模式下初始化
    this.loadCart();
    const pending = uni.getStorageSync("pendingOrderType");
    if (pending === "delivery" || pending === "pickup") {
      this.handleOrderType(pending);
    }
  },
  onLoad() {
    this.loadCart();
    const pending = uni.getStorageSync("pendingOrderType");
    if (pending === "delivery" || pending === "pickup") {
      this.handleOrderType(pending);
      // 不在 onLoad 删除，等 goOrderPage 结算时再消费
    }
  },
  onShow() {
    this.loadCart();
  }
};
</script>

<style scoped>
/* ========================================
   状态栏
   ======================================== */
.status-bar {
  width: 100%;
  flex-shrink: 0;
}

/* ========================================
   页面布局
   ======================================== */
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f0eb;
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

/* 组件模式：高度由父容器决定 */
.page.page-tab {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* ========================================
   店铺头部
   ======================================== */
.store-head {
  padding: 28rpx 28rpx 6rpx;
  position: relative;
}

.store-brand-line {
  width: 40rpx;
  height: 4rpx;
  background: #b8272b;
  border-radius: 2rpx;
  margin-bottom: 16rpx;
}

.store-name {
  display: block;
  font-size: 40rpx;
  font-weight: 800;
  color: #1a1a1a;
  letter-spacing: 4rpx;
}

.store-tip {
  display: block;
  margin-top: 8rpx;
  color: #8c8c8c;
  font-size: 24rpx;
  letter-spacing: 2rpx;
  font-weight: 400;
}

/* ========================================
   自取/外卖切换
   ======================================== */
.type-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20rpx 28rpx 0;
  background: #f0e8e0;
  border-radius: 48rpx;
  padding: 6rpx;
  gap: 0;
}

.type-toggle-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 64rpx;
  border-radius: 42rpx;
  transition: all 0.25s ease;
  background: transparent;
}

.type-toggle-item.active {
  background: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.type-toggle-icon {
  width: 28rpx;
  height: 28rpx;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  flex-shrink: 0;
  opacity: 0.4;
  transition: opacity 0.25s ease;
}

.type-toggle-item.active .type-toggle-icon {
  opacity: 1;
}

.type-icon-store {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23b8272b'%3E%3Cpath d='M18 6V4l-6-2-6 2v2H2v2h2v10H2v2h20v-2h-2V8h2V6h-4zM6 6V4.6l6-1.8 6 1.8V6H6zm2 4h2v6H8v-6zm6 0h2v6h-2v-6z'/%3E%3C/svg%3E");
}

.type-icon-delivery {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23c9a96e'%3E%3Cpath d='M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4V4h16v16zM18 6h-5v7l4-2.5 4 2.5V6zm-9 4H6v2h3v-2zm0 4H6v2h3v-2zm-3-4h3V8H6v2z'/%3E%3C/svg%3E");
}

.type-toggle-label {
  font-size: 26rpx;
  font-weight: 500;
  color: #8c8c8c;
  transition: color 0.25s ease;
}

.type-toggle-item.active .type-toggle-label {
  color: #1a1a1a;
  font-weight: 600;
}

.type-toggle-divider {
  width: 2rpx;
  height: 32rpx;
  background: #d4c5b5;
  flex-shrink: 0;
}

/* ========================================
   分类切换
   ======================================== */
.tabs {
  display: flex;
  margin: 16rpx 28rpx 0;
  background: transparent;
  border-bottom: 2rpx solid #ede5dc;
  position: relative;
  z-index: 10;
}

.tab {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  text-align: center;
  font-size: 28rpx;
  color: #8c8c8c;
  font-weight: 500;
  position: relative;
  transition: color 0.25s ease;
}

.tab.active {
  color: #b8272b;
  font-weight: 600;
}

.tab.active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background: #b8272b;
  border-radius: 2rpx 2rpx 0 0;
}

/* ========================================
   商品滚动区
   ======================================== */
.goods-scroll {
  flex: 1;
  margin-top: 12rpx;
  padding: 0 28rpx;
  box-sizing: border-box;
  overflow-y: scroll;
}

.goods-list {
  padding-bottom: 20rpx;
}

/* ========================================
   商品卡片
   ======================================== */
.goods-card {
  display: flex;
  background: #ffffff;
  border-radius: 18rpx;
  padding: 18rpx;
  margin-bottom: 14rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.goods-card:active {
  transform: scale(0.985);
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.02);
}

.goods-img-wrap {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  background: #f5eee8;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.goods-img {
  width: 100%;
  height: 100%;
}

.goods-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  padding: 2rpx 0;
}

.goods-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.3;
}

.goods-desc {
  font-size: 22rpx;
  color: #8c8c8c;
  margin-top: 6rpx;
  line-height: 1.3;
}

.goods-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
}

.goods-price {
  font-size: 30rpx;
  font-weight: 700;
  color: #b8272b;
}

/* ========================================
   步进器（+/−）
   ======================================== */
.stepper {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.stepper-btn {
  width: 48rpx;
  height: 48rpx;
  line-height: 48rpx;
  text-align: center;
  border-radius: 50%;
  background: #f5f0eb;
  color: #5a4a3a;
  font-size: 30rpx;
  font-weight: 500;
  transition: all 0.15s ease;
}
.stepper-btn:active {
  transform: scale(0.88);
}
.stepper-btn.disabled {
  opacity: 0.3;
  pointer-events: none;
}

.stepper-add {
  background: #b8272b;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 2rpx 8rpx rgba(184, 39, 43, 0.2);
}

.stepper-val {
  min-width: 36rpx;
  text-align: center;
  font-size: 26rpx;
  font-weight: 600;
  color: #1a1a1a;
}

/* ========================================
   购物车底栏
   ======================================== */
.cart-bar {
  position: fixed;
  left: 28rpx;
  right: 28rpx;
  bottom: calc(100rpx + constant(safe-area-inset-bottom) + 16rpx);
  bottom: calc(100rpx + env(safe-area-inset-bottom) + 16rpx);
  background: #1a1a1a;
  border-radius: 24rpx;
  padding: 14rpx 14rpx 14rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 99;
  box-sizing: border-box;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
  animation: cartSlideUp 0.3s ease;
}

@keyframes cartSlideUp {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cart-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.cart-icon-wrap {
  position: relative;
  width: 56rpx;
  height: 56rpx;
}

.cart-icon {
  width: 56rpx;
  height: 56rpx;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59L5.25 14H19v-2H7.42l.94-2H17l3-6H5.21L4.27 2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.cart-badge {
  position: absolute;
  top: -6rpx;
  right: -6rpx;
  min-width: 28rpx;
  height: 28rpx;
  line-height: 28rpx;
  text-align: center;
  background: #b8272b;
  color: #fff;
  font-size: 18rpx;
  font-weight: 700;
  border-radius: 14rpx;
  padding: 0 6rpx;
}

.cart-info {
  display: flex;
  flex-direction: column;
}

.cart-total {
  font-size: 36rpx;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.2;
}

.cart-label {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.45);
}

.cart-action {
  background: #b8272b;
  color: #ffffff;
  border-radius: 40rpx;
  padding: 16rpx 40rpx;
  font-size: 28rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  transition: opacity 0.2s ease;
  box-shadow: 0 4rpx 12rpx rgba(184, 39, 43, 0.3);
}
.cart-action:active {
  opacity: 0.85;
}

/* ========================================
   购物车弹窗
   ======================================== */
.modal-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.cart-detail {
  width: 100%;
  background: #ffffff;
  border-top-left-radius: 28rpx;
  border-top-right-radius: 28rpx;
  padding: 28rpx 28rpx;
  padding-bottom: calc(40rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  max-height: 70vh;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cart-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f0e8e0;
}

.cart-detail-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 1rpx;
}

.cart-detail-close {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: #f5f0eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  width: 22rpx;
  height: 22rpx;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238c8c8c'%3E%3Cpath d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.cart-detail-list {
  margin-top: 12rpx;
  max-height: 50vh;
}

.cart-empty {
  text-align: center;
  padding: 60rpx 0;
  color: #8c8c8c;
  font-size: 26rpx;
}

.cart-detail-item {
  display: flex;
  align-items: center;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #f5f0eb;
}
.cart-detail-item:last-child {
  border-bottom: none;
}

.cart-detail-img-wrap {
  width: 90rpx;
  height: 90rpx;
  border-radius: 14rpx;
  background: #f5eee8;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-detail-img {
  width: 100%;
  height: 100%;
}

.cart-detail-body {
  flex: 1;
}

.cart-detail-name {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 6rpx;
}

.cart-detail-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cart-detail-price {
  font-size: 24rpx;
  font-weight: 700;
  color: #b8272b;
}

.cart-detail-qty {
  font-size: 22rpx;
  color: #8c8c8c;
}

.cart-panel-title {
  text-align: center;
  font-size: 30rpx;
  font-weight: 700;
  color: #2a2118;
  margin-bottom: 14rpx;
}

.cart-list {
  max-height: 560rpx;
}

.empty-cart {
  text-align: center;
  color: #8b7b6c;
  padding: 28rpx 0;
}

.cart-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12rpx;
  padding: 12rpx;
  margin-bottom: 12rpx;
}

.cart-item-img-wrap {
  width: 96rpx;
  height: 96rpx;
  margin-right: 14rpx;
  border-radius: 8rpx;
  background: #f3ece8;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cart-item-img {
  width: 100%;
  height: 100%;
}

.cart-item-name {
  display: block;
  font-size: 26rpx;
  color: #2a2118;
}

.cart-item-meta {
  display: block;
  margin-top: 6rpx;
  color: #8b5a3c;
  font-size: 24rpx;
}

</style>
