<template>
  <view style="position: relative;background-color: #22222200;">
    <up-popup safeAreaInsetBottom z-index="10076" :show="popupBoxShow" mode="bottom" round="15" :length="popupLength()"
      @close="close">
      <view class="popupContent" style="height: 100%">
        <!-- 意见决策 -->
        <view class="popupHead" v-if="propsIdeaDecision['length'] > 0 ? true : false">
          <view>
            <text>意见决策</text>
          </view>
          <view>
            <up-radio-group v-model="selectedValue">
              <up-radio :disabled="false" :activeColor="colorBackG" style="margin-left: 50rpx;"
                @change="showIdeaDecision(item)" v-for="(item, indexRadioY) in propsIdeaDecision" :key="indexRadioY"
                :label="item['CodeName']" :name="item['CodeName']">
              </up-radio>
            </up-radio-group>
          </view>
        </view>
        <!-- 流转节点 -->
        <moving v-model="coordinateIndex" :propsNodeSelPerson="propsNodeSelPerson" :flowAllData="flowAllData"/>
        <!-- 选人 -->
        <view class="popupHead">
          <view style="width: 100%;">
            <view v-for="(item, indexNewM) in propsNodeSelPerson" :key="indexNewM">
              <view v-if="propsNodeSelPerson['length'] >= 1 && item['checked'] && item['TaskAssignMode'] === 'All'"
                :style="'width:100%;border: solid 1rpx ' + item['color'] + ';display: flex;justify-content: space-between;align-items: center;'">
                <up-cell-group style="width: 100%;">
                  <view
                    :style="'width: 100%;display: flex;align-items: center;' + 'background-color: ' + item['color'] + '0a' + ';'">
                    <view style="flex: 3;flex-wrap: wrap;">
                      <view style="display: flex;white-space: nowrap;flex-wrap: wrap;">
                        <view style="padding-left: 20rpx;" v-for="(item2, index2) in item['xuanrenArr']" :key="index2">
                          <up-checkbox @change="choosePersonFn(item2, indexNewM, index2, 'checkbox')"
                            v-model="item2.checked" :name="item2['Executor']">
                            <text :style="'color:' + item['color'] + ';'">{{ item2['Executor'] }}</text>
                          </up-checkbox>
                        </view>
                      </view>
                    </view>
                    <view style="padding: 15rpx 0;flex: 1;display: flex;align-items: center;justify-content: center;">
                      <view
                        :style="'color:#eeeeee;text-align: center;width: 50%;border: 1rpx solid ' + item['color'] + '0a' + ';padding: 10rpx 0;background-color: ' + item['color'] + ';border-radius: 10rpx;'"
                        @click="addTheFn(item)">
                        <text>增加</text>
                      </view>
                    </view>
                  </view>
                </up-cell-group>
              </view>
            </view>
            <view v-for="(item, indexONE) in propsNodeSelPerson" :key="item['ActivityInfoExOID']">
              <view v-if="propsNodeSelPerson['length'] >= 1 && item['checked'] && item['TaskAssignMode'] === 'Balance'"
                :style="'width:100%;border: solid 1rpx ' + item['color'] + ';display: flex;justify-content: space-between;align-items: center;'">
                <up-radio-group style="width: 100%;">
                  <view
                    :style="'width: 100%;display: flex;align-items: center;' + 'background-color: ' + item['color'] + '0a' + ';'">
                    <view style="flex: 3;flex-wrap: wrap;">
                      <view style="display: flex;white-space: nowrap;flex-wrap: wrap;">
                        <view style="padding-left: 20rpx;" v-for="(item2, index2) in item['xuanrenArr']" :key="index2">
                          <up-radio @change="choosePersonFn(item2, indexONE, index2, 'radio')" :disabled="false"
                            :name="item2.Executor">
                            <text :style="'color:' + item['color'] + ';'">{{ item2.Executor }}</text>
                          </up-radio>
                        </view>
                      </view>
                    </view>
                    <view style="padding: 15rpx 0;flex: 1;display: flex;align-items: center;justify-content: center;">
                      <view
                        :style="'color:#eeeeee;text-align: center;width: 50%;border: 1rpx solid ' + item['color'] + '0a' + ';padding: 10rpx 0;background-color: ' + item['color'] + ';border-radius: 10rpx;'"
                        @click="addTheFn(item)">
                        <text>增加</text>
                      </view>
                    </view>
                  </view>
                </up-radio-group>
              </view>
            </view>
          </view>
        </view>
        <!-- 意见内容 -->
        <view class="popupHead">
          <view>
            <text>意见内容:</text>
          </view>
          <view class="commonIdea" @click="sentenceFn">
            <text>常用意见</text>
            <up-icon name="arrow-right" color="#333333" size="14"></up-icon>
          </view>
        </view>
        <view class="popupInput">
          <view class="popupInputContent">
            <textarea :maxlength="500" @input="inputIdeaContent" v-model="opinionContent"
              placeholder="请输入内容"></textarea>
            <view style="margin-left: 85%;">
              <text>{{ opinionContent ? opinionContent['length'] : 0 }}</text><text>/500</text>
            </view>
          </view>
        </view>
        <up-toast ref="uToast" />
        <up-loading-page :loading="loadingPage.loading" :loadingText="loadingPage.text" bgColor="rgb(255 255 255 / 45%)"
          color="#676767" fontSize="14" />
        <!-- 悬浮按钮 -->
        <view @click="popupAddBtn = !popupAddBtn" :style="popupAddBtn ? 'transform: rotate(135deg);' : ''"
          :class="['addBtn', backGround]">
          <up-icon name="plus" color="#f0f5ff" :size="popupAddBtn ? '30' : '25'"></up-icon>
        </view>
        <!-- 保存等按钮 -->
        <view class="toAddBtn"
          :style="popupAddBtn ? propsContentList['length'] == 4 ? 'width:82%;' : propsContentList['length'] == 2 ? 'width:41%;' : propsContentList['length'] == 3 ? 'width:72%;' : propsContentList['length'] == 1 ? 'width:42%;' : propsContentList['length'] <= 0 ? 'display:none;' : 'width:92%;' : 'opacity: 0;'">
          <view @click="contentListBtn(item)" class="floatBtn" v-for="item in contentList" :key="item.ActionID">
            <view class="floatBtnIcon">
              <up-icon :name="item.iconName" :color="item.active ? '' + '' + colorBackG + 'AA' + '' + '' : '' + colorBackG + ''"
                size="15"></up-icon>
            </view>
            <view class="floatBtnText"
              :style="propsContentList['length'] > 4 ? 'font-size: 25rpx;' : '' + popupAddBtn ? 'opacity: 1;transition: all .6s ease-in-out;' : 'opacity: 0;transition: all .2s ease-in-out;'">
              <text>{{ item.text }}</text>
            </view>
          </view>
        </view>
        <!-- 展开节点选人 -->
        <view v-for="item in 2" :key="item" class="pickBox" :style="pickShow ? '' : 'display:none;'">
          <view class="headQuit"></view>
          <view
            :style="item === 1 ? 'display:none;' : 'margin-left:5%;transform: scale(1, 0.5);width: 90%;font-size: 40rpx;border-bottom: 1px solid #e4e7ed;'">
          </view>
          <view class="pickBoxContent">
            <view class="pickBoxTitle">
              <view style="width: 100%;height:100%;display: flex;align-items: center;white-space: nowrap;">
                <view>
                  <text>{{ item == 1 ? "督办" : "知会/参阅" }}</text>
                </view>
              </view>
            </view>
            <view class="pickBoxSleect">
              <view @click="pickFn(item)" style="width: 100%;">
                <view style="width: 90%;border-radius: 13rpx;text-align: center;">
                  <up-icon name="plus" color="#4395ff" size="25"></up-icon>
                </view>
              </view>
            </view>
          </view>
          <view style="width: 100%;display: flex;align-items: center;">
            <!-- 提醒按钮 -->
            <view @tap="radioBtn(item)"
              style="margin-right: 5px;font-size: 35rpx;margin-left: 10rpx;color:#333333;display: flex;align-items: center;height: 100%;padding: 10rpx;border-radius: 8rpx;">
              <svg t="1658297792493" class="icon" viewBox="0 0 1024 1024" version="1.1" p-id="10551"
                data-spm-anchor-id="a313x.7781069.0.i12">
                <path
                  d="M436.790468 965.130894l-0.435745-0.740766c-0.588255-1.024-1.612255-2.331234-2.505532-3.485958l-0.305021-0.501106c-0.457532-0.653617-1.002213-1.350809-1.350808-2.004426l-2.244085-3.246298-0.261447-0.305021-109.916596-169.199659a90.939915 90.939915 0 0 1-13.07234-67.126469 88.761191 88.761191 0 0 1 36.537191-57.017191 84.36017 84.36017 0 0 1 85.405958-6.209362v-282.798298C428.511319 323.322553 465.571404 283.234043 511.106723 283.234043c45.469957 0 82.595404 40.088511 82.595405 89.327659v90.852766a66.233191 66.233191 0 0 1 20.741446-3.377021c21.525787 0 41.875064 10.370723 56.211064 28.27983a69.828085 69.828085 0 0 1 37.670128-11.677958 68.629787 68.629787 0 0 1 42.485106 15.011404c9.477447 7.40766 17.429787 16.994043 23.203405 28.12732 6.710468-2.113362 13.682383-3.268085 20.676085-3.268086 42.37617 0 76.821787 40.088511 76.821787 89.32766v237.655149c0 52.572596-23.246979 110.679149-59.217702 148.109617-20.044255 20.850383-41.613617 32.397617-60.938894 32.397617H516.531745c-44.010213 0-63.771234-32.637277-79.741277-58.869106z m319.335489 14.946042c7.124426 0 24.837447-11.89583 42.201873-38.236596 18.628085-28.43234 29.30383-62.464 29.30383-93.249361V604.138213c0-19.978894-12.331574-37.321532-26.384341-37.321532a18.737021 18.737021 0 0 0-8.889191 2.287659v85.493107h-0.087149c-1.002213 14.336-12.505872 25.447489-26.384341 25.512851-13.922043 0-25.491064-11.329362-26.427915-25.491064h-0.043574V580.411915l-1.590468-20.828596c-1.372596-18.562723-13.246638-33.704851-26.515064-33.704851-5.882553 0-11.917617 3.268085-16.689021 8.714894v92.465021c-0.043574 15.12034-11.89583 27.342979-26.536851 27.386553-14.597447-0.065362-26.427915-12.288-26.47149-27.386553v-81.353532l-1.982638-9.499234c-3.268085-15.817532-14.248851-27.713362-25.425702-27.713362-7.625532 0-15.251064 5.403234-20.414638 14.18349l-0.849703 91.724255v34.489191c0 13.377362-10.610383 24.379915-23.552 24.379915h-5.730042c-13.006979 0-23.573787-11.002553-23.573787-24.379915V373.585702l-0.152511-9.717106c0-20.588936-14.466723-37.25617-32.354043-37.25617-17.865532 0-32.332255 16.710809-32.332255 37.25617l1.154724 267.547234c0.065362 0.806128 0.087149 1.634043 0.087149 2.461957v106.147404c-0.217872 13.660596-10.087489 25.098894-23.181618 26.841873a26.580426 26.580426 0 0 1-28.977021-19.913532l-9.956766-30.001021a36.014298 36.014298 0 0 0-22.985532-15.904681 35.077447 35.077447 0 0 0-27.103319 5.621106c-16.558298 11.50366-20.937532 34.685277-9.84783 51.810043l113.315405 174.145361 0.370383 0.47932 1.394383 2.135149 1.742978 2.679829c1.067574 1.742979 2.222298 3.398809 3.246298 4.684256l0.740766 0.958638 0.544681 1.198298c17.64766 29.151319 24.445277 35.44783 37.844426 35.44783h242.491914v-0.174298 0.043574z"
                  fill="#4395ff" p-id="10552" data-spm-anchor-id="a313x.7781069.0.i8" class="selected"></path>
                <path
                  d="M343.148936 359.489362c0 15.033191-12.200851 27.234043-27.234042 27.234042H174.297872a27.234043 27.234043 0 0 1 0-54.468085h141.617022c15.033191 0 27.234043 12.200851 27.234042 27.234043zM887.829787 359.489362c0 15.033191-12.200851 27.234043-27.234042 27.234042H718.978723a27.234043 27.234043 0 0 1 0-54.468085h141.617022c15.033191 0 27.234043 12.200851 27.234042 27.234043zM802.772426 97.824681a27.234043 27.234043 0 0 1 0 38.498042l-118.173958 118.195745a27.234043 27.234043 0 0 1-38.51983-38.51983l118.173958-118.173957a27.234043 27.234043 0 0 1 38.51983 0zM253.908426 97.824681a27.234043 27.234043 0 0 1 38.519829 0l118.173958 118.173957a27.234043 27.234043 0 0 1-38.51983 38.51983L253.908426 136.322723a27.234043 27.234043 0 0 1 0-38.498042zM528.340426 0c15.033191 0 27.234043 12.200851 27.234042 27.234043v141.617021a27.234043 27.234043 0 0 1-54.468085 0v-141.617021C501.106383 12.200851 513.307234 0 528.340426 0z"
                  fill="#515151" p-id="10553" data-spm-anchor-id="a313x.7781069.0.i11" class="selected"></path>
              </svg>
              <text style="padding-left: 10rpx;font-size: 25rpx;">{{ item === 1 ? remindText['title1'] : item === 2 ?
      remindText['title2'] : "提醒" }}</text>
            </view>
            <!-- 选完人名称 -->
            <scroll-view style="width: 74%;" scroll-x="true" scroll-left="120">
              <view style="color:#212529;display: flex;align-items: center;white-space: nowrap;">
                <view v-for="(it, count) in superInfo(item)" :key="count">
                  <text style="white-space: nowrap;" v-show="count == 0 ? false : true">,</text>
                  <text :style="'color:' + colorBackG + ';white-space: nowrap;font-size: 25rpx;'">{{ it.Name }}</text>
                </view>
              </view>
            </scroll-view>
          </view>
        </view>
        <view
          :style="pickShow ? 'padding-bottom: 20rpx;padding-top: 100rpx;transition: all .3s ;' : 'padding-bottom: 20rpx;padding-top: 70rpx;'"
          @click="dividerShowFn">
          <up-divider style="width: 100%;font-size: 40rpx;" :text="pickShow ? '收起' : '展开'"></up-divider>
        </view>
      </view>
    </up-popup>
    <up-popup z-index="10077" border-radius="16" :show="show" mode="bottom" @close="show = false">
      <up-cell-group>
        <view :style="choiceUp === 3 ? 'display:block' : 'display:none'" v-for="(item, index) in propsOpinion" :key="index">
          <up-cell :titleStyle="{ 'display': 'flex', 'align-items': 'center', 'justify-content': 'center', 'width': '100%' }"
            :title="item['Opinion']" @click="opinionFn(item)"></up-cell>
        </view>
        <view :style="choiceUp === 2 ? 'display:block' : 'display:none'" v-for=" (item, index) in listSelect" :key="index">
          <up-cell :titleStyle="{ 'display': 'flex', 'align-items': 'center', 'justify-content': 'center', 'width': '100%' }"
            :title="item['label']" @click="remind(item)"></up-cell>
        </view>
        <view :style="choiceUp === 1 ? 'display:block' : 'display:none'" v-for=" (item, index) in listSelect" :key="index">
          <up-cell :titleStyle="{ 'display': 'flex', 'align-items': 'center', 'justify-content': 'center', 'width': '100%' }"
            :title="item['label']" @click="remind(item)"></up-cell>
        </view>
      </up-cell-group>
    </up-popup>
  </view>
