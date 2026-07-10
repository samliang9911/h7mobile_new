/**
 * 这是一个数据池函数，用于处理各种组件的数据
 * @function DataPool
 * @param {object} object 数据池对象
 * @param {string} object.type 组件类型
 * @param {array} object.jsonData 请求参数
 * @param {boolean} object.Async 设置同步或者异步【默认true异步】
 * @param {string} object.URL 请求地址【默认不填】
 * @param {object} object.config 自定义配置参数【每个组件的自定义参数都不一样】
 * @param {function} object.CustomAjax 自定义Ajax
 * @returns {object} 返回处理好的数据
 */

export default (function () {
  class DataPool {
    //注册组件【起名规范：大写字母开头，驼峰命名法】
    static Model = ["Ajax", "DefaultModule", "Grid", "DataDetail", "Echarts",];
    //公共API参数
    API = { URL: "", Async: true };
    constructor(object = {}) {
      for (let e in this.API) if (e in object) this.API[e] = object[e];
      let type = object.type ?? "DefaultModule";//组件类型
      //如果不传类型就创建所有组件
      if (type) {
        if (DataPool.Model.includes(type)) {
          this[type] = new DefaultModule(this.API)
          //  this[type] = eval(`new ${type}(this.API)`) 
        }
      }
      else DataPool.Model.forEach((type) => { this[type] = eval(`new ${type}(this.API)`) })
    }
  }

	//自定义构造promise类，可以传参使then变同步
	class promise {
		constructor(resolve = () => { }, async = true) {
			this.async = async;
			this.resolve = resolve;
			if (async) this.promise = new Promise(resolve);
			else this.promise = { then: this.then, catch: this.catch };
		}
		then(resolve) {
			let returns;
			if (this.async) returns = this.promise.then(resolve);
			else (this.resolve)(res => { returns = resolve(res) });
			return new promise(res => { res(returns) }, this.async);
		}
		catch(reject) {
			this.promise.catch(reject);
		}
	}

	//Ajax
	class Ajax {
		URL = "";
		json = [];
		Async = true;
		constructor(_this) {
			//公共API参数
			for (let e in _this) if (!(e in this)) this[e] = _this[e];
		}
		/** 主函数 */
		Main(object = {}) {
			let Async = 'Async' in object ? object.Async : this.Async;
			var promises = new promise((resolve, reject) => {
				let newObject = Object.assign({}, { callback: res => resolve(res), reject: rej => reject(rej) }, object)
				this.toAjaxData(newObject)
			}, Async)
			return promises;
		}
		//处理Ajax数据
		toAjaxData(object = {}) {
			let URL = object.URL ? object.URL : this.URL;
			let json = object.json ? object.json : this.json;
			let Async = 'Async' in object ? object.Async : this.Async;
			let AjaxFn = object.CustomAjax || P_Ajax;
			AjaxFn(URL, { json: this.toAjaxJson(json) }, Async, object.callback, object.reject)
		}
		//剔除非请求参数的参数
		toAjaxJson(arr) {
			let API = ["field", "field_CN", "alias", "tb", "wh", "jo", "hj", "ob", "pages", "n_ob", "tol", "tag", "tbAlias", "ChildAlias"];
			if (!arr.map) return arr;
			return arr.map(e => {
				for (let key in e) {
					try { e[key] = JSON.parse(e[key]) } catch (e) { }
				}
				if (e.tag == 'sel') {
					let obj = {};
					for (let key in e) { if (API.includes(key) && e[key]) obj[key] = e[key] }
					return obj;
				}
				return e;
			})
		}
		//获取表别名
		getAjaxAlias(Ajax = {}) {
			return Ajax.alias ? Ajax.alias : (Ajax.tb ? (Ajax.tb.indexOf(' ') == -1 ? Ajax.tb : Ajax.tb.substring(0, Ajax.tb.indexOf(' '))) : '');
		}
		//剔除字段别名
		extractFields(...fieldInfo) {
			const fields = [];
			fieldInfo.forEach(info => {
				if (info && typeof info === 'string') {
					const infoFields = info.split(',').map((field) => {
						const asIndex = field.toLowerCase().indexOf(' as ')
						if (asIndex > -1) {
							return field.substring(asIndex + 4).trim()
						} else if (field.indexOf('.') > -1) {
							return field.substring(field.indexOf('.') + 1).trim()
						} else if (field.indexOf('=') > -1) {
							return field.split('=')[0].trim()
						} else {
							return field.trim()
						}
					});
					fields.push(...infoFields);
				} else if (isObject(info)) {
					fields.push(...Object.keys(info));
				} else if (Array.isArray(info)) {
					fields.push(extractFields(...info));
				}
			});
			return fields;
		}
	}

	class DefaultModule {
		constructor() { }
		/**
		 * 入口函数
		 * @param {object} options 配置对象
		 * @param {Object[]} options.dataList - 数据列表，包含多个数据项。
		 * @param {Object[]} options.colConfig - 列配置对象，用于指定如何显示数据。
		 * @param {Object[]} options.staticData - 静态数据，可能用于填充页面的固定信息。
		 */
		Main({ dataList, colConfig, staticData }) {
			if (dataList) return this.bathApiData({ dataList, colConfig })
			if (staticData) return this.bathStaticData({ staticData, colConfig })
		}
		/**
		 * 洗静态数据
		 * @param {object} options 配置对象
		 * @param {Object[]} options.colConfig - 列配置对象，用于指定如何显示数据。
		 * @param {Object[]} options.staticData - 静态数据，可能用于填充页面的固定信息。
		*/
		bathStaticData({ staticData, colConfig }) {
			// 函数列
			const funcCol = colConfig.filter(col => col.FieldShowMode == 'Function' && col.FieldFunc)
			// 存在自定义函数列
			if (funcCol.length > 0) {
				/**
				 * @param {object} param 传给自定义函数的参数
				 * @param {object} param.data 总数据
				 * @param {object} param.config 总字段配置
				 * @param {object} param.row 当前行数据
				 * @param {object} param.colConfig 当前列配置
				 */
				const param = { data: staticData, config: colConfig, row: null, colConfig: null }
				funcCol.forEach(col => {
					staticData.forEach(row => {
						let customFunc = col.FieldFunc
						if (customFunc) {
							param.row = row
							param['colConfig'] = col
							customFunc = new Function('e', customFunc)
							row[col.field] = customFunc.call(this, param)
						}
					})
				})
			}
			return staticData
		}
		/** 洗数据源动态数据*/
		bathApiData({ dataList, colConfig }) {

			//进入主流程前过滤 dataList，避免空元素
			dataList = (dataList || []).filter(item => item && item.Pub_DataAPI)
			/** 返回数据结果 */
			let result;

			const showData = []

			/** 获取主数据信息 */
			// const mainArr = dataList.filter(item => !item.Pub_DataAPI.Relation || item.Pub_DataAPI.Relation == '0')
			const mainArr = dataList.filter(item => {
			  // 如果 Relation 为 null、undefined、空字符串、'0'，或者根本没有 Relation 属性，都视为主数据源
			  const relation = item.Pub_DataAPI?.Relation;
			  return relation == null || relation === '' || relation === '0' || relation === 0;
			});
			
			
			// 若有多个主数据源，则不处理，直接返回空数组
			if (mainArr.length > 1) return []
			// 主数据、展示数据源 */
			const mainApi = mainArr[0]?.Pub_DataAPI
			const mainData = mainArr[0]?.Items

			// 无列配置直接返回主数据
			if (!colConfig.length) return mainData

			// 轮询数据源
			dataList.forEach(res => {
				// 业务数据；api配置；与主数据源关系：0 或 空：主数据源、1 主子关系、 2 参与者关系；
				const data = res.Items
				const api = res.Pub_DataAPI
				const relation = api?.Relation

				// 数据源别名或表名
				const aliasOrTb = api?.alias || api?.tb
				// 父级Api、主表字段、子表字段
				const { ParentOID } = res.Pub_DataAPI
				// 主子关系:只做两级数据源处理，超过两级不处理
				if (relation == '1' && mainApi.Pub_DataAPIOID == ParentOID) {

					// 子数据
					let subData = data
					// 处理类型：RowToColumn 行转列、Connect 连接、Superposition 叠加、Tree 树
					let processingType = api?.ProcessingType
					if (!processingType) processingType = 'Connect'

					// 不为自定义代码列时 获取当前数据源需要展示的列
					let subFieldList = colConfig.filter(col => col.FieldSelect?.indexOf(aliasOrTb) == 0 && col.ReturnFormat != 'CustomCode').map(c => {
						return { field: c.FieldSelect[1], fieldAs: c.field }
					})

					// 叠加：无明确主子关联
					if (processingType == 'Superposition') {
						showData.push(...subData)
					}
					// 树
					else if (processingType == 'Tree') {

					}
					// 行转列
					else if (processingType == 'RowtoColumn') {

					}
					// 默认连接
					else {
						this.Connect(showData, res, subFieldList)
					}
				}
				//子子数据源处理
				else if (relation == '1' && mainApi.Pub_DataAPIOID != ParentOID) {
					//暂时只处理  默认连接

					// 子数据
					let subData = data
					// 处理类型：RowToColumn 行转列、Connect 连接、Superposition 叠加、Tree 树
					let processingType = api?.ProcessingType
					if (!processingType) processingType = 'Connect'

					// 不为自定义代码列时 获取当前数据源需要展示的列
					let subFieldList = colConfig.filter(col => col.FieldSelect?.indexOf(aliasOrTb) == 0 && col.ReturnFormat != 'CustomCode').map(c => {
						return { field: c.FieldSelect[1], fieldAs: c.field }
					})


					this.Connect(showData, res, subFieldList)
				}
				// 参与者关系不做处理
				else if (relation == '2') {
					// 不为自定义代码列时 获取当前数据源需要展示的列
					let subFieldList = colConfig.filter(col => col.FieldSelect?.indexOf(aliasOrTb) == 0 && col.ReturnFormat != 'CustomCode').map(c => {
						return { field: c.FieldSelect[1], fieldAs: c.field }
					})
					// showData.push(...data)
					this.Connect(showData, res, subFieldList)
				}
				// 其它只能是主数据源
				else {
					/* showData.push(...data.map(e=>{
						return {...e,...colConfig.reduce((a,b)=>(
						(a[b.field] = e[b.FieldSelect[1]]),a
						),{})}
					})) */
					/* console.log('【DefaultModule】处理主数据源，Items数量:', data.length);
					  console.log('【DefaultModule】原始数据样例:', data[0]);
					  */
					  showData.push(...data.map(originalItem => {
					    // 创建完整副本，保留所有原始字段
					    const newItem = { ...originalItem };
					    
					    // 仅当 colConfig 存在且不为空时才应用字段映射
					    if (colConfig && colConfig.length > 0) {
					      colConfig.forEach(col => {
					        if (col.FieldSelect && col.FieldSelect[1]) {
					          // 映射字段，但不覆盖原始字段
					          newItem[col.field] = originalItem[col.FieldSelect[1]];
					        }
					      });
					    }
					    
					    /* console.log('【DefaultModule】处理后数据样例:', newItem); */
					    return newItem;
					  }));
					
					
				}

			});

			// 虚字段列 
			colConfig.forEach(col => {
				if (col.ReturnFormat)
					this.VirtualFormat(showData, col)
				// col.ReturnFormat == 'CustomCode' && col.FieldFunc
			})
			// 函数列
			const funcCol = colConfig.filter(col => col.ReturnFormat == 'CustomCode' && col.FieldFunc)
			// 存在自定义函数列
			if (funcCol.length > 0) {
				// api清单
				const apiList = dataList.map(item => item.Pub_DataAPI)
				// 获取非主数据源、参与者数据源、外键数据字典
				const children = dataList.filter(item => item.Pub_DataAPI.Relation && item.Pub_DataAPI.Relation == '1')
				const actor = dataList.filter(item => item.Pub_DataAPI.Relation && item.Pub_DataAPI.Relation == '2').reduce((obj, res) => {
					const api = res.Pub_DataAPI
					const aliasOrTb = api?.alias || api?.tb
					obj[aliasOrTb] = res.Items
					return obj
				}, {})
				const relationMap = this.getRelation(apiList)
				const childrenMap = this.ParseFKMap(children)
				showData.forEach(row => {
					let paramList = { row }
					relationMap.forEach((val, key) => {
						paramList[key] ??= []
						if (val) {
							let fk = row[val]
							if (fk) paramList[key] = childrenMap[key]?.get(fk) ?? []
						}
						else
							paramList[key] = actor[key]?.Items ?? []
					})
					this.handleCustomCol(row, funcCol, paramList)
				})
			}

			result = showData

			return result;
		}

		// 连接
		Connect(mainData, subInfo, subFieldList) {
			let subLeft = []

			// 主表字段、子表字段
			const { R_MainField, R_ChildField } = subInfo.Pub_DataAPI
			const subData = subInfo.Items
			// 处理其相应主数据的子数据
			subData.forEach(item => {
				// 根据关联字段过滤出相应数据下标
				const index = mainData.findIndex(f => f[R_MainField] === item[R_ChildField])
				if (index > -1) {
					// 查询是有已有关联数据，存在关联数据，则叠加数据
					let left = subLeft.find(s => s[R_MainField] == item[R_ChildField])
					// 轮询此数据要装载的字段
					subFieldList.forEach(fieldItem => {
						// const fieldName = fieldConfig.field;
						//防止表别名获取不到数据
						let field = fieldItem.field.includes('.') ? fieldItem.field.split('.')[1] : fieldItem.field
						if (left) {
							mainData[index][fieldItem.fieldAs] += "," + item[field]
						}
						else {


							// 此处利用对象的浅拷贝使当前对象中的主数据源不会被修改，且当前表格中的主数据相关信息被修改时，主数据源也会被修改
							const sub = { ...mainData[index], [fieldItem.fieldAs]: item[field] }
							mainData[index][fieldItem.fieldAs] = item[field]
							subLeft.push(sub)
						}
					});
				}
			})

		}

		/** 将子数据转为与外键关联数据字典
		 * @param {*} childrenList 子数据清单
		 * @returns 外键字典
		 */
		ParseFKMap(childrenList) {
			let result = {}
			if (!childrenList || childrenList.length == 0) return result
			childrenList.forEach(res => {
				// 数据
				const data = res.Items
				// api配置、主子关系、数据源别名或表名
				const api = res.Pub_DataAPI
				const aliasOrTb = api?.alias || api?.tb
				// 主表字段、子表字段
				const { R_ChildField } = api
				// 数据字典
				result[aliasOrTb] = data.reduce((dataMap, obj) => {
					const fk = obj[R_ChildField]
					// 相应外键数组对象
					if (dataMap.has(fk)) {
						dataMap.get(fk).push(obj);
					} else {
						dataMap.set(fk, [obj]);
					}
					// 聚合式对象数组
					for (let key in obj) {
						if (!dataMap.get(fk)[key]) {
							dataMap.get(fk)[key] = [];
						}
						dataMap.get(fk)[key].push(obj[key])
					}

					return dataMap
				}, new Map())

			})
			return result
		}
		/** 将数组对象中对象附加按属性转的对象数组
		 * @param {object[]} data 
		 * @returns 
		 */
		appendArray(data) {

			if (!Array.isArray(data)) return data
			return Object.assign(data, data.reduce((acc, obj) => {
				for (let key in obj) {
					if (!acc[key]) {
						acc[key] = [];
					}
					acc[key].push(obj[key])
				}
				return acc
			}, {}))
		}
		/** 根据dataApi数组获取与主表关系字典
		 * @param {*} dataApiList 
		 * @returns 
		 */
		getRelation(dataApiList) {
			if (!Array.isArray(dataApiList))
				return new Map()
			const notMasterApi = dataApiList.filter(api => api.Relation)
			const result = new Map(notMasterApi.map(item => [item?.alias || item?.tb, item?.R_MainField]))
			return result
		}
		/** 处理行的自定义列数据
		 * @param {*} row 
		 * @param {*} funcCol 
		 * @param {*} paramList 
		 */
		handleCustomCol(row, funcCol, paramList) {
			// 自定义函数
			funcCol.forEach(col => {
				let customFunc = col.FieldFunc
				if (customFunc) {
					paramList['colConfig'] = col
					customFunc = new Function('e', customFunc)
					row[col.field] = customFunc.call(this, paramList)
				}
			})
		}
		//一对多转多（连接处理）
		toMany(Data, ConnectTb, ConnectData) {
			let newData = [];
			const mainTb = Data.find(item => (item.Pub_DataAPI.Relation == null || item.Pub_DataAPI.Relation == '') || item.Pub_DataAPI.ParentOID == '00000000-0000-0000-0000-000000000000')

			let Parent = Data.find(item => item.Pub_DataAPI.Pub_DataAPIOID == ConnectTb.Pub_DataAPI.ParentOID)//找到子数据源对应的父数据源
			let obj = {}
			if (ConnectData) {
				ConnectData.forEach(mainData => {
					const childSource = ConnectTb.Items.filter(item => item[ConnectTb.Pub_DataAPI.R_ChildField] === mainData[ConnectTb.Pub_DataAPI.R_MainField])
					if (childSource.length > 0) {
						childSource.map(el => newData.push(Object.assign({}, mainData, el)))
					} else {
						newData.push(mainData)
					}
				})
			} else {
				mainTb.Items.forEach(mainData => {
					const childSource = ConnectTb.Items.filter(item => item[ConnectTb.Pub_DataAPI.R_ChildField] === mainData[ConnectTb.Pub_DataAPI.R_MainField])
					if (childSource.length > 0) {
						childSource.map(el => newData.push(Object.assign({}, mainData, el)))
					} else {
						newData.push(mainData)
					}
				})
			}


			if (Parent.Pub_DataAPI.Relation != '2') {
				obj.ParseData = newData
			} else {
				obj[ConnectTb.Pub_DataAPI.tbAlias ? ConnectTb.Pub_DataAPI.tbAlias : ConnectTb.Pub_DataAPI.tb] = newData
			}
			let page = { ...mainTb }
			delete page.Items; delete page.Pub_DataAPI; delete page.Pub_DataAPIConfig
			obj.MainPageInfo = page;
			return obj;
		}
		//一对多合成一条数据 （嵌套处理）
		toMerge(Data, Tb, MergeData) {
			let newData = [];
			const mainTb = Data.find(item => (item.Pub_DataAPI.Relation == null || item.Pub_DataAPI.Relation == '') || item.Pub_DataAPI.ParentOID == '00000000-0000-0000-0000-000000000000')
			let Parent = Data.find(item => item.Pub_DataAPI.Pub_DataAPIOID == Tb.Pub_DataAPI.ParentOID)
			let obj = {}
			Parent.Items.forEach(mainData => {
				const childSource = Tb.Items.filter(element => element[Tb.Pub_DataAPI.R_ChildField] == mainData[Tb.Pub_DataAPI.R_MainField])
				if (Tb.Pub_DataAPIConfig.MergeType === 'Array') {
					this.toArray(childSource, mainData, newData)
				} else if (Tb.Pub_DataAPIConfig.MergeType === 'String') {
					this.toString(childSource, mainData, newData)
				} else if (Tb.Pub_DataAPIConfig.MergeType === 'Wrap') {
					this.toWarp(childSource, mainData, newData)
				}
			});

			if (Parent.Pub_DataAPI.Relation != '2') {
				obj.ParseData = newData
			} else {
				obj[Parent.Pub_DataAPI.tbAlias ? Parent.Pub_DataAPI.tbAlias : Parent.Pub_DataAPI.tb] = newData
			}
			let page = { ...mainTb }
			delete page.Items; delete page.Pub_DataAPI; delete page.Pub_DataAPIConfig
			obj.MainPageInfo = page;
			return obj
		}
		//一对多合成一条数据 ---处理成数组的形式
		toArray(childSource, mainData, newData) {
			if (childSource.length > 0) {
				const newVal = childSource.reduce((acc, curr) => {
					Object.keys(curr).forEach(key => {
						if (acc[key]) {
							if (Array.Array.isArray(acc[key])) {
								acc[key].push(curr[key]);
							} else {
								acc[key] = [acc[key], curr[key]];
							}
						} else {
							acc[key] = [curr[key]];
						}
					});
					return acc;
				}, {});
				Object.keys(mainData).forEach(key => {
					if (newVal[key]) {
						newVal[key] = newVal[key].concat(mainData[key]);
					} else {
						newVal[key] = mainData[key];
					}
				})
				newData.push(newVal);
			} else {
				newData.push(mainData);
			}
		}
		//一对多合成一条数据 ---处理成逗号分割的形式
		toString(childSource, mainData, newData) {
			if (childSource.length > 0) {
				const newVal = childSource.reduce((acc, curr) => {
					Object.keys(curr).forEach(key => {
						if (acc[key]) {
							acc[key] != curr[key] ? acc[key] += `,${curr[key]}` : acc[key] = acc[key]
						} else {
							acc[key] = `${curr[key]}`
						}

					});
					return acc;
				}, {});
				Object.keys(mainData).forEach(key => {
					if (newVal[key]) {
						newVal[key] += `,${mainData[key]}`
					} else {
						newVal[key] = mainData[key]
					}
				})
				newData.push(newVal);
			} else {
				newData.push(mainData);
			}
		}
		//一对多合成一条数据 ---处理成换行的形式
		toWarp(childSource, mainData, newData) {
			if (childSource.length > 0) {
				const newVal = childSource.reduce((acc, curr) => {
					Object.keys(curr).forEach(key => {
						if (acc[key]) {
							acc[key] != curr[key] ? acc[key] += `\r\n${curr[key]}` : acc[key] = acc[key]
						} else {
							acc[key] = `${curr[key]}`
						}

					});
					return acc;
				}, {});
				Object.keys(mainData).forEach(key => {
					if (newVal[key]) {
						newVal[key] += `\r\n${mainData[key]}`
					} else {
						newVal[key] = mainData[key]
					}
				})
				newData.push(newVal);
			} else {
				newData.push(mainData);
			}
		}
		//数据堆叠处理（叠加处理）
		Superposition(Data, mainTb) {
			const field = mainTb.Pub_DataAPI.field.split(',')
			Data.Items.forEach(item => {
				field.forEach((el, index) => {
					item[el] = item[Object.keys(item)[index]]
				})
				const keys = Object.keys(item);
				// 遍历所有键，并删除不在 field 中的键
				keys.forEach(key => {
					if (!field.includes(key)) {
						delete item[key];
					}
				});
			})
			return { ParseData: [...mainTb.Items, ...Data.Items] };

		}
		/**
		 * 行转列处理
		 * @param {Array} Data 处理方式为行转列的子数据源（无论是主数据源还是参与者数据源的子数据源）
		 * @param {object} Tb 行转列处理的父数据源 
		*/
		RowtoColumn(Data, Tb) {
			/*
					// 数据处理方式为 连接
					if (this.config.some(i => i.ProcessingType == 'Connect')) {
						// keepSource：保持原始值的状态，被某些功能所依赖，比如编辑状态、还原数据等（开启后影响性能，具体取决于数据量）
						this.GridConfig.keepSource = false
						// 设置唯一主键字段
						this.GridConfig.rowConfig.keyField = '_OID'
						// 单元格合并方法
						this.GridConfig.spanMethod = ({ row, _rowIndex, column, visibleData }) => {
							const cellValue = row[column.field]
							if (cellValue) {
								const prevRow = visibleData[_rowIndex - 1]
								let nextRow = visibleData[_rowIndex + 1]
								if (prevRow && prevRow[column.field] === cellValue && prevRow[PrimaryKey] === row[PrimaryKey]) {
									return { rowspan: 0, colspan: 0 }
								} else {
									let countRowspan = 1
									while (nextRow && nextRow[column.field] === cellValue && nextRow[PrimaryKey] === row[PrimaryKey]) {
										nextRow = visibleData[++countRowspan + _rowIndex]
									}
									if (countRowspan > 1) {
										return { rowspan: countRowspan, colspan: 1 }
									}
								}
							}
						}
					}
				    
					// 表格装载数据; ProcessingData.ParseData 解析的数据
					this.GridData = reactive([...ProcessingData.ParseData])
		    
					// 有行转列配置时 更新表格列配置
					if (ProcessingData.RowtoColInFo && Object.keys(ProcessingData.RowtoColInFo)) {
						const { columns } = useConfig(this.element.Config, {
							RowtoColInFo: ProcessingData.RowtoColInFo
						}).GridConfig
						if (columns) this.GridConfig.columns = columns
					}*/
			let RowtoColInFo = {}
			Data.map(item => {
				const showField = item.Pub_DataAPIConfig.Field //数据源中哪个字段需要转化为主数据或者参与者数据源的字段
				const value = item.Pub_DataAPIConfig.Value // 数据源中哪个字段需要转化为主数据或者参与者数据源的字段的值
				const showFieldChinese = item.Pub_DataAPIConfig.FieldChinese
				const R_ChildField = item.Pub_DataAPI.R_ChildField
				const R_MainField = item.Pub_DataAPI.R_MainField

				RowtoColInFo[item.Pub_DataAPI.alias || item.Pub_DataAPI.tb] = []
				item.Items.map(el => {
					const hasTargetValue = RowtoColInFo[item.Pub_DataAPI.alias || item.Pub_DataAPI.tb].some(obj => obj.field == el[showField]);
					if (!hasTargetValue) {
						RowtoColInFo[item.Pub_DataAPI.alias || item.Pub_DataAPI.tb].push({ 'field': el[showField], 'title': el[showFieldChinese] })
					}
				})
				// item.Items.map(el=>{
				Tb.Items.forEach(mainItem => {
					RowtoColInFo[item.Pub_DataAPI.alias || item.Pub_DataAPI.tb].forEach((e, index) => {
						const data = item.Items.filter(childItem => childItem[R_ChildField] == mainItem[R_MainField])//找到这个列有多少个行数据信息
						data.map(c => {
							mainItem[c[showField]] = c[value]
						})
						if (!mainItem[e.field]) mainItem[e.field] = undefined
					})
				})
				// })
			})
			return { ParseData: Tb.Items, RowtoColInFo }
		}
		/** 虚字段返回格式 */
		VirtualFormat(DataList, fieldConfig) {

			// 解构属性，fieldConfig取值，
			const { ReturnFormat, field, IsVirtualField } = fieldConfig;
			//是否启用虚字段
			if (!IsVirtualField)
				return

			//判断返回格式
			if (ReturnFormat === 'Max') {
				//返回子数据源某个数字类型字段最大值
				DataList = DataList.map(valItem => {
					if (valItem[field]) {
						let valArr = String(valItem[field]).split(',')
						const Max = max(valArr)
						valItem[field] = Max
					}
					return valItem
				})

			}
			else if (ReturnFormat === 'Min') {
				//返回子数据源某个数字类型字段最小值
				DataList = DataList.map(valItem => {
					if (valItem[field]) {
						let valArr = String(valItem[field]).split(',')
						const Min = min(valArr)
						valItem[field] = Min
					}
					return valItem
				})
			}
			else if (ReturnFormat === 'Avg') {
				//返回子数据源某个数字类型字段平均值
				DataList = DataList.map(valItem => {
					if (valItem[field]) {
						let valArr = String(valItem[field]).split(',')
						const Avg = avg(valArr, valArr.length)
						// **优化平均值显示：保留2位小数**
						valItem[field] = Avg;

					}
					return valItem
				})
			}
			else if (ReturnFormat === 'Sum') {
				//返回子数据源某个数字类型字段总值
				DataList = DataList.map(valItem => {
					if (valItem[field]) {
						//获取总值
						const sum = String(valItem[field])?.split(",").reduce((acc, itemObj) => {
							return acc + Number(itemObj)
						}, 0)
						valItem[field] = sum
					}
					return valItem
				})
			}
			else if (ReturnFormat === 'LineWrapping') {
				//返回子数据源某个字段换行拼接
				DataList = DataList.map(valItem => {
					if (valItem[field]) {
						// 提取字段值，并用 `\n` 连接
						valItem[field] = String(valItem[field]).split(",")
							.join('\n'); // 使用换行符拼接
					} else {
						// 如果 children 为空，则赋值为空字符串
						valItem[field] = '';
					}
					return valItem;
				});
			} else if (ReturnFormat === 'CustomCode') {
				//返回自定义代码

			} else if (ReturnFormat === 'First') {
				//返回子数据的第一条
				DataList.map(valItem => {
					if (valItem[field]) {
						valItem[field] = String(valItem[field]).split(",")[0]
					}
					return valItem
				})

			}
		}
	}
	/** 表格数据处理*/
	class Grid {
		Main({ dataList, colConfig, staticData }) {
			let data = {
				dataList,
				staticData,
				colConfig: (colConfig.map(({ field, params }) => {
					let obj = {};
					if (field) obj['field'] = field;
					if (params?.FieldFunc) obj['FieldFunc'] = params.FieldFunc;
					if (params?.FieldSelect) obj['FieldSelect'] = params.FieldSelect;
					if (params?.ReturnFormat) obj['ReturnFormat'] = params.ReturnFormat;
					if (params?.IsVirtualField) obj['IsVirtualField'] = params.IsVirtualField
					return obj;
				}))
			};
			return new DefaultModule().Main(data)
		}
	}
	/**  详情数据处理（可用于 Form 和 Card 等）*/
	class DataDetail {
		Main({ dataList, colConfig, staticData }) {
			let data = {
				dataList,
				staticData,
				colConfig: colConfig.map(({ FieldName_En, Config, IsVirtualField }) => {
					let obj = {}
					if (FieldName_En) obj['field'] = FieldName_En
					if (Config?.FieldFunc) obj['FieldFunc'] = Config.FieldFunc
					if (Config?.FieldSelect) obj['FieldSelect'] = Config.FieldSelect.split('.')
					if (Config?.ReturnFormat) obj['ReturnFormat'] = Config.ReturnFormat
					if (IsVirtualField) obj['IsVirtualField'] = IsVirtualField
					return obj;
				})
			}
			return new DefaultModule().Main(data)
		}
	}

	class Echarts {
		Main() {

		}
		generateOption(data, config) {
			// 1. 提取 x 轴的数据（按照config.x字段），保证顺序和唯一性
			const xSet = new Set();
			const xAxisData = [];
			data.forEach(item => {
				const xValue = item[config.x];
				if (!xSet.has(xValue)) {
					xSet.add(xValue);
					xAxisData.push(xValue);
				}
			});

			// 2. 提取系列（legend）名称（按照config.z字段）
			const seriesSet = new Set();
			const seriesNames = [];
			data.forEach(item => {
				const seriesName = item[config.z];
				if (!seriesSet.has(seriesName)) {
					seriesSet.add(seriesName);
					seriesNames.push(seriesName);
				}
			});

			// 3. 构建每个系列的数据映射：seriesName -> { xValue: yValue }
			const seriesDataMap = {};
			seriesNames.forEach(name => {
				seriesDataMap[name] = {};
			});
			data.forEach(item => {
				const seriesName = item[config.z];
				const xValue = item[config.x];
				const yValue = item[config.y];
				seriesDataMap[seriesName][xValue] = yValue;
			});

			// 4. 根据 xAxisData 的顺序，为每个系列构造数据数组
			const series = seriesNames.map(name => {
				const seriesData = xAxisData.map(x => {
					// 若某个系列在对应 x 轴值没有数据，则返回 null（或其它默认值）
					return seriesDataMap[name][x] !== undefined ? seriesDataMap[name][x] : null;
				});
				return {
					name: name,
					type: "line",
					stack: "Total",
					data: seriesData
				};
			});

			// 5. 构造option对象
			const option = {
				title: {
					text: "Stacked Line"
				},
				tooltip: {
					trigger: "axis"
				},
				legend: {
					data: seriesNames
				},
				grid: {
					left: "3%",
					right: "4%",
					bottom: "3%",
					containLabel: true
				},
				toolbox: {
					feature: {
						saveAsImage: {}
					}
				},
				xAxis: {
					type: "category",
					boundaryGap: false,
					data: xAxisData
				},
				yAxis: {
					type: "value"
				},
				series: series
			};

			return option;
		}
		convertToCustomFormat(data, config) {
			// 提取x轴（week）数据
			const xSet = new Set();
			const xAxisData = [];
			data.forEach(item => {
				const xValue = item[config.x];
				if (!xSet.has(xValue)) {
					xSet.add(xValue);
					xAxisData.push(xValue);
				}
			});

			// 提取系列名称（people）
			const seriesSet = new Set();
			const seriesNames = [];
			data.forEach(item => {
				const seriesName = item[config.z];
				if (!seriesSet.has(seriesName)) {
					seriesSet.add(seriesName);
					seriesNames.push(seriesName);
				}
			});

			// 根据x轴数据顺序，构建每个系列的数据
			const result = {
				x: xAxisData,
				data: seriesNames.map(name => {
					const seriesData = xAxisData.map(x => {
						const dataForX = data.find(item => item[config.z] === name && item[config.x] === x);
						return dataForX ? dataForX[config.y] : null; // 若没有数据则返回null
					});
					return {
						y: seriesData,
						z: name
					};
				})
			};

			return result;
		}
		formatDataToOption(data) {
			// 获取x轴的类别（即星期几）
			const xAxisData = data.x;

			// 提取series数据，按z字段分组
			const seriesData = data.data.map(item => ({
				name: item.z,
				type: 'line',
				stack: 'Total',
				data: item.y
			}));

			// 构造最终的option对象
			const option = {
				tooltip: {
					trigger: 'axis'
				},
				legend: {
					data: data.data.map(item => item.z)
				},
				grid: {
					left: '3%',
					right: '4%',
					bottom: '3%',
					containLabel: true
				},
				toolbox: {
					feature: {
						saveAsImage: {}
					}
				},
				xAxis: {
					type: 'category',
					boundaryGap: false,
					data: xAxisData
				},
				yAxis: {
					type: 'value'
				},
				series: seriesData
			};

			return option;
		}
	}

	/** 主函数 */
	function Main(object = {}) {
    
		let result
		const type = object.type ?? "DefaultModule";
		// 构造实例对象
		if (this instanceof Main) {
			if (type) {
				let a = new DataPool(object);
				return a[type];
			}
			result = new DataPool(object);
		}
		else
			result = new DataPool(object)[type].Main(object);
		return result;
	}
	return Main;
})();