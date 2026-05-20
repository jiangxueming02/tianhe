<template>
  <view class="page">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 自定义导航 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <view class="nav-back-icon"></view>
      </view>
      <text class="nav-title">订单详情</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 内容区 -->
    <scroll-view class="detail-scroll" scroll-y v-if="order">
      <!-- 订单状态卡片 -->
      <view class="status-card">
        <view class="status-icon" :class="order.type === 'pickup' ? 'icon-store' : 'icon-delivery'"></view>
        <view class="status-info">
          <text class="status-main">{{ order.status }}</text>
          <text class="status-sub">{{ order.typeLabel }} · {{ formatDate(order.createdAt) }}</text>
        </view>
        <view class="status-badge" :class="order.type === 'pickup' ? 'badge-store' : 'badge-delivery'">
          {{ order.typeLabel }}
        </view>
      </view>

      <!-- 商品列表 -->
      <view class="section">
        <view class="section-title">
          <view class="section-line"></view>
          <text>商品信息</text>
        </view>
        <view class="item-list">
          <view class="item-card" v-for="(item, idx) in orderItems" :key="idx">
            <view class="item-img-wrap">
              <image class="item-img" :src="item.image" mode="aspectFit" />
            </view>
            <view class="item-body">
              <text class="item-name">{{ item.name }}</text>
              <view class="item-bottom">
                <text class="item-qty">x{{ item.count }}</text>
                <text class="item-price">￥{{ item.subtotal }}</text>
              </view>
            </view>
          </view>
        </view>
        <!-- 小计 -->
        <view class="summary-row">
          <text class="summary-label">商品小计</text>
          <text class="summary-value">￥{{ order.total }}</text>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="section">
        <view class="section-title">
          <view class="section-line"></view>
          <text>订单信息</text>
        </view>
        <view class="info-list">
          <view class="info-row">
            <text class="info-label">订单编号</text>
            <text class="info-value selectable">{{ order.id }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">下单时间</text>
            <text class="info-value">{{ formatDateTime(order.createdAt) }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">订单类型</text>
            <text class="info-value">{{ order.typeLabel }}</text>
          </view>
          <view class="info-row" v-if="order.type === 'pickup'">
            <text class="info-label">取餐方式</text>
            <text class="info-value">门店自取</text>
          </view>
          <view class="info-row" v-if="order.type === 'delivery'">
            <text class="info-label">配送方式</text>
            <text class="info-value">外卖配送</text>
          </view>
        </view>
      </view>

      <!-- 底部操作 -->
      <view class="bottom-actions">
        <text class="bottom-btn bottom-btn-outline">再来一单</text>
        <text class="bottom-btn bottom-btn-primary">去评价</text>
      </view>

      <!-- 底部安全区 -->
      <view class="bottom-safe"></view>
    </scroll-view>

    <!-- 空状态 -->
    <view v-if="!order" class="empty-state">
      <text>订单数据加载失败</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
      order: null,
      orderItems: []
    };
  },
  onLoad() {
    this.loadOrderDetail();
  },
  onShow() {
    // 如果 onLoad 已经加载了，不需要重复加载
    if (!this.order) {
      this.loadOrderDetail();
    }
  },
  methods: {
    loadOrderDetail() {
      try {
        const orderJson = uni.getStorageSync("currentOrderDetail");
        if (orderJson) {
          const parsed = typeof orderJson === 'string' ? JSON.parse(orderJson) : orderJson;
          this.order = parsed;
          // 构建商品列表
          if (parsed.items && parsed.items.length > 0) {
            this.orderItems = parsed.items;
          } else if (parsed.images) {
            // 如果没有 items 数据，从 images 构建
            this.orderItems = parsed.images.map((img, i) => ({
              image: img,
              name: '商品',
              count: 1,
              subtotal: (parsed.total / parsed.images.length).toFixed(2)
            }));
          }
        }
      } catch (e) {
        console.error('加载订单详情失败', e);
      }
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
    goBack() {
      uni.navigateBack();
    }
  }
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f0eb;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* ========================================
   状态栏 & 导航
   ======================================== */
.status-bar {
  width: 100%;
  flex-shrink: 0;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 28rpx;
  flex-shrink: 0;
}

.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.03);
  transition: background 0.2s ease;
}
.nav-back:active {
  background: rgba(0, 0, 0, 0.08);
}

.nav-back-icon {
  width: 32rpx;
  height: 32rpx;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%231a1a1a'%3E%3Cpath d='M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 2rpx;
}

