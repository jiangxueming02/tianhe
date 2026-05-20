<template>
  <view class="page" :class="{ 'page-tab': tabMode }">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    <!-- 标题区 -->
    <view class="page-head">
      <view class="page-head-line"></view>
      <text class="page-title">我的订单</text>
      <text class="page-sub">最近30天 · {{ orderList.length }}笔订单</text>
    </view>

    <!-- 订单列表 -->
    <scroll-view class="order-scroll" scroll-y>
      <view class="order-list-inner">
        <view class="order-card" v-for="(order, idx) in orderList" :key="idx">
        <!-- 头部：类型 + 时间 + 状态 -->
        <view class="order-head">
          <view class="order-type">
            <view class="order-type-dot" :class="order.type === 'pickup' ? 'dot-store' : 'dot-delivery'"></view>
            <view>
              <text class="order-type-label">{{ order.typeLabel }}</text>
              <text class="order-time" v-if="order.createdAt">{{ formatDate(order.createdAt) }}</text>
            </view>
          </view>
          <view class="order-head-right">
            <text class="order-status">{{ order.status }}</text>
            <view class="order-arrow"></view>
          </view>
        </view>

        <!-- 商品缩略图（点击查看详情） -->
        <view class="order-goods" @tap="goDetail(order)">
          <image
            v-for="(img, i) in order.images"
            :key="i"
            class="order-goods-img"
            :src="img"
            mode="aspectFit"
          />
          <view class="order-goods-more" v-if="order.moreCount">
            <text>+{{ order.moreCount }}</text>
          </view>
        </view>

        <!-- 金额 -->
        <view class="order-meta">
          <text class="order-count">共{{ order.itemCount }}件商品</text>
          <text class="order-total">
            实付 <text class="order-price">￥{{ order.total }}</text>
          </text>
        </view>

        <!-- 操作按钮 -->
        <view class="order-actions">
          <text class="order-btn order-btn-outline">再来一单</text>
          <text class="order-btn order-btn-primary" @tap="openReview(order)">去评价</text>
        </view>
      </view>
    </view>
    </scroll-view>

    <text-tab-bar v-if="!tabMode" current="order" />

    <!-- 评价弹窗 -->
    <view v-if="showReview" class="rev-mask" @tap="closeReview">
      <view class="rev-box" @tap.stop>
        <view class="rev-header">
          <view class="rev-handle"></view>
          <view class="rev-close" @tap="closeReview">
            <view class="rev-close-icon"></view>
          </view>
        </view>
        <scroll-view class="rev-body" scroll-y>
          <view class="rev-title">评价</view>
          <!-- 星级评分 -->
          <view class="rev-stars">
            <view
              class="rev-star"
              v-for="i in 5"
              :key="i"
              :class="{ filled: i <= reviewRating }"
              @tap="reviewRating = i"
            ></view>
          </view>
          <view class="rev-order-info" v-if="reviewOrder">
            <text class="rev-order-type">{{ reviewOrder.typeLabel }}</text>
            <text class="rev-order-time">{{ formatDate(reviewOrder.createdAt) }}</text>
          </view>
          <textarea
            class="rev-input"
            v-model="reviewText"
            placeholder="分享您的用餐体验..."
            maxlength="200"
            auto-height
          />
          <view class="rev-count">{{ reviewText.length }}/200</view>
          <view class="rev-btn" @tap="submitReview">提交评价</view>
          <view class="rev-safe"></view>
        </scroll-view>
      </view>
    </view>

    <!-- 订单详情弹窗 -->
    <view v-if="showDetail" class="modal-mask" @tap="closeDetail">
      <view class="modal-box" @tap.stop>
        <!-- 弹窗头部 -->
        <view class="modal-header">
          <view class="modal-handle"></view>
          <view class="modal-close" @tap="closeDetail">
            <view class="modal-close-icon"></view>
          </view>
        </view>

        <!-- 弹窗内容 -->
        <scroll-view class="modal-body" scroll-y :show-scrollbar="false" v-if="detailOrder">
          <!-- 状态 -->
          <view class="modal-status">
            <view class="modal-status-icon" :class="detailOrder.type === 'pickup' ? 'icon-store' : 'icon-delivery'"></view>
            <view class="modal-status-info">
              <text class="modal-status-text">{{ detailOrder.status }}</text>
              <text class="modal-status-sub">{{ detailOrder.typeLabel }} · {{ formatDate(detailOrder.createdAt) }}</text>
            </view>
            <text class="modal-status-badge" :class="detailOrder.type === 'pickup' ? 'badge-store' : 'badge-delivery'">{{ detailOrder.typeLabel }}</text>
          </view>

          <!-- 商品列表 -->
          <view class="modal-section">
            <view class="modal-section-title">商品信息</view>
            <view class="modal-item" v-for="(item, idx) in detailItems" :key="idx">
              <view class="modal-item-img-wrap">
                <image class="modal-item-img" :src="item.image" mode="aspectFit" />
              </view>
              <view class="modal-item-body">
                <text class="modal-item-name">{{ item.name }}</text>
                <view class="modal-item-bottom">
                  <text class="modal-item-qty">x{{ item.count }}</text>
                  <text class="modal-item-price">￥{{ item.subtotal }}</text>
                </view>
              </view>
            </view>
            <view class="modal-summary">
              <text class="modal-summary-label">合计</text>
              <text class="modal-summary-value">￥{{ detailOrder.total }}</text>
            </view>
          </view>

          <!-- 订单信息 -->
          <view class="modal-section">
            <view class="modal-section-title">订单信息</view>
            <view class="modal-info-row">
              <text class="modal-info-label">订单编号</text>
              <text class="modal-info-value">{{ detailOrder.id }}</text>
            </view>
            <view class="modal-info-row">
              <text class="modal-info-label">下单时间</text>
              <text class="modal-info-value">{{ formatDateTime(detailOrder.createdAt) }}</text>
            </view>
            <view class="modal-info-row">
              <text class="modal-info-label">订单类型</text>
              <text class="modal-info-value">{{ detailOrder.typeLabel }}</text>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="modal-actions">
            <text class="modal-btn modal-btn-outline">再来一单</text>
            <text class="modal-btn modal-btn-primary" @tap="openReview(detailOrder)">去评价</text>
          </view>

          <view class="modal-safe"></view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