</template>
<script setup lang="ts">
import { ref, reactive, watch, onMounted, getCurrentInstance } from 'vue';
import {http_request} from '@/api/api.js'
import { getUrlType } from "@/utils/instrumentType.js";
import moving from './moving.vue'
const props = defineProps<{
  popupShow: Boolean,
  contentList: any[],
  jierenArr: any[],
  ideaDecision: any[],
  flowAllData: {
    IdeaContent: string
    SplitMode: string
    IdeaCode: string
    ActivityInfo:{[key:string]:any}[]
  },
  opinion: any[],
  oldIdeaCodeValue: string,
  oldIdeaCode: string,
  IsIdea: Boolean,
  getBusinessTable: String
}>()
/** 当前选中的流转节点 */
// const selectNode = ref('')
// const aaa = ref('')
watch(() => props.flowAllData.IdeaContent, str => str && (opinionContent.value = str))
const uToast = ref()
const loadingPage = ref({ loading: false, text: '加载中...' });
const { proxy } = getCurrentInstance()!;
const selectedValue = ref('');
const propsContentList = ref([]);
const propsNodeSelPerson = ref<any[]>([]); // 流转节点
const propsIdeaDecision = ref<{ CodeID: string, CodeName: string, checked: boolean }[]>([]);
const propsFlowAllData = ref<{
  IdeaContent: string, SplitMode: string, IdeaCode: string, AssignTaskOID: string, InstanceID: string, IdeaCodeValue?: string
}>({ IdeaContent: '', SplitMode: '', IdeaCode: '', AssignTaskOID: '', InstanceID: '' });
const propsOpinion = ref([]);
const backGround = ref(''); // 全局背景颜色
const colorBackG = ref('');
const supervise = ref<{ Name: string }[]>([]); // 督办
let Inform = []; // 知会
const coordinateIndex = ref<any>(null); // 上次选人索引记录
const listSelect = ref([
  { value: 1, label: '短信' },
  { value: 2, label: '微信' },
  { value: 3, label: '企业微信' },
  { value: 4, label: 'RTX' },
  { value: 5, label: 'QQ' },
  { value: 6, label: '钉钉' },
  { value: 7, label: '手机' },
  { value: 8, label: '接口' }
]);
const pickShow = ref(false); // 展开
const show = ref(false);
const popupBoxShow = ref(false);
const popupAddBtn = ref(false);
let saveSubJson: {
  tag?: string
  tb?: string
  field: { [key: string]: any }
} = { "field": {} }; // 保存提交的数据
const opinionContent = ref(''); // 多行文本框内容
const executeUrl = '/api/flowAction/approvalHandle'; // 执行审核数据
let chooseNodeIndex = null; // 节点的索引
let choosePersonIndex = null; // 节点的选人索引
const choiceUp = ref<number>(); // 弹窗内容控制器
const remindText = reactive({
  title1: '提醒',
  title2: '提醒'
}); // 提醒按钮文字
const mask = ref(false);
const maskText = ref('');
const emits = defineEmits(['popWinValue']); //传递父组件事件
// 打开弹窗
watch(() => props.popupShow, (newData) => {
  if (newData) {
    popupBoxShow.value = true;
  }
});
// 关闭弹窗
watch(() => popupBoxShow.value, (newData) => {
  if (!newData) {
    emits('popWinValue', newData);
  }
});
watch(() => props.oldIdeaCodeValue, (newData) => {
  if (newData) {
    if (props.flowAllData.IdeaContent) {
      opinionContent.value = props.flowAllData.IdeaContent;
    } else {
      opinionContent.value = newData;
    }
  }
});
watch(() => props.contentList, (newData) => {
  propsContentList.value = JSON.parse(JSON.stringify(newData));
});
watch(() => props.jierenArr, (newData, oldData) => {
  propsNodeSelPerson.value = newData || oldData;
});
// 意见决策初始值和保存值
watch(() => props.ideaDecision, (newData) => {
  propsIdeaDecision.value = JSON.parse(JSON.stringify(newData));
  if (props.oldIdeaCode) {
    propsIdeaDecision.value.forEach(v => {
      if (v.CodeID === props.oldIdeaCode) {
        selectedValue.value = props.oldIdeaCodeValue;
        showIdeaDecision(v, props.oldIdeaCodeValue);
      }
    });
  } else if (propsIdeaDecision.value.length !== 0) {
    selectedValue.value = propsIdeaDecision.value[0].CodeName;
    saveSubJson.field.IdeaCode = propsIdeaDecision.value[0].CodeID || '';
    saveSubJson.field.IdeaCodeValue = propsIdeaDecision.value[0].CodeName || '';
    saveSubJson.field.IdeaContent = propsIdeaDecision.value[0].CodeName || '';
    showIdeaDecision(propsIdeaDecision.value[0], props.oldIdeaCodeValue);
  }
});
watch(() => props.flowAllData, (newData) => {
  propsFlowAllData.value = JSON.parse(JSON.stringify(newData));
  saveSubJson.tag = "upd";
  saveSubJson.tb = "Flow_AssignTask";
  saveSubJson.field.Flow_AssignTaskOID = `${propsFlowAllData.value.AssignTaskOID}`;
});
watch(() => props.opinion, (newData) => {
  propsOpinion.value = JSON.parse(JSON.stringify(newData));
});
onMounted(() => {
  backGround.value = 'backg'; // 设置背景颜色类名
  colorBackG.value = '#4395ff'; // 设置背景颜色值
});
// 弹出的高度
const popupLength = () => {
  if (pickShow.value) {
    if (propsIdeaDecision.value.length > 0) {
      return "70%";
    } else {
      if (propsNodeSelPerson.value.length > 0) {
        if (coordinateIndex.value) {
          return '74%';
        } else {
          return '69%';
        }
      } else {
        return '64%';
      }
    }
  } else {
    if (propsIdeaDecision.value.length > 0 && propsNodeSelPerson.value.length > 0) {
      if (coordinateIndex.value) {
        return '52%';
      }

    } else if (propsIdeaDecision.value.length > 0) {
      return '48%';
    }
    else {
      if (propsNodeSelPerson.value.length > 0) {
        if (coordinateIndex.value) {
          return '47%';
        } else {
          return '42%';
        }
      } else {
        return '40%';
      }
    }
  }
};
const close = () => {
  popupBoxShow.value = false;
}
// 点击意见决策
const showIdeaDecision = (item, name?:string) => {
  // 将意见决策添加到请求参数内容
  if (!name && item) {
    opinionContent.value = item.CodeName; // 意见的内容
    saveSubJson.field.IdeaCode = item.CodeID || '';
    saveSubJson.field.IdeaCodeValue = item.CodeName || '';
    saveSubJson.field.IdeaContent = item.CodeName || '';

    // 意见决策
    propsIdeaDecision.value.forEach(item => {
      item.checked = false;
    })
    item.checked = !item.checked
  }
}
//勾选人
const choosePersonFn = (childItem, nodeIndex, childIndex, chooseType) => {
  if (chooseType === 'radio') {
    childItem.checked = true;
    if (choosePersonIndex !== null && chooseNodeIndex !== null) {
      propsNodeSelPerson.value[chooseNodeIndex].xuanrenArr[choosePersonIndex].checked = false;
    }
    choosePersonIndex = childIndex;
    chooseNodeIndex = nodeIndex;
  } else if (chooseType === 'checkbox') {
    childItem.checked = !childItem.checked;
  }
}
//添加选人 增加
const addTheFn = (item) => {
  let data = {
    search_arr: "NAME", //搜索时需要的参数
    checkP: '1', //是否选父级 1为父级可选  2为父级不可选
    type: 'radio', //radio 单选  checkbox 多选
  }
  if (item.TaskAssignMode === 'All') { //All多选 Balance单选 Function不选
    data.type = 'checkbox';
  }
  uni.navigateTo({
    url: `../publicform/publicChoicePerson?Type=Person&Choose=${data.type}`,
    events: {
      ChoicePerson(data) {
        //过滤相同OID
        const filterData = data.filter(e => {
          return !item.xuanrenArr.some(el => el.ExecutorOID === e.OID);
        });
        filterData.forEach((it) => {
          let obj = {
            checked: false,
            ExecutorOID: "",
            Executor: "",
            FlowModelExOID: "",
            FlowID: "",
            ActivityInfoExOID: "",
            ActivityID: "",
            ExecutorsPostOID: ""
          }
          obj.Executor = it.Name;
          obj.ExecutorOID = "(U:" + it.OID + ")";
          obj.ExecutorsPostOID = it.PostOID;
          obj.FlowModelExOID = item.FlowModelExOID;
          obj.FlowID = item.FlowID;
          obj.ActivityInfoExOID = item.ActivityInfoExOID;
          obj.ActivityID = item.ActivityID;
          obj.checked = true;
          item.xuanrenArr.push(obj)
        })
      }
    },
    success(res) {
      //回显数据中必须包含主键OID
      let echo = item.xuanrenArr.filter(f => f.checked).map(e => ({ ...e, OID: e.ExecutorOID }));
      res.eventChannel.emit('echoChoicePerson', echo)
    }
  });
}
//意见内容
const sentenceFn = () => {
  choiceUp.value = 3;
  show.value = !show.value
};
//常用意见
const opinionFn = (item) => {
  saveSubJson.field.IdeaContent = item.Opinion;
  opinionContent.value = item.Opinion;
  show.value = false;
}
// 输入意见内容
const inputIdeaContent = (e) => {
  //多行文本框
  opinionContent.value = e.detail.value;
  saveSubJson.field.IdeaContent = opinionContent.value || '';
}
// 悬浮按钮的子按钮的点击提示和实现功能1
const contentListBtn = (item) => {
  uni.showModal({
    title: '提示',
    content: "确定" + item.text + "吗?",
    success: (res) => {
      if (res.confirm) {
        floatBtnFn(item)
      }
    }
  });
}
// // 悬浮按钮的子按钮的点击提示和实现功能3
const floatBtnFn = (item) => {
  item.active = !item.active
  const finish = {'BU_SAVE':saveSub,'WF_FINISHTASK':finishTask}
  if(finish[item.ActionID])finish[item.ActionID](item);
  else {
    const text = {'WF_HUIQIN':'会签','WF_XIEBAN':'协办','WF_SIGNTO':'转签','WF_SIGN':'加签','WF_READ':'知会'}
    mask.value = true;
    maskText.value = text[item.ActionID]
    // 请填写意见内容
    if (!opinionContent.value) {
      uni.showToast({
        title: '请填写意见内容',
        icon: 'none',
        duration: 2000
      })
      return true;
    }
    publicSub(item.ActionID, item);
  }
}
// 检查上传字段里是否有新值
const checkField = (obj, showToast = true) => {
  const keys = Object.keys(obj);
  // 排除不识别的键
  const otherKeys = keys.filter(key => key !== 'Flow_AssignTaskOID');
  if (otherKeys.length === 0) {
    if (showToast) {
      uni.showToast({
        title: '没有修改的数据可提交',
        icon: 'none',
        duration: 2000
      });
    }
    return false;
  }
  return true;
}
//保存
const saveSub = (itemAction) => {
  // 检测有没有修改的数据可提交，没有则终止后续操作
  if (!checkField(saveSubJson.field)) return;
  mask.value = true;
  maskText.value = "正在保存"
  http_request(proxy, { params: [saveSubJson] }, '', () => {
    itemAction.active = !itemAction.active //关闭执行高亮
    maskText.value = "";
    mask.value = false;
    uni.showToast({
      title: '保存成功',
      icon: 'none',
      duration: 2000
    });
  }, (res) => {
    uni.showToast({
      title: '保存失败,原因为:' + JSON.stringify(res),
      icon: 'none',
      duration: 3000
    });
  }, false, () => {
    if (mask.value) {
      maskText.value = "";
      mask.value = false;
    }
  })
  // 提交之后，将数据清空
  saveSubJson = { field: {} }
};
//执行
const finishTask = (itemAction) => {
  /**总体选人内容 */
  type ToActivityInfo = {
    /** 动作ID */
    activityID: string;
    /** 节点名称 */
    activityName: string;
    /** 选人名称 */
    executorStrName: string;
    /** 选人主键 */
    executorStrOID: string;
    /** 选岗位主键 */
    executorPostStrOID: string;
  }[]
  let actionList: {
    action: string;
    TaskID: string;
    InstanceID: string;
    toActivityInfo?: ToActivityInfo
    IdeaContent?: string
    IdeaCodeValue?: string
    IdeaCode?: string
  }[] = [{
    action: "WF_FINISHTASK",
    TaskID: propsFlowAllData.value.AssignTaskOID,
    InstanceID: propsFlowAllData.value.InstanceID,
  }]
  // 请求需要的数据
  let jsonExecute = {
    actionList,// 审批想要提交的数据
    submitData: { additionalProp1: [] },// 业务单据修改时需要提交的数据
  }
  // 请填写意见内容
  if (!opinionContent.value) {
    uni.showToast({
      title: '请填写意见内容',
      icon: 'none',
      duration: 2000
    });
    return true;
  }
  // 节点选人
  let toActivityInfo: ToActivityInfo = []; //总体选人内容
  let activityIDList: any[] = []; //临时存放的动作ID
  let activityNameList: any[] = []; //临时存放的节点名称
  if (propsNodeSelPerson.value) {
    propsNodeSelPerson.value.forEach(item => {
      if (item.checked && item.xuanrenArr) {
        item.xuanrenArr.forEach((personItem) => {
          if (personItem.checked) {
            if (item.TaskAssignMode === 'All') //多选
            {
              if (toActivityInfo.length === 0) //0为首次
              {
                activityIDList.push(item.ActivityID);
                activityNameList.push(item.nodeName);
                toActivityInfo.push({
                  activityID: item.ActivityID,
                  activityName: item.nodeName,
                  executorStrName: personItem.Executor,
                  executorStrOID: personItem.ExecutorOID,
                  executorPostStrOID: personItem.ExecutorsPostOID
                });
              }
              else {
                if (!activityIDList.includes(item.ActivityID)) {
                  activityIDList.push(item.ActivityID);
                  toActivityInfo[0].activityID += ',' + item.ActivityID;
                } else if (!activityNameList.includes(item.nodeName)) {
                  activityNameList.push(item.nodeName);
                  toActivityInfo[0].activityName += ',' + item.nodeName;
                }
                toActivityInfo[0].executorStrName += ',' + personItem.Executor;
                toActivityInfo[0].executorStrOID += ',' + personItem.ExecutorOID;
                toActivityInfo[0].executorPostStrOID += ',' + personItem.ExecutorsPostOID;
              }
            }
            else if (item.TaskAssignMode === 'Balance') { //单选
              toActivityInfo.push({
                activityID: item.ActivityID,
                activityName: item.nodeName,
                executorStrName: personItem.Executor,
                executorStrOID: personItem.ExecutorOID,
                executorPostStrOID: personItem.ExecutorsPostOID
              });
            }
          }
        })
      }

    })
  }
  jsonExecute.actionList[0].toActivityInfo = toActivityInfo;
  // 赋值审批内容
  const canSubmit = checkField(saveSubJson.field, false);
  jsonExecute.actionList[0].action = itemAction.ActionID;
  delete saveSubJson.field.Flow_AssignTaskOID;
  if (!canSubmit) {	// ！！！提交的field为空时，从返回值(保留在数据库的值)进行赋值)
    jsonExecute.actionList[0].IdeaCode = propsFlowAllData.value.IdeaCode || '';
    jsonExecute.actionList[0].IdeaCodeValue = propsFlowAllData.value.IdeaCodeValue || '';
    jsonExecute.actionList[0].IdeaContent = propsFlowAllData.value.IdeaContent || '';
  } else {
    jsonExecute.actionList[0].IdeaCode = saveSubJson.field.IdeaCode || '';
    jsonExecute.actionList[0].IdeaCodeValue = saveSubJson.field.IdeaCodeValue || '';
    jsonExecute.actionList[0].IdeaContent = saveSubJson.field.IdeaContent || '';
  }
  if (propsNodeSelPerson.value.length > 0 && Object.keys(toActivityInfo[0]).length === 0) {
    uni.showToast({
      title: "请选人",
      icon: "none"
    })
    return
  }
  mask.value = true;
  maskText.value = "开始执行"
  loadingPage.value = { loading: true, text: "正在执行" }
  setTimeout(() => {
    loadingPage.value.loading = false//因为没有报错机制，所以20秒后自动关闭加载页
    uToast.value.show({
      type: 'error',
      message: "执行失败",
    })
  }, 20000)
  http_request(proxy, jsonExecute, getUrlType(proxy) + executeUrl, () => {
    itemAction.active = !itemAction.active; //关闭执行高亮
    loadingPage.value.loading = false;
    uToast.value.show({
      type: 'success',
      message: "执行成功",
    })
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/items?t=' + Date.now()
      })
    }, 1000)
  }, () => {
    mask.value = false;
    maskText.value = "";
  }, false, () => {
    if (mask.value) {
      maskText.value = "";
      mask.value = false;
    }
  });
};
// 协办、转签、加签、知会 提交
const publicSub = (str, itemAction) => {
  // 赋值审批内容
  const canSubmit = checkField(saveSubJson.field, false);
  const actionList = [{
    action: str,
    TaskID: propsFlowAllData.value.AssignTaskOID,
    InstanceID: propsFlowAllData.value.InstanceID,
    personOIDs: [] as string[], //选人OID
    IdeaCode:(canSubmit?saveSubJson.field.IdeaCode:propsFlowAllData.value.IdeaCode)||'',
    IdeaCodeValue:(canSubmit?saveSubJson.field.IdeaCodeValue:propsFlowAllData.value.IdeaCodeValue)||'',
    IdeaContent:(canSubmit?saveSubJson.field.IdeaContent:propsFlowAllData.value.IdeaContent)||''
  }]
  delete saveSubJson.field.Flow_AssignTaskOID;
  // 跳转选人
  uni.navigateTo({
    url: `../publicform/publicChoicePerson?Type=Person,Post&Choose=checkbox`,
    events: {
      ChoicePerson(data) {
        data.forEach((d) => {
          actionList[0].personOIDs.push(d.OID);
        })
        http_request(proxy, {actionList}, getUrlType(proxy) + executeUrl, () => {
          mask.value = false;
          maskText.value = "";
          //清除监听，不清除会消耗资源
          uni.$off('ChoicePerson')
          itemAction.active = !itemAction.active //关闭执行高亮

          // uni.$emit('getData', "getData")
          uni.showToast({
            title: '操作成功!',
            type: 'success',
            duration: 2000,
            success: () => {
              popupBoxShow.value = false //关闭弹窗
              uni.switchTab({
                url: '/pages/index/items'
              })
            }
          })
        }, (res) => {
          uni.showToast({
            title: "网络加载失败,原因:" + JSON.stringify(res),
            icon: "none",
            duration: 3000
          })
        }, false, () => {
          if (mask.value) {
            mask.value = false;
            maskText.value = "";
          }
        })
      }
    }
  });
}
//提醒按钮点击事件
const remind = (TitleItem) => {
  if (choiceUp.value == 1) //提醒1
  {
    remindText.title1 = TitleItem.label;
  } else if (choiceUp.value == 2) //提醒2
  {
    remindText.title2 = TitleItem.label;
  }
  show.value = !show.value
};
/** 展开button */
const dividerShowFn = () => {
  pickShow.value = !pickShow.value
};
/** 单选 */
const radioBtn = (naviNum) => {
  choiceUp.value = naviNum
  show.value = !show.value
};
//督办知会选人,数组渲染处理
const superInfo = (item) => {
  //1督办
  if (item === 1) {
    return supervise.value;
  }
  //2知会
  else if (item === 2) {
    return Inform;
  }
};
//督办 跳转选人
const pickFn = (item) => {
  uni.navigateTo({
    url: `../publicform/publicChoicePerson?Type=Person&Choose=checkbox`,
    events: {
      ChoicePerson(data) {
        if (item === 1) { //如果为1,选中人添加督办数组
          supervise.value = data;
        } else if (item === 2) { //如果为2,选中人添加知会数组
          Inform = data;
        }
      }
    }
  });
}
</script>
<style lang="scss" scoped>
.hr-mask-box {
  position: absolute;
  width: 100%;
  height: 20%;
  bottom: 23%;
  display: flex;
  align-items: center;
  justify-content: center;

  .hr-mask-box-text {
    background-color: #585858;
    color: #FFFFFF;
    padding: 20rpx 20rpx;
    border-radius: 8rpx;
  }
}