.nav-placeholder {
  width: 60rpx;
}

/* ========================================
   滚动区
   ======================================== */
.detail-scroll {
  flex: 1;
  padding: 0 28rpx;
  overflow-y: scroll;
}

/* ========================================
   状态卡片
   ======================================== */
.status-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  gap: 18rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
}

.status-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background-size: 28rpx;
  background-repeat: no-repeat;
  background-position: center;
}
.icon-store {
  background-color: #fff0f0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23b8272b'%3E%3Cpath d='M18 6V4l-6-2-6 2v2H2v2h2v10H2v2h20v-2h-2V8h2V6h-4zM6 6V4.6l6-1.8 6 1.8V6H6zm2 4h2v6H8v-6zm6 0h2v6h-2v-6z'/%3E%3C/svg%3E");
}
.icon-delivery {
  background-color: #f5f0eb;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23c9a96e'%3E%3Cpath d='M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4V4h16v16zM18 6h-5v7l4-2.5 4 2.5V6zm-9 4H6v2h3v-2zm0 4H6v2h3v-2zm-3-4h3V8H6v2z'/%3E%3C/svg%3E");
}

.status-info {
  flex: 1;
}

.status-main {
  display: block;
  font-size: 32rpx;
  font-weight: 800;
  color: #1a1a1a;
  letter-spacing: 2rpx;
}

.status-sub {
  display: block;
  font-size: 22rpx;
  color: #8c8c8c;
  margin-top: 4rpx;
  letter-spacing: 1rpx;
}

.status-badge {
  font-size: 22rpx;
  font-weight: 600;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
}
.badge-store {
  background: #fff0f0;
  color: #b8272b;
}
.badge-delivery {
  background: #f5f0eb;
  color: #c9a96e;
}

/* ========================================
   分区标题
   ======================================== */
.section {
  margin-bottom: 20rpx;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 2rpx;
}

.section-line {
  width: 6rpx;
  height: 28rpx;
  background: #b8272b;
  border-radius: 3rpx;
}

/* ========================================
   商品列表
   ======================================== */
.item-list {
  background: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
}

.item-card {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  border-bottom: 2rpx solid #f5f0eb;
}
.item-card:last-child {
  border-bottom: none;
}

.item-img-wrap {
  width: 100rpx;
  height: 100rpx;
  border-radius: 14rpx;
  background: #f5eee8;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-img {
  width: 100%;
  height: 100%;
}

.item-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.item-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-qty {
  font-size: 22rpx;
  color: #8c8c8c;
}

.item-price {
  font-size: 26rpx;
  font-weight: 700;
  color: #b8272b;
}

/* ========================================
   汇总行
   ======================================== */
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #ffffff;
  border-radius: 20rpx;
  margin-top: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
}

.summary-label {
  font-size: 26rpx;
  color: #8c8c8c;
}

.summary-value {
  font-size: 36rpx;
  font-weight: 800;
  color: #b8272b;
}

/* ========================================
   订单信息
   ======================================== */
.info-list {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 8rpx 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #f5f0eb;
}
.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 24rpx;
  color: #8c8c8c;
  flex-shrink: 0;
}

.info-value {
  font-size: 24rpx;
  color: #1a1a1a;
  text-align: right;
  max-width: 60%;
  word-break: break-all;
}

.info-value.selectable {
  font-size: 20rpx;
  color: #8c8c8c;
  user-select: text;
}

/* ========================================
   底部操作
   ======================================== */
.bottom-actions {
  display: flex;
  gap: 16rpx;
  justify-content: flex-end;
  margin-top: 28rpx;
}

.bottom-btn {
  font-size: 26rpx;
  font-weight: 600;
  padding: 16rpx 40rpx;
  border-radius: 32rpx;
  transition: all 0.2s ease;
}

.bottom-btn-outline {
  background: transparent;
  color: #5a4a3a;
  border: 2rpx solid #d4c5b5;
}
.bottom-btn-outline:active {
  background: #f5f0eb;
}

.bottom-btn-primary {
  background: #b8272b;
  color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(184, 39, 43, 0.2);
}
.bottom-btn-primary:active {
  opacity: 0.9;
  transform: scale(0.97);
}

/* ========================================
   底部安全区
   ======================================== */
.bottom-safe {
  height: calc(40rpx + constant(safe-area-inset-bottom));
  height: calc(40rpx + env(safe-area-inset-bottom));
}

/* ========================================
   空状态
   ======================================== */
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8c8c8c;
  font-size: 28rpx;
}
</style>