const demoOrders = [
  {
    id: 'demo-1',
    type: 'pickup',
    typeLabel: '门店自取',
    status: '已完成',
    images: ['/static/product-1.png', '/static/product-2.png'],
    moreCount: 0,
    itemCount: 2,
    total: 34,
    createdAt: Date.now() - 86400000 * 2,
    items: [
      { id: 'tea3', name: '白茶', count: 1, image: '/static/product-1.png', subtotal: '15.00', price: '￥15' },
      { id: 'zb1', name: '餐具', count: 1, image: '/static/product-2.png', subtotal: '19.00', price: '￥19' }
    ]
  },
  {
    id: 'demo-2',
    type: 'delivery',
    typeLabel: '外卖配送',
    status: '已完成',
    images: ['/static/product-3.png', '/static/product-4.png'],
    moreCount: 0,
    itemCount: 2,
    total: 31,
    createdAt: Date.now() - 86400000 * 5,
    items: [
      { id: 'tea1', name: '绿茶', count: 1, image: '/static/product-3.png', subtotal: '18.00', price: '￥18' },
      { id: 'tea2', name: '乌龙茶', count: 1, image: '/static/product-4.png', subtotal: '13.00', price: '￥13' }
    ]
  }
];

export default {
  props: {
    tabMode: { type: Boolean, default: false },
    visible: { type: Boolean, default: true }
  },
  watch: {
    visible(val) {
      if (val) this.loadOrders();
    }
  },
  data() {
    return {
      statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
      orderList: [],
      showDetail: false,
      detailOrder: null,
      showReview: false,
      reviewOrder: null,
      reviewRating: 5,
      reviewText: ""
    };
  },
  computed: {
    detailItems() {
      const order = this.detailOrder;
      if (!order) return [];
      if (order.items && order.items.length > 0) {
        return order.items;
      }
      // 如果没有 items 数据，从 images 构建
      if (order.images) {
        return order.images.map((img, i) => ({
          image: img,
          name: '商品',
          count: 1,
          subtotal: (order.total / order.images.length).toFixed(2)
        }));
      }
      return [];
    }
  },
  methods: {
    loadOrders() {
      let saved = [];
      try {
        saved = uni.getStorageSync("orderList");
      } catch (e) { /* ignore */ }
      if (!saved || !Array.isArray(saved)) {
        saved = [];
      }
      const demoIds = demoOrders.map(o => o.id);
      for (const demo of demoOrders) {
        if (!saved.some(o => o.id === demo.id)) {
          saved.unshift(demo);
        }
      }
      uni.setStorageSync("orderList", saved);
      this.orderList = saved;
    },
    formatDate(ts) {
      const d = new Date(ts);
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const hour = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return month + '/' + day + ' ' + hour + ':' + min;
    },
    formatDateTime(ts) {
      const d = new Date(ts);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hour = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      const sec = String(d.getSeconds()).padStart(2, '0');
      return year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;
    },
    goDetail(order) {
      this.detailOrder = order;
      this.showDetail = true;
    },
    closeDetail() {
      this.showDetail = false;
      this.detailOrder = null;
    },
    openReview(order) {
      this.reviewOrder = order;
      this.reviewRating = 5;
      this.reviewText = "";
      this.showReview = true;
    },
    closeReview() {
      this.showReview = false;
      this.reviewOrder = null;
    },
    submitReview() {
      if (!this.reviewText.trim()) {
        uni.showToast({
          title: "请输入评价内容",
          icon: "none"
        });
        return;
      }
      this.reviewText = "";
      this.reviewRating = 5;
      this.showReview = false;
      this.reviewOrder = null;
      uni.showToast({
        title: "评价成功",
        icon: "success"
      });
    }
  },
  mounted() {
    this.loadOrders();
  },
  onLoad() {
    this.loadOrders();
  },
  onShow() {
    this.loadOrders();
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
  background: #f5f0eb;
  padding: 0;
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 组件模式：高度由父容器决定 */
.page.page-tab {
  height: 100%;
}

/* ========================================
   页面标题
   ======================================== */
.page-head {
  padding: 28rpx 28rpx 6rpx;
  flex-shrink: 0;
}

.page-head-line {
  width: 40rpx;
  height: 4rpx;
  background: #b8272b;
  border-radius: 2rpx;
  margin-bottom: 16rpx;
}

.page-title {
  display: block;
  font-size: 40rpx;
  font-weight: 800;
  color: #1a1a1a;
  letter-spacing: 4rpx;
}

.page-sub {
  display: block;
  margin-top: 8rpx;
  color: #8c8c8c;
  font-size: 24rpx;
  letter-spacing: 1rpx;
}

/* ========================================
   订单滚动区
   ======================================== */
.order-scroll {
  flex: 1;
  height: 0;
  min-height: 0;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
}

.order-list-inner {
  padding: 12rpx 28rpx 20rpx;
  box-sizing: border-box;
}

/* ========================================
   订单卡片
   ======================================== */
.order-card {
  background: #ffffff;
  border-radius: 20rpx;
  margin-bottom: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
  transition: transform 0.2s ease;
  box-sizing: border-box;
}
.order-card:active {
  transform: scale(0.99);
}

/* ----- 头部 ----- */
.order-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid #f5f0eb;
}

.order-type {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.order-type-label {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.order-time {
  display: block;
  font-size: 20rpx;
  color: #8c8c8c;
  margin-top: 4rpx;
}

.order-type-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-store {
  background: #b8272b;
}
.dot-delivery {
  background: #c9a96e;
}

.order-status {
  font-size: 24rpx;
  font-weight: 500;
  color: #b8272b;
  background: #fff0f0;
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
}

.order-head-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.order-arrow {
  width: 28rpx;
  height: 28rpx;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23bfbfbf'%3E%3Cpath d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.5;
}

/* ----- 商品缩略图 ----- */
.order-goods {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.order-goods-img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 14rpx;
  background: #f5eee8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.order-goods-more {
  width: 140rpx;
  height: 140rpx;
  border-radius: 14rpx;
  background: #f5f0eb;
  display: flex;
  align-items: center;
  justify-content: center;
}
.order-goods-more text {
  font-size: 24rpx;
  color: #8c8c8c;
  font-weight: 500;
}

/* ----- 金额 ----- */
.order-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18rpx;
}

.order-count {
  font-size: 24rpx;
  color: #8c8c8c;
}

.order-total {
  font-size: 24rpx;
  color: #8c8c8c;
}

.order-price {
  font-size: 30rpx;
  font-weight: 800;
  color: #b8272b;
}

/* ----- 操作按钮 ----- */
.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 14rpx;
  padding-top: 16rpx;
  border-top: 2rpx solid #f5f0eb;
}

.order-btn {
  font-size: 24rpx;
  font-weight: 600;
  padding: 14rpx 32rpx;
  border-radius: 28rpx;
  transition: all 0.2s ease;
}

.order-btn-outline {
  background: transparent;
  color: #5a4a3a;
  border: 2rpx solid #d4c5b5;
}
.order-btn-outline:active {
  background: #f5f0eb;
}

.order-btn-primary {
  background: #b8272b;
  color: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(184, 39, 43, 0.2);
}
.order-btn-primary:active {
  opacity: 0.9;
  transform: scale(0.97);
}

/* ========================================
   订单详情弹窗
   ======================================== */
.modal-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  animation: modalFadeIn 0.2s ease;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-box {
  width: 100%;
  background: #ffffff;
  border-top-left-radius: 28rpx;
  border-top-right-radius: 28rpx;
  max-height: 80vh;
  overflow: hidden;
  box-sizing: border-box;
  animation: modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 28rpx 0;
  position: relative;
  flex-shrink: 0;
}

.modal-handle {
  width: 48rpx;
  height: 6rpx;
  background: #e0d8d0;
  border-radius: 3rpx;
}

.modal-close {
  position: absolute;
  right: 20rpx;
  top: 12rpx;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #f5f0eb;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.modal-close-icon {
  width: 24rpx;
  height: 24rpx;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238c8c8c'%3E%3Cpath d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.modal-body {
  max-height: 68vh;
  padding: 12rpx 28rpx 0;
  overflow-y: scroll;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
  width: 100%;
}

/* ----- 状态区 ----- */
.modal-status {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 0 20rpx;
  border-bottom: 2rpx solid #f5f0eb;
}

.modal-status-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background-size: 24rpx;
  background-repeat: no-repeat;
  background-position: center;
}
.modal-status-icon.icon-store {
  background-color: #fff0f0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23b8272b'%3E%3Cpath d='M18 6V4l-6-2-6 2v2H2v2h2v10H2v2h20v-2h-2V8h2V6h-4zM6 6V4.6l6-1.8 6 1.8V6H6zm2 4h2v6H8v-6zm6 0h2v6h-2v-6z'/%3E%3C/svg%3E");
}
.modal-status-icon.icon-delivery {
  background-color: #f5f0eb;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23c9a96e'%3E%3Cpath d='M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4V4h16v16zM18 6h-5v7l4-2.5 4 2.5V6zm-9 4H6v2h3v-2zm0 4H6v2h3v-2zm-3-4h3V8H6v2z'/%3E%3C/svg%3E");
}

