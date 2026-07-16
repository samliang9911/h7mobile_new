import get from '@/api/autopage'
import { defineStore } from 'pinia'
import { CompConfig } from '@/api/autopage/indexTypes'
export default (id)=>{
  return defineStore('autoPage-'+id, {
    state: () => ({
      /**页面数据 */
      value:[] as CompConfig[],
      /**页面组件 */
      component:[] as CompConfig[],
      /**操作OID */
      operationOID:''
    }),
    actions: {
      /**初始数据 */
      async init(BusinessKey:string,operationOID?:string){
        this.operationOID = operationOID
        // this.value.splice(0,this.value.length)
        // this.component.splice(0,this.component.length)
        // this.value.push(...await get(BusinessKey,id))
        // if(!this.value.length)this.value.push(...await get(BusinessKey))
      }
    },
  })()
}

export const useGlobalStoreHook = defineStore('globalParams', {
  state: () => ({
    IsBusinessPage: true,
	/**所有组件的实例 */
	refList: {},
	/**页面组件 */
	Dev_PageComponent: [],
	/**所有数据源 */
	Pub_DataAPI: [],
  }),
  
  actions: {
	//初始化
	init(data){
		this.Dev_PageComponent = data[1].Dev_PageComponent
	},
    // 设置 IsBusinessPage 的方法
    setIsBusinessPage(value: boolean) {
      this.IsBusinessPage = value
    },
	/**保存组件实例到RefList */
	registerToRefList(componentName, that) {
	  this.refList[componentName] = that
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
  }
})


export const useModulesStore = defineStore({
	id: 'moudles',
	state: ()=>({
		/**原来数据对象 */
		    modules: {},
		    /**当前数据对象 */
		    curModules: {},
		    /**增删改对象 */
		    model: {},
		    /**文件模块数据 */
		    fileModules: {}, // 文件模块数据
	}),
	getters: {
	  tableNameMap: (state) => {
	    return useGlobalStoreHook().tableNameMap
	  }
	},
	actions: {
		/** 
		     * 追加当前数据
		     * @param {string} key          数据源别名或者表名
		     * @param {Array|object}  data  数据
		     * @param {boolean}  isUpdate   是否更新增删改模型
		     */
		addCurrentData(key, data, isUpdate) {
		  this.curModules[key] ??= []
		  if (Array.isArray(data)) {
		    this.curModules[key].push(...data)
		  } else {
		    this.curModules[key].push(data)
		  }
		// if (isUpdate === true) this.updateModel(key)
		},
		/**
		 * 追加文件数据
		 * @param {string} key          数据源别名或者表名
		 * @param {Array|object}  data  数据
		 * @param {boolean}  isUpdate   是否更新增删改模型
		 */
		addFileData(key, data, isUpdate) {
		  this.fileModules[key] ??= []
		  if (Array.isArray(data)) {
		    this.fileModules[key].push(...data)
		  } else {
		    this.fileModules[key].push(data)
		  }
		},
		removeFileData(key, oid) {
		  if (!this.fileModules[key]) return
		  this.fileModules[key] = this.fileModules[key].filter((item: any) => item.Id !== oid)
		},
		getFileData(key) {
		  return this.fileModules[key] || []
		},
		setFileData(key, data) {
		  this.fileModules[key] = data
		},
		removeCurrentData(key, oid) {
		  if (!this.curModules[key]) return
		  this.curModules[key] = this.curModules[key].filter((item: any) => item.OID !== oid && item[key + 'OID'] !== oid)
		},
		getCurrentData(key) {
		  return this.curModules[key] || []
		},
		setCurrentData(key, data) {
		  this.curModules[key] = data
		},
	}
	
})