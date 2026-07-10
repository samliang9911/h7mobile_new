/**请求sql */
/**请求sql */
export type queryApi = {
  /**操作关键字 */
  tag:'sel'|'add'|'upd'|'del',
  /**表名 */
  tb: string,
  /**字段 */
  field: string|{[key:string]:any}[],
  /**过滤 */
  wh?:{
    /** 
     * 过滤条件【每个关键字都需空格隔离】 
     * 
     * 例子：`Code = {Code} AND Name like {Name}`
     * */
    Filter:string,
    /**
     * 过滤参数
     * 
     * 例子：`{Code:'123',Name:'张三'}`
     */
    Param:{[key:string]:any}
  },
  [key:string]:any
}
/**字段配置 */
export type FieldConfig = {
  /**主键 */
  guid:string
  /**字段名 */
  field:string
  /**标签名 */
  label:string
  /**组件类型 */
  type:string
  /**是否必填 */
  required?:boolean
  /**是否禁用 */
  disabled?:boolean
  /**字段事件 */
  event?:FieldEvent
  /**组件内置属性 */
  [key:string]:any
}
/**字段事件 */
export type FieldEvent = {
  /**仅当 modelValue 改变时,当输入框失去焦点或用户按Enter时触发 */
  onChangeBefore?:string
  /**选择页面打开前触发(可修改选择页面参数) */
  onPageOpenBefore?:string
}
/**组件配置 */
export type CompConfig = {
  /**唯一标识符 */
  guid:string,
  /**组件名称 */
  name:string,
  /**组件数据 */
  data?:any,
  /**组件标题 */
  title?:string,
  /**组件配置 */
  config?:any
  /**组件请求 */
  request?:Promise<any>
  /**组件内置属性 */
  [key:string]:any
}
export type AllCleansFunc = {
  [key:string]:(data:CompConfig,config:{
    /**当前页面配置OID */
    operationOID?:string
    /**组件数据 */
    component:{[key:string]:any},
    /**表单配置 */
    formConfig:{
      /**表单字段配置 */
      Dev_PageField:{[key:string]:any}[]
      /**表单关联代码表 */
      Sys_CodeValue:{[key:string]:any}[]
    },
    /**自定义事件 */
    customEvent:{
      /**唯一主键 */
      [key:string]:{
        /**组件按钮事件 */
        button:{[key:string]:any}
        /**组件事件 */
        component:{
          /**挂载前事件 */
          onCreated?:string
          /**挂载后事件 */
          onMounted?:string
        }
        /**字段事件 */
        field:{
          [key:string]:FieldEvent
        }
      }
    }
  })=>CompConfig
}