.popupContent {
  width: 100%;
  // height: auto;
  background-color: #fff;
  transition: all .7s ease-in-out;

  .popupHead {
    display: flex;
    justify-content: space-between;
    width: 94%;
    margin: 0 3%;
    padding: 3% 0 0 0;
    align-items: center;

    .commonIdea {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .popupInput {
    width: 100%;
    margin-top: 20rpx;

    .popupInputContent {
      width: 100%;
      height: 360rpx;
      background-color: #fafafa;

      textarea {
        width: 94%;
        padding: 3% 0 0 0;
        margin: 0 3%;
        height: 75%;

      }
    }
  }

  .addBtn {
    // z-index: 9;
    width: 80rpx;
    height: 80rpx;
    background-color: #3e4043f8;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 100%;
    position: fixed;
    bottom: 90rpx;
    right: 25rpx;
    transition: all 0.3s ease-in-out;
    z-index: 4;
  }

  .toAddBtn {
    width: 90rpx;
    height: 80rpx;
    background-color: #ffffff;
    justify-content: center;
    align-items: center;
    border-radius: 50rpx;
    position: fixed;
    z-index: 3;
    bottom: 90rpx;
    right: 40rpx;
    box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.2);
    transition: all .3s ease-in-out;
    display: flex;
    padding: 0 60rpx 0 0;
    overflow: hidden;
    overflow-x: scroll;
    white-space: nowrap;
    -webkit-flex-wrap: nowrap;
    -ms-flex-wrap: nowrap;
    flex-wrap: nowrap;

    .floatBtn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 10rpx;
      overflow: auto;

      .floatBtnIcon {
        width: auto;
        height: 100%;
      }

      .floatBtnText {
        width: 100%;
        height: 100%;

      }
    }

  }

  .pickBox {
    width: 100%;
    // height: 60%;
    background-color: #ffffff;
    border-radius: 25rpx;
    transition: all .7s ease;

    .headQuit {
      display: flex;
      flex-direction: row-reverse;
      margin: 15rpx 50rpx;
    }

    .pickBoxContent {
      width: 96%;
      margin: 2% 2% 0 2%;
      display: flex;
      align-items: center;
      justify-content: center;

      .pickBoxTitle {
        flex-grow: 2;
        display: flex;
        align-items: center;
        margin: 5rpx 0;
      }

      .pickBoxSleect {
        width: 15%;

        .wxbtn_hover {
          position: relative;
          top: 3rpx;
          left: 3rpx;
          box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.1) inset;
        }

        .BodyInfoCheckBox {
          display: flex;
          flex-flow: wrap;

          .BodyInfoCheckContent {
            flex: 1;

            .contentHead_Info {
              color: #333;
              margin: 0 10rpx 20rpx 10rpx;
              display: flex;
              align-items: center;

              .contentHead_Info_Box {
                white-space: nowrap;
                display: flex;
                background-color: #60626608;
                padding: 10rpx;
                border-radius: 30rpx;

                .contentHead_Info_left {
                  box-shadow: 0rpx 1rpx 10rpx 1rpx #60626664;
                  width: 35rpx;
                  height: 35rpx;
                  border-radius: 100%;
                  margin-right: 25rpx;
                  text-align: center;
                  transition: all .3s ease-in-out;
                  opacity: 1;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                }

                .contentHead_Info_right {
                  text-align: center;

                  text {
                    padding-right: 20rpx;
                  }
                }
              }


            }
          }

        }
      }
    }
  }
}
</style>