.modal-status-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.modal-status-text {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.modal-status-sub {
  display: block;
  font-size: 22rpx;
  color: #8c8c8c;
  margin-top: 4rpx;
}

.modal-status-badge {
  font-size: 20rpx;
  font-weight: 600;
  padding: 6rpx 18rpx;
  border-radius: 18rpx;
  flex-shrink: 0;
}
.modal-status-badge.badge-store {
  background: #fff0f0;
  color: #b8272b;
}
.modal-status-badge.badge-delivery {
  background: #f5f0eb;
  color: #c9a96e;
}

/* ----- 分区标题 ----- */
.modal-section {
  padding: 20rpx 0;
  border-bottom: 2rpx solid #f5f0eb;
  overflow: hidden;
}
.modal-section:last-of-type {
  border-bottom: none;
}

.modal-section-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 14rpx;
  letter-spacing: 1rpx;
}

/* ----- 商品项 ----- */
.modal-item {
  display: flex;
  align-items: center;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f8f4f0;
}
.modal-item:last-child {
  border-bottom: none;
}

.modal-item-img-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  background: #f5eee8;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.modal-item-img {
  width: 100%;
  height: 100%;
}

.modal-item-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  overflow: hidden;
}

.modal-item-name {
  font-size: 24rpx;
  font-weight: 600;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0;
}

