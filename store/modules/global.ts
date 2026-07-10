// import { uniqBy } from 'lodash-es'
import { defineStore } from 'pinia'
import { reactive } from 'vue';
// import { useConfig } from '@/hooks'
/* import { pinia } from '@/store'
import { extractFields, isObject, jsonParse } from '@/utils/index.js' */

export const useGlobalStore = defineStore({
  id: 'global',
  state: () => ({
    Data: [],
    /**页面配置 */
    Dev_PageConfig: {},
    /**页面组件 */
    Dev_PageComponent: [],
    /**所有数据源 */
    Pub_DataAPI: [],
    /**所有组件字段信息*/
    Dev_PageField: [],
    /**所有按钮信息 */
    Dev_PageBotton: [],
    /**所有数据源字段信息 */
    Sys_FieldInfo: [],
    /** 所有组件的附件配置 */
    Pub_FileConfig: [],
    /** 所有组件的扩展字段配置 */
    Cus_Config: [],
    /** 业务流程类别(领域) */
    Flow_BusinessType: {},
    /** 业务流程 */
    flowList: [{ FlowID: '', FlowName: '无权限启动流程' }],
    /** 当前页面选中的流程ID */
    flow: { FlowID: '', FlowName: '无权限启动流程' },
    /** 当前业务流程状态 */
    BusinessState: null,
    /** 当前是否为附件上传节点 */
    IsFileCanUpdate: false,
    /** 业务页面是否处于只读状态 */
    BPReadOnly: false,
    /** 一人多岗 */
    Sys_Post_PER_Map: [],
    /**所有组件的实例 */
    refList: {},
    /**所有面板实例 */
    panelList: {},
  }),
  getters: {
    /** 获取页面配置 */
    getPageConfig: (state) => {
      return state.Dev_PageConfig
    },
    /**获取页面所有组件信息 */
    getPageComponents: (state) => {
      return state.Dev_PageComponent
    },
    /** 获取所有数据源 */
    getDataAPI: (state) => {
      return state.Pub_DataAPI
    },
    /** 根据数据源OID获取数据源 */
    getDataAPIByOID: (state) => {
      return (DataAPIOID) => {
        return state.Pub_DataAPI.find((item) => item.Pub_DataAPIOID === DataAPIOID)
      }
    },
    /** 获取页面所有按钮信息 */
    getPageButton: (state) => {
      return state.Dev_PageBotton
    },
    /** 根据组件OID获取按钮信息 */
    getPageButtonByCompOID: (state) => {
      return (componentOID) => {
        return state.Dev_PageBotton.filter((item) => item.Dev_PageComponent_FK === componentOID)
      }
    },
    /** 根据组件名称获取指定组件信息
     * @param {string} componentName 组件名称
     */
    getPageComponentByName() {
      return (componentName) => {
        return this.getPageComponents.find((item) => item.Name === componentName)
      }
    },
    /** 根据数据源名称获取组件信息 */
    getComponentBySource: (state) => {
      return (sourceName) => {
        if (sourceName) {
          const dataApi = state.Pub_DataAPI.find(d => d.alias == sourceName || d.tb == sourceName);
          const component = state.Dev_PageComponent.find(p => p.Dev_PageComponentOID == dataApi.BusinessKey)
          return component
        }
      }
    },
    /** 根据OID获取组件信息
     * @param {string} componentOID
     */
    getPageComponentByOID() {
      return (componentOID) => {
        return this.getPageComponents.find((item) => item.Dev_PageComponentOID === componentOID)
      }
    },
    /** 根据组件OID获取组件的数据源信息 */
    getDataAPIByComponentOID() {
      return (componentOID) => {
        return this.getDataAPI.filter(item => item.BusinessKey === componentOID)
      }
    },
    /** 获取所有自定义方法 */
    getCustomMethods: (state) => {
      return state.Dev_PageConfig.JSCode || {}
    },
    /** 获取指定的自定义方法
     * @param {string} componentOID   组件OID
     * @param {string} eventHandle    事件名称  例: onCreated  所有事件名称请前往 other/eventList/ 下的文件查看
     * @param {string} [target]       所在存储对象 'component' | 'field' | 'table' | 'tree' | 'button'
     * @param {string} [fieldName]    当target为field时,需要指定字段名称
     */
    getCustomMethod() {
      return (componentOID, eventHandle, target, fieldName) => {
        const methods = this.getCustomMethods?.[componentOID]
        if (
          !methods ||
          (target && !methods[target]) ||
          (!target && !methods[eventHandle]) ||
          (fieldName && !methods[target][fieldName]) ||
          (!fieldName && target && !methods[target][eventHandle])
        ) {
          return ''
        }
        return fieldName
          ? methods[target][fieldName][eventHandle]
          : (target ? methods[target][eventHandle] : methods[eventHandle]);
      }
    },
    /** 根据组件OID获取组件字段信息
     */
    getComponentFields() {
      return (componentOID) => {
        return this.Dev_PageField.filter((item) => item.Dev_PageComponent_FK === componentOID).map((item) => ({
          ...item,
          Config: jsonParse(item.Config),  //字段的配置参数，深拷贝
          value: void 0, // 添加一个初始值为空的value属性
          configAll: item  //组件下字段的配置集合
        }))
      }
    },
    /** 当表数据源设置了返回别名(alias)之后 添加与真实表名的映射关系
     * @example
     * console.log(this.tableNameMap)
     * // 输出 { DataAPI1: 'DataAPI', DataAPI2: 'DataAPI' }
     */
    tableNameMap: (state) => {
      const map = new Map()
      state.Pub_DataAPI.forEach((item) => map.set(item.alias || item.tb, item.tb))
      return map
    },
    /** 数据源归属组件字典，通过数据源名称获取组件名称
     * @returns 
     */
    componentNameMap: (state) => {
      const map = new Map()
      state.Pub_DataAPI.forEach((item) => map.set(item.alias || item.tb, state.Dev_PageComponent.find(c => c.Dev_PageComponentOID === item.BusinessKey)?.Name))
      return map
    },
    /** 获取流程选项 */
    getFlowList: (state) => {
      return state.flowList
    },
    /** 是否业务页面 */
    IsBusinessPage: (state) => {
      return !!state.Dev_PageConfig.IsBusinessPage
    },
    /** 是否选择页面 */
    IsChoosePage: (state) => {
      return !!state.Dev_PageConfig.IsChoosePage
    },
    /** 选择页面是否多选 */
    IsCheck: (state) => {
      return !!(state.Dev_PageConfig.BusinessCategory === 'check')
    }
  },
  actions: {
    /**初始化 页面配置|页面组件|组件数据源|页面字段 */
    init(data) {
      // 设置页面配置
      const PageConfig = data.Dev_PageConfig.Items[0]
      const parsed = jsonParse(PageConfig?.JSCode)
      PageConfig.JSCode = isObject(parsed) ? parsed : {}
      PageConfig.config = PageConfig.config ? jsonParse(PageConfig.config) : null
      PageConfig.VisualLayout = jsonParse(PageConfig.VisualLayout)
      this.Dev_PageConfig = PageConfig
      //设置页面组件
      this.Dev_PageComponent = data.Dev_PageComponent.Items
      //设置组件数据源 为所有数据源加上主键 同时转换 jo wh 为对象
      this.Pub_DataAPI = data.Pub_DataAPI.Items.map(item => {
        const PrimaryKey = item.tb + 'OID'
        item.jo = item.jo ? jsonParse(item.jo) : []
        item.wh = item.wh ? jsonParse(item.wh) : {}
        item.groupBy = item.groupBy ? jsonParse(item.groupBy) : []
        item.oField = item.oField ? jsonParse(item.oField) : {}
        item.ChildAlias = item.ChildAlias ? jsonParse(item.ChildAlias) : []
        if (!item.groupBy.length && !extractFields(item.field).map(item => item.toLocaleLowerCase(), item.oField).includes(PrimaryKey.toLocaleLowerCase())) {
          item.field += ',' + `${item.tbAlias ? `${item.tbAlias}.` : ''}${PrimaryKey}`
          item.FieldName_CN += '主键'
        }
        return item
      })
      // 设置所有数据源tb的字段
      this.Sys_FieldInfo = data.Sys_FieldInfo.Items
      // 设置页面按钮
      this.Dev_PageBotton = data.Dev_PageBotton.Items.map(item => {
        if (item.BottonFunction === 'changeBusinessState' && !item.BusinessState) item.BusinessState = '1'
        return item
      })
      // 按钮配置
      this.Dev_PageBotton.forEach(item => item.Config = useConfig(item.Config).ButtonConfig)
      // 设置页面字段
      this.Dev_PageField = data.Dev_PageField.Items
      // 初始化附件配置
      this.Pub_FileConfig = data.Pub_FileConfig.Items
      this.Dev_PageComponent.forEach(item => {
        item.fileConfig = this.Pub_FileConfig.filter(config => config.BusinessKey === item.Dev_PageComponentOID)
        item.fileDataApi = []
        item.extendDataApi = []
      })
      // 设置扩展字段配置
      this.Cus_Config = data.Cus_Config.Items
      // 业务流程
      this.Flow_BusinessType = data.Flow_BusinessType.Items[0]
      // 一人多岗
      this.Sys_Post_PER_Map = data.Sys_Post_PER_Map.Items
    },
    /**保存组件实例到RefList */
    registerToRefList(componentName, that) {
      this.refList[componentName] = that
    },
    /**保存面板组件到RefPanelList */
    registerToRefPanelList(that) {
      that.forEach(item => {
        this.panelList[item.Name] = reactive(item)
      })
    },
    /**从refList中删除组件实例 */
    unregisterFromRefList(componentName) {
      delete this.refList[componentName]
    },
    /** 根据表名获取表字段信息
     * @param {*} tableName
     */
    getFieldInfoByTableName(tableName) {
      return this.Sys_FieldInfo.filter((item) => item.TableName === tableName)
    },
    /** 追加字段信息
     * @param {any[]} fieldInfo
     */
    appendFieldInfo(fieldInfo) {
      this.Sys_FieldInfo = uniqBy([...this.Sys_FieldInfo, ...fieldInfo], 'Sys_FieldInfoOID')
    },
    /** 根据组件OID获取扩展字段字段配置 */
    getCusConfigByComOID(ComponentOID) {
      return this.Cus_Config.filter(item => item.Class_FK === ComponentOID)
    },
    addFlowList(list) {
      this.flowList.unshift(...list)
    }
  }
})

// 使pinia可以在组件外使用 如工具类的方法中
export function useGlobalStoreHook() {
  return useGlobalStore(store)
}
