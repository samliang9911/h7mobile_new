<template>
  <view class="expense">
    <up-tabs :list="list" keyName="title" @change="e=>current = list.find(o=>o.value==e.value)!" />
    <view class="refresh" :style="{
      height:refreshHeight+'px',
      transition:touchend?`height ${(refresh==0?0.3:0.8)}s`:''
      }">
      <view v-show="refreshHeight">
        <view>
          <image :style="{width:'300rpx',height: '70rpx'}" src="/static/loadingResetting.gif"
                 mode="aspectFill"></image>
        </view>
        {{ refreshHeight<120&&!touchend?'下拉刷新':state[refresh-1] }}
      </view>
    </view>
    <view class="scroll">
      <scroll-view scroll-y @touchstart="onTouchstart" @scroll="onScroll" @touchmove="onTouchmove"
                   @touchend="onTouchend">
        <myComponent :key="current.key" :is="current.component" v-model="current.data" />
      </scroll-view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref, reactive, markRaw, h } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getApproval, getAnnex, getFlow, getDetail } from '@/api/expense'
import approval from './approval/index.vue'
import annex from './annex/index.vue'
import flow from './flow/index.vue'
import detail from './detail/index.vue'
let params : any;
const list = reactive<{ key : any, title : string, value : string, component : any, data ?: any, load : Function }[]>([
  {

    key: 1, title: '审批单', value: 'approval', component: markRaw(approval), async load() {
      this.data = {}
      this.data = await getApproval(params)
    }

  },
  {

    key: 2, title: '附件', value: 'annex', component: markRaw(annex), async load() {
      this.data = []
      this.data = await getAnnex(params)
    }

  },
  {

    key: 3, title: '流程', value: 'flow', component: markRaw(flow), async load() {
      this.data = {}
      this.data = await getFlow(params)
    }

  }
]);
// #ifdef H5
(window as any).data = list
// #endif
const current = ref<typeof list[0]>(list[0])
/* 	onLoad(async param => {
		params = param
		Promise.all(list.map(e => e.load()))
		const mx = await getDetail(params)
		if (Object.keys(mx).length) {
			list.splice(1, 0, {
				key: 4, title: '明细', value: 'detail', data: mx, component: markRaw(detail), async load() {
					this.data = {}
					this.data = await getDetail(params)
				}

			})
		}
	}) */

	  onLoad(async param => {
	    params = param
	    
	    //console.log('===== onLoad 开始执行 =====')
	    //console.log('params:', params)
	    
	    // 并行加载所有 Tab 数据
	    //console.log('开始加载 Tab 数据...')
	    await Promise.all(list.map(e => e.load()))
	    //console.log('Tab 数据加载完成')
	    
	    // 获取明细数据
	    //console.log('开始获取明细数据...')
	    const mx = await getDetail(params)
	    //console.log('明细数据:', mx)
	    
	    if (Object.keys(mx).length) {
	      //console.log('有明细数据，插入明细 Tab')
	      // 在第 2 个位置插入明细 Tab
	      list.splice(1, 0, {
	        key: 4,
	        title: '明细',
	        value: 'detail',
	        data: mx,
	        component: markRaw(detail),
	        async load() {
	          this.data = {}
	          this.data = await getDetail(params)
	        }
	      })
	    } else {
	      console.log('没有明细数据')
	    }
	
	    //console.log('===== 最终 list 数据 =====')
	    //console.log('list 长度:', list.length)
	    //console.log('list:', list)
	    //console.log('list[0]:', list[0])
	    //console.log('list[0].data:', list[0].data)
	    //console.log('========================')
	  })
  /**视图距离顶部高度 */
  let scrollTop : number = 0;
  let touchstartY : number = 0;
  /** 0:未能刷新 1:可以刷新 2:刷新中 3:刷新完成 */
  const refresh = ref(0)
  /**状态值 */
  const state = ['松开刷新', '刷新中...', '刷新完成']
  const touchend = ref(true)
  /**下拉刷新动画高度 */
  const refreshHeight = ref(0)
  function onScroll(e) {
    scrollTop = e.detail.scrollTop
  }
  function onTouchstart(e) {
    if (scrollTop > 0 || current.value.value == 'detail') return;
    touchend.value = false;
    touchstartY = e.changedTouches[0].clientY;
  }
  function onTouchmove(e) {
    if (touchend.value) return;
    if (e.changedTouches[0].clientY < touchstartY) return;
    refreshHeight.value = e.changedTouches[0].clientY - touchstartY
    refresh.value = refreshHeight.value > 120 ? 1 : 0
  }
  function onTouchend() {
    if (touchend.value) return;
    touchend.value = true
    if (refresh.value === 1) {
      refresh.value = 2
      refreshHeight.value = refreshHeight.value > 70 ? 70 : refreshHeight.value
      current.value.load().then(() => {
        current.value.key = Date.now()
        refresh.value = 3
        setTimeout(() => {
          refresh.value = 0
          refreshHeight.value = 0
        }, 300)
      })
    }
    else {
      refresh.value = 0
      refreshHeight.value = 0
    }
  }
  
  function myComponent({ is, ...props }, attrs) {
    return h(is, props, () => attrs.slots)
  }


</script>
<style lang="scss" scoped>
.expense {
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
  // padding: calc(var(--status-bar-height) + 37rpx) 37rpx 10rpx 37rpx;

  &>.u-tabs {
    position: relative;
    justify-content: center;
    flex-direction: row;

    & :deep(.u-tabs__wrapper__nav__item__text) {
      font-size: 19px;
    }
  }

  &>.refresh>view {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #3c9cff;
    font-size: 23rpx;
  }

  &>.scroll {
    flex: 1;
    overflow: hidden;

    &>scroll-view {
      height: 100%;
    }
  }
}
</style>