.modal-item-qty {
  font-size: 20rpx;
  color: #8c8c8c;
}

.modal-item-price {
  font-size: 24rpx;
  font-weight: 700;
  color: #b8272b;
}

/* ----- 合计 ----- */
.modal-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0 4rpx;
  border-top: 2rpx solid #f5f0eb;
  margin-top: 4rpx;
  min-width: 0;
}

.modal-summary-label {
  font-size: 24rpx;
  color: #8c8c8c;
}

.modal-summary-value {
  font-size: 34rpx;
  font-weight: 800;
  color: #b8272b;
}

/* ----- 订单信息 ----- */
.modal-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #f8f4f0;
  min-width: 0;
}
.modal-info-row:last-child {
  border-bottom: none;
}

.modal-info-label {
  font-size: 22rpx;
  color: #8c8c8c;
  flex-shrink: 0;
}

.modal-info-value {
  font-size: 22rpx;
  color: #1a1a1a;
  text-align: right;
  max-width: 55%;
  word-break: break-all;
  overflow: hidden;
}

/* ----- 操作按钮 ----- */
.modal-actions {
  display: flex;
  gap: 14rpx;
  justify-content: flex-end;
  padding: 20rpx 0;
  flex-wrap: wrap;
}

.modal-btn {
  font-size: 24rpx;
  font-weight: 600;
  padding: 14rpx 34rpx;
  border-radius: 28rpx;
  transition: all 0.2s ease;
}

