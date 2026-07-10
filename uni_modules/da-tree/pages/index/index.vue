<template>
  <view class="datree-test-box">
    <view class="datree-test-item"><text>示例1：</text><button @click="handleExample(1)">单选模式</button><text></text></view>
    <view class="datree-test-item"><text>示例2：</text><button @click="handleExample(2)">多选模式</button><text></text></view>
    <view class="datree-test-item"><text>示例3：</text><button @click="handleExample(3)">展开指定节点</button><text></text></view>
    <view class="datree-test-item"><text>示例4：</text><button @click="handleExample(4)">选中指定节点(自动展开)</button><text></text></view>
    <view class="datree-test-item"><text>示例5：</text><button @click="handleExample(5)">多选模式(互不干扰)</button><text></text></view>
    <view class="datree-test-item"><text>示例6：</text><button @click="handleExample(6)">可选中禁用节点</button><text></text></view>
    <view class="datree-test-item"><text>示例7：</text><button @click="handleExample(7)">单选模式(动态加载)</button><text></text></view>
    <view class="datree-test-item"><text>示例8：</text><button @click="handleExample(8)">多选模式(动态加载)</button><text></text></view>
    <view class="datree-test-item"><text>示例9：</text><button @click="handleExample(9)">单选模式(只能选择末级节点)</button><text></text></view>
    <view class="datree-test-item"><text>示例10：</text><button @click="handleExample(10)">处理末级节点</button><text></text></view>
    <view class="datree-test-item"><text>示例11：</text><button @click="handleExample(11)">首次展开动态加载</button><text></text></view>
    <view class="datree-test-item"><text>示例12：</text><button @click="handleExample(12)">渲染(获取)禁用节点</button><text></text></view>
    <view class="datree-test-item"><text>示例13：</text><button @click="handleExample(13)">主题换色</button><text></text></view>
    <view class="datree-test-item"><text>示例14：</text><button @click="handleExample(14)">控制选择图标</button><text></text></view>
    <view class="datree-test-item"><text>示例15：</text><button @click="handleExample(15)">搜索筛选</button><text></text></view>
  </view>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  onLoad() {},
  setup() {
    function handleExample(val) {
      if (!val) return
      uni.navigateTo({
        url: `/pages/demos/demo${val}`,
      })
    }

    return {
      handleExample,
    }
  },
})
</script>

<style lang="scss">
.datree-test-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 20px;
  margin: 20px 0;
  font-size: 12px;

  > text,
  > uni-text {
    min-width: 70px;
    font-size: 16px;
    font-weight: bold;
  }

  > button,
  > uni-button {
    display: inline-block;
    width: auto;
    height: auto;
    padding: 12px 24px;
    margin-left: 10px;
    font-size: 14px;
    line-height: 1;
    color: #fff;
    background: $uni-color-primary;

    &::after {
      display: none;
    }
  }
}

.datree-box {
  display: flex;
  flex-wrap: wrap;

  &-item {
    width: 100%;
  }

  &-test {
    display: flex;
    align-items: center;
    padding: 0 20px;
    margin-bottom: 10px;
    font-size: 12px;

    > button,
    > uni-button {
      display: inline-block;
      width: auto;
      height: auto;
      padding: 5px 10px;
      margin-left: 10px;
      font-size: 12px;
      line-height: 1;
      color: #fff;
      background: $uni-color-primary;

      &::after {
        display: none;
      }
    }
  }
}
</style>
