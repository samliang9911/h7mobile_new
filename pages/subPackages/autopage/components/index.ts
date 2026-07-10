import {h} from 'vue'
import * as grid from './modules/grid'
import * as form from './modules/form'
import * as row from './modules/row'
import * as column from './modules/column'
import * as tabs from './modules/tabs'
const all = {
  grid,
  form,
  row,
  column,
  tabs
}
export default {
  render(props){
	// console.log('props ',props)
    const name = props.$attrs.name
    const component = props.$attrs.component
    if(all[name]?.useMethods&&component?.methods){
      all[name].useMethods&&Object.assign(component.methods,all[name].useMethods(component))
    }
    return all[name]?h(all[name].default,props.$attrs):
    h('view',{style:"line-height:50rpx;height:60rpx;color:#d8d8d8;font-size:25rpx;"},[`(${name})组件不存在`])
  }
}