.modal-btn-outline {
  background: transparent;
  color: #5a4a3a;
  border: 2rpx solid #d4c5b5;
}
.modal-btn-outline:active {
  background: #f5f0eb;
}

.modal-btn-primary {
  background: #b8272b;
  color: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(184, 39, 43, 0.2);
}
.modal-btn-primary:active {
  opacity: 0.9;
  transform: scale(0.97);
}

.modal-safe {
  height: calc(30rpx + constant(safe-area-inset-bottom));
  height: calc(30rpx + env(safe-area-inset-bottom));
}

/* ========================================
   评价弹窗
   ======================================== */
.rev-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 300;
  display: flex;
  align-items: flex-end;
  animation: revFadeIn 0.2s ease;
}

@keyframes revFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.rev-box {
  width: 100%;
  background: #ffffff;
  border-top-left-radius: 28rpx;
  border-top-right-radius: 28rpx;
  max-height: 75vh;
  overflow: hidden;
  box-sizing: border-box;
  animation: revSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes revSlideUp {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rev-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 28rpx 0;
  position: relative;
  flex-shrink: 0;
}

.rev-handle {
  width: 48rpx;
  height: 6rpx;
  background: #e0d8d0;
  border-radius: 3rpx;
}

.rev-close {
  position: absolute;
  right: 20rpx;
  top: 12rpx;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #f5f0eb;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.rev-close-icon {
  width: 24rpx;
  height: 24rpx;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238c8c8c'%3E%3Cpath d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.rev-body {
  max-height: 62vh;
  padding: 12rpx 32rpx 0;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
  width: 100%;
  overflow-x: hidden;
}

.rev-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 2rpx;
  margin-bottom: 20rpx;
}

/* ----- 星级评分 ----- */
.rev-stars {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.rev-star {
  width: 56rpx;
  height: 56rpx;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e0d8d0'%3E%3Cpath d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  transition: transform 0.2s ease;
}
.rev-star:active {
  transform: scale(0.85);
}
.rev-star.filled {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23b8272b'%3E%3Cpath d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'/%3E%3C/svg%3E");
}

/* ----- 订单信息 ----- */
.rev-order-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.rev-order-type {
  font-size: 24rpx;
  color: #8c8c8c;
}

.rev-order-time {
  font-size: 24rpx;
  color: #8c8c8c;
}

/* ----- 评价输入框 ----- */
.rev-input {
  width: 100%;
  min-height: 140rpx;
  padding: 20rpx 24rpx;
  background: #f8f4f0;
  border-radius: 16rpx;
  font-size: 26rpx;
  color: #1a1a1a;
  line-height: 1.6;
  border: none;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
}
.rev-input::placeholder {
  color: #bfbfbf;
}

.rev-count {
  text-align: right;
  font-size: 22rpx;
  color: #bfbfbf;
  margin-top: 8rpx;
  padding-right: 4rpx;
}

/* ----- 提交按钮 ----- */
.rev-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background: #b8272b;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
  border-radius: 40rpx;
  letter-spacing: 2rpx;
  margin-top: 20rpx;
  transition: opacity 0.2s ease;
  box-shadow: 0 4rpx 16rpx rgba(184, 39, 43, 0.2);
}
.rev-btn:active {
  opacity: 0.85;
}

.rev-safe {
  height: calc(30rpx + constant(safe-area-inset-bottom));
  height: calc(30rpx + env(safe-area-inset-bottom));
}
</style>
