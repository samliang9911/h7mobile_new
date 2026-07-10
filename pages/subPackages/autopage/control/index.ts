import {h} from 'vue'
import date from './modules/date.vue'
import input from './modules/input.vue'
import radio from './modules/radio.vue'
import select from './modules/select.vue'
import checkbox from './modules/checkbox.vue'
import textarea  from './modules/textarea.vue'
import choosePage from './modules/choosePage.vue'
const all = {
  date,
  input,
  radio,
  select,
  checkbox,
  textarea,
  choosePage
}
export default {
  render(props){
    let comp;
    let type = props.$attrs.type;
    if(['input','inputNumber'].includes(type))comp = h(all['input'],props.$attrs);
    else{
      comp = all[type]?
      h(all[type],props.$attrs):
      h('view',{style:"line-height:50rpx;height:60rpx;color:#d8d8d8;font-size:25rpx;"},[`(${type})组件不存在`])
    }
    return comp
  }
}