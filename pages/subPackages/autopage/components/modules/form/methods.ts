/**
 * 操作表单方法
 * @param component 组件实例 
 * @returns 
 */
export default function(component){
  return {
    /**获取字段值 */
    getFieldValue(field){
      return component.data[field]
    },
    /**设置字段值 */
    setFieldValue(field,value){
      component.data[field] = value
    }
  }
}