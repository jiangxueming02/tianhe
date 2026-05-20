<template>
  <view class="page" :class="{ 'page-tab': tabMode }">
    <!-- 轮播区：全幅沉浸，霸王茶姬风格 -->
    <view class="hero">
      <swiper
        class="hero-swiper"
        indicator-dots
        autoplay
        interval="3000"
        circular
        indicator-color="rgba(255,255,255,0.35)"
        indicator-active-color="#b8272b"
      >
        <swiper-item v-for="(item, idx) in banners" :key="idx" class="hero-item">
          <image class="hero-img" :src="item" mode="aspectFit" />
        </swiper-item>
      </swiper>
      <!-- 渐变遮罩让图片边缘过渡更自然 -->
      <view class="hero-mask"></view>
      <!-- 品牌角标 -->
      <view class="hero-badge">
        <text class="hero-badge-text">品牌甄选</text>
      </view>
    </view>

    <!-- 内容卡片 -->
    <view class="content-sheet">
      <!-- 品牌标题：带东方装饰线 -->
      <view class="brand-head">
        <view class="brand-ornament"></view>
        <text class="brand-title-en">TIAN HE · WU XING</text>
        <text class="brand-title">天和五行</text>
        <text class="brand-sub">东方茶饮 · 匠心呈现</text>
      </view>

      <!-- 快捷入口：门店自取 / 外卖点单 -->
      <view class="entry-row">
        <view class="entry-card" @tap="goOrder('pickup')">
          <image class="entry-bg" src="/static/ip1.png" mode="aspectFill" />
          <view class="entry-overlay"></view>
          <view class="entry-content">
            <view class="entry-icon entry-icon-store"></view>
            <text class="entry-title">门店自取</text>
            <text class="entry-desc">到店即取</text>
          </view>
        </view>
        <view class="entry-card" @tap="goOrder('delivery')">
          <image class="entry-bg" src="/static/ip2.png" mode="aspectFill" />
          <view class="entry-overlay"></view>
          <view class="entry-content">
            <view class="entry-icon entry-icon-delivery"></view>
            <text class="entry-title">外卖点单</text>
            <text class="entry-desc">极速送达</text>
          </view>
        </view>
      </view>

      <!-- 人气推荐 -->
      <view class="section">
        <view class="section-header">
          <view class="section-line"></view>
          <text class="section-title">人气推荐</text>
          <view class="section-line"></view>
        </view>
        <scroll-view class="scroll-x" scroll-x shows-scrollbar="false">
          <view class="scroll-row">
            <view
              class="product-card"
              v-for="item in recommendList"
              :key="item.name"
            >
              <view class="product-img-wrap">
                <image class="product-img" :src="item.image" mode="aspectFit" />
              </view>
              <view class="product-info">
                <text class="product-name">{{ item.name }}</text>
                <view class="product-bottom">
                  <text class="product-price">{{ item.price }}</text>
                  <view class="product-cart-icon"></view>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 反馈入口 -->
      <view class="feedback-wrap" @tap="goFeedback">
        <view class="feedback-deco"></view>
        <view class="feedback-content">
          <text class="feedback-title">反馈建议</text>
          <text class="feedback-desc">您的意见是我们前进的动力</text>
        </view>
        <view class="feedback-arrow"></view>
      </view>
    </view>

    <!-- 反馈弹窗 -->
    <view v-if="showFeedbackModal" class="modal-mask" @tap="closeFeedbackModal" catchtouchmove>
      <view class="modal-box" @tap.stop>
        <view class="modal-close" @tap="closeFeedbackModal">
          <view class="modal-close-icon"></view>
        </view>
        <view class="modal-brand"></view>
        <text class="modal-title">反馈建议</text>
        <textarea
          class="modal-input"
          v-model="feedbackText"
          placeholder="请写下您宝贵的意见..."
          maxlength="200"
          auto-height
        />
        <view class="modal-count">{{ feedbackText.length }}/200</view>
        <view class="modal-btn" @tap="submitFeedback">提交反馈</view>
      </view>
    </view>

    <text-tab-bar v-if="!tabMode" current="home" />
  </view>
</template>

<script>
export default {
  props: {
    tabMode: { type: Boolean, default: false },
    visible: { type: Boolean, default: true }
  },
  data() {
    return {
      banners: ["/static/banner-1.png", "/static/banner-2.png"],
      recommendList: [
        { name: "茶杯", price: "￥18", image: "/static/product-1.png" },
        { name: "礼盒", price: "￥16", image: "/static/product-2.png" },
        { name: "香薰", price: "￥15", image: "/static/product-3.png" }
      ],
      showFeedbackModal: false,
      feedbackText: ""
    };
  },
  methods: {
    goOrder(type) {
      if (this.tabMode) {
        uni.setStorageSync("pendingOrderType", type);
        this.$emit("switchTab", "index");
        return;
      }
      uni.setStorageSync("pendingOrderType", type);
      uni.reLaunch({
        url: "/pages/index/index"
      });
    },
    goFeedback() {
      this.showFeedbackModal = true;
    },
    closeFeedbackModal() {
      this.showFeedbackModal = false;
    },
    submitFeedback() {
      this.feedbackText = "";
      this.showFeedbackModal = false;
      uni.showToast({
        title: "提交成功",
        icon: "success"
      });
    }
  }
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f0eb;
  padding: 0;
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

/* 组件模式：高度由父容器决定 */
.page.page-tab {
  min-height: auto;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* ========================================
   轮播区
   ======================================== */
.hero {
  position: relative;
  width: 100%;
  height: 54vh;
  min-height: 440rpx;
  max-height: 780rpx;
  background: #f0e8e0;
  overflow: hidden;
}
.hero::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 160rpx;
  background: linear-gradient(to top, #f5f0eb 10%, transparent);
  z-index: 2;
  pointer-events: none;
}

.hero-swiper {
  width: 100%;
  height: 100%;
}

.hero-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-img {
  width: 100%;
  height: 100%;
}

.hero-mask {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1;
  background: rgba(0, 0, 0, 0.08);
  pointer-events: none;
}

.hero-badge {
  position: absolute;
  left: 28rpx;
  top: 80rpx;
  z-index: 5;
  background: rgba(184, 39, 43, 0.9);
  backdrop-filter: blur(8rpx);
  -webkit-backdrop-filter: blur(8rpx);
  padding: 8rpx 22rpx;
  border-radius: 20rpx;
}
.hero-badge-text {
  color: #fff;
  font-size: 22rpx;
  font-weight: 500;
  letter-spacing: 2rpx;
}

/* ========================================
   内容卡片
   ======================================== */
.content-sheet {
  position: relative;
  z-index: 3;
  margin: -56rpx 20rpx 0;
  padding: 44rpx 28rpx 16rpx;
  background: #ffffff;
  border-radius: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
}

/* ----- 品牌标题 ----- */
.brand-head {
  text-align: center;
  margin-bottom: 32rpx;
  padding-bottom: 0;
}

.brand-ornament {
  width: 48rpx;
  height: 4rpx;
  background: #b8272b;
  margin: 0 auto 20rpx;
  border-radius: 2rpx;
}

.brand-title-en {
  display: block;
  font-size: 18rpx;
  font-weight: 300;
  color: #bfbfbf;
  letter-spacing: 4rpx;
  text-transform: uppercase;
  margin-bottom: 10rpx;
}

.brand-title {
  display: block;
  font-size: 44rpx;
  font-weight: 800;
  color: #1a1a1a;
  letter-spacing: 6rpx;
  margin-bottom: 10rpx;
}

.brand-sub {
  display: block;
  font-size: 22rpx;
  color: #8c8c8c;
  letter-spacing: 3rpx;
  font-weight: 400;
}

/* ----- 快捷入口 ----- */
.entry-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 36rpx;
}

.entry-card {
  flex: 1;
  height: 260rpx;
  border-radius: 20rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.entry-card:active {
  transform: scale(0.97);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.02);
}

.entry-bg {
  width: 100%;
  height: 100%;
  transition: transform 0.4s ease;
}
.entry-card:active .entry-bg {
  transform: scale(1.06);
}

.entry-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%);
}

.entry-content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 22rpx;
  z-index: 2;
}

.entry-icon {
  width: 40rpx;
  height: 40rpx;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin-bottom: 8rpx;
}
.entry-icon-store {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M18 6V4l-6-2-6 2v2H2v2h2v10H2v2h20v-2h-2V8h2V6h-4zM6 6V4.6l6-1.8 6 1.8V6H6zm2 4h2v6H8v-6zm6 0h2v6h-2v-6z'/%3E%3C/svg%3E");
}
.entry-icon-delivery {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4V4h16v16zM18 6h-5v7l4-2.5 4 2.5V6zm-9 4H6v2h3v-2zm0 4H6v2h3v-2zm-3-4h3V8H6v2z'/%3E%3C/svg%3E");
}

.entry-title {
  display: block;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
  text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.2);
}

.entry-desc {
  display: block;
  margin-top: 4rpx;
  color: rgba(255,255,255,0.75);
  font-size: 22rpx;
  letter-spacing: 1rpx;
}

/* ----- 分区标题（带装饰线） ----- */
.section {
  margin-bottom: 28rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.section-line {
  width: 32rpx;
  height: 2rpx;
  background: #d4c5b5;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 3rpx;
}

/* ----- 横向滚动商品卡片 ----- */
.scroll-x {
  white-space: nowrap;
  padding: 4rpx 0 8rpx;
}

.scroll-row {
  display: inline-flex;
  gap: 16rpx;
}

.product-card {
  width: 196rpx;
  background: #faf6f0;
  border-radius: 18rpx;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.product-card:active {
  transform: translateY(-6rpx);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
}

.product-img-wrap {
  width: 196rpx;
  height: 180rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5eee8;
}

.product-img {
  width: 100%;
  height: 100%;
}

.product-info {
  padding: 14rpx 14rpx 18rpx;
}

.product-name {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8rpx;
}

.product-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-price {
  font-size: 24rpx;
  font-weight: 700;
  color: #b8272b;
}

.product-cart-icon {
  width: 36rpx;
  height: 36rpx;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23b8272b'%3E%3Cpath d='M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59L5.25 14H19v-2H7.42l.94-2H17l3-6H5.21L4.27 2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.7;
}

/* ----- 反馈入口 ----- */
.feedback-wrap {
  display: flex;
  align-items: center;
  background: #faf6f0;
  border-radius: 18rpx;
  padding: 24rpx 24rpx;
  margin-top: 4rpx;
  position: relative;
  overflow: hidden;
  transition: background 0.2s ease;
}
.feedback-wrap:active {
  background: #f5eee8;
}

.feedback-deco {
  width: 6rpx;
  height: 52rpx;
  background: #b8272b;
  border-radius: 3rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.feedback-content {
  flex: 1;
}

.feedback-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4rpx;
}

.feedback-desc {
  display: block;
  font-size: 22rpx;
  color: #8c8c8c;
}

.feedback-arrow {
  width: 40rpx;
  height: 40rpx;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23bfbfbf'%3E%3Cpath d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  flex-shrink: 0;
}

/* ========================================
   反馈弹窗
   ======================================== */
.modal-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-box {
  width: 600rpx;
  background: #ffffff;
  border-radius: 28rpx;
  padding: 48rpx 36rpx 36rpx;
  box-sizing: border-box;
  position: relative;
  box-shadow: 0 24rpx 64rpx rgba(0, 0, 0, 0.15);
  animation: modalIn 0.3s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(60rpx) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-close {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #f5f0eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close-icon {
  width: 24rpx;
  height: 24rpx;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238c8c8c'%3E%3Cpath d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.modal-brand {
  width: 40rpx;
  height: 4rpx;
  background: #b8272b;
  margin: 0 auto 20rpx;
  border-radius: 2rpx;
}

.modal-title {
  text-align: center;
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 24rpx;
  letter-spacing: 2rpx;
}

.modal-input {
  width: 100%;
  min-height: 180rpx;
  background: #faf6f0;
  border: none;
  border-radius: 14rpx;
  padding: 20rpx;
  box-sizing: border-box;
  font-size: 26rpx;
  color: #1a1a1a;
  line-height: 1.6;
  font-family: inherit;
}
.modal-input::placeholder {
  color: #bfbfbf;
}

.modal-count {
  text-align: right;
  font-size: 22rpx;
  color: #bfbfbf;
  margin-top: 8rpx;
}

.modal-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background: #b8272b;
  color: #ffffff;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  letter-spacing: 3rpx;
  margin-top: 28rpx;
  transition: opacity 0.2s ease, transform 0.2s ease;
  box-shadow: 0 4rpx 16rpx rgba(184, 39, 43, 0.25);
}
.modal-btn:active {
  opacity: 0.9;
  transform: scale(0.98);
}
</style>
