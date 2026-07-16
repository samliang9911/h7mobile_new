<template>
	<view style="padding: 0 15rpx 150rpx 15rpx;">
		<view class="title">{{ data.bigTitle || data.title }}</view>
		<view class="code-date">
			<text style="color:rgb(67, 149, 255)" @click="openCode">{{ data.code }}</text>
			<text>{{ data.createdDate?.split(' ')?.[0] }}</text>
		</view>
		<table>
			<thead>
				<tr>
					<th colspan="4" class="wrap">{{ data.label }}</th>
				</tr>
				<tr>
					<th class="label">项目名称</th>
					<td colspan="3" class="left wrap">{{ data.projectName }}</td>
				</tr>
				<tr>				
				  <th class="label">描述</th>
				  <td colspan="3" class="left">
				      <div v-for="item in data.describe" :key="item.field">
				        <span style="color:#303133; font-size:25rpx;">
				          {{ item.label }}：
				        </span>
				        <template v-if="typeof item.value === 'boolean'">
				          {{ item.value ? '是' : '否' }}
				        </template>
				        <span v-else-if="item.label === '税率'" :class="/\d/.test(item.value) ? 'field-value number-highlight' : 'field-value'">
				        	{{ parseFloat(item.value) ? parseFloat(item.value).toString().replace(/(\.\d*?)0+$/, '$1') + '%' : item.value }}
				        </span>
						<span v-else :class="/\d/.test(item.value) ? 'field-value number-highlight' : 'field-value'">
							{{ item.value }}
						</span>
				      </div>
				    </td>
				</tr>
				<tr>
					<th class="label">经办人</th>
					<td>{{ data.operator }}</td>
					<th class="label nowrap">申请时间</th>
					<td class="nowrap">{{ data.applyDate }}</td>
				</tr>
				<tr>
					<th class="label">备注</th>
					<td colspan="3" class="left wrap" style="min-height:100rpx">
						{{ data.remark }}
					</td>
				</tr>
				<tr v-for="item in data.extend" :key="item.guid">
					<th class="label">{{ item.label }}</th>
					<td colspan="3" class="left extend" :style="{paddingBottom:item.info.length?'':'100rpx'}">
						<div v-for="i in item.info" :key="i.guid">
							<span>
								<template v-if="i.code==i.content">
									{{ i.code }}
								</template>
								<template v-else>
									{{ i.content }}{{ i.code?`（${i.code}）`:'' }}
								</template>
							</span>
							<div>
								<span class="user">{{ i.name }}</span>
								<span>{{ i.date?.replace(/(:\d+)$/,'') }}</span>
							</div>
						</div>
					</td>
				</tr>
			</thead>
		</table>

		<template v-if="data.naviId==1">
			<up-popup :show="show" @close="show=false">
				<audit v-model="data.audit" />
			</up-popup>
			<up-button type="primary" shape="circle" class="audit" @click="show=true">审核</up-button>
		</template>
	</view>
</template>

<script setup lang="ts">
	import { ref } from 'vue'
	import audit from './audit.vue'
	import { request } from '@/api/autopage/index.ts'
	import {getUrlType} from '@/utils/instrumentType.js' 
	//import {onMounted} from "vue";
	const show = ref(false)

	const data = defineModel<{
		bigTitle : string
		isStretch : boolean
		isCodeLink : boolean
		title : string
		code : string
		createdDate : string
		label : string
		projectName : string
		describe : ({ label : string, field : string, value : string } & Record<string, any>)[]
		operator : string
		applyDate : string
		remark : string
		extend : {
			guid : string
			label : string
			info : { guid : string, code : string, content : string, name : string, date : string }[]
		}[]
		audit : any
		naviId : 1 | 2
	}>({ default: {} })
	
	const getOperationOID = async (code) => {
		return request([
			{
				tag: 'sel',
				tb: 'Fee_Reimbursement',
				field: 'Fee_ReimbursementOID',
				tbAlias: 'T1',
				wh: {
					Filter: 'T1.Code = {Code}',
					Param: { Code: code }
				}
			}
		])
	}

	const getMatPurchaseOperationOID = async (code) => {
		return request([
			{
				tag: 'sel',
				tb: 'Mat_Purchase',
				field: 'Mat_PurchaseOID',
				tbAlias: 'T1',
				wh: {
					Filter: 'T1.Code = {Code}',
					Param: { Code: code }
				}
			}
		])
	}
	
	//获取当前路径后的参数值
	function getParamsUsingURL() {
			  const hash = window.location.hash
			  if (hash && hash.includes('?')) {
			    const hashQuery = hash.split('?')[1]
			    const params = new URLSearchParams(hashQuery)
			    const result = {}
			    for (const [key, value] of params) {
			      result[key] = value
			    }
				return result
			  }
	}		  
			getParamsUsingURL()   
	const openCode = () => {
		
		

		if (data.value?.isCodeLink !== true && data.value?.isCodeLink !== 'true') return
		const code = data.value?.code
		const title = data.value?.title
		let operationOID : any
		
		
		if (title === '申购单流程') {
			console.log('进入申购单流程',title.value)
			//提示报错用了e1
			getMatPurchaseOperationOID(code).then(e => {
				//提示报错用了e1
				//console.log('e0是：----',e[0])//有值
				//console.log('e1是：----',e[1]) //空
				operationOID = e[0].Mat_PurchaseOID
				uni.navigateTo({ url: `/pages/subPackages/autopage/index?Dev_PageConfigOID=3b08a6a8-64c2-410d-a66c-6b9763b6cf34&operationOID=${operationOID}` })
			})
		} else if (title === '费用报销') {
			getOperationOID(code).then(e => {
				operationOID = e[0].Fee_ReimbursementOID
				uni.navigateTo({ url: `/pages/subPackages/autopage/index?Dev_PageConfigOID=ef5641e1-5eb4-4ae5-81bb-930253611dfe&operationOID=${operationOID}` })
			})
		} else if (title === '入职申请表') {
			uni.navigateTo({ url: '/pages/subPackages/autopage/index?Dev_PageConfigOID=84f884be-bfef-49e1-b008-3be512d69fb1&operationOID=784668fc-21c1-4fbc-975c-96f036d07ec7' })
		} else if(data.value.BusinessUrl.includes('/Html/Custom/RichTextToForm/index.html')){
			const result = getParamsUsingURL()
			window.location.href = getUrlType() + `/Html/Custom/RichTextToForm/index.html#/form?&CustomFormOID=70dab5d9-57d3-4c2f-8fe9-97943ce1ac69&w=3&Dev_PageConfigOID=70dab5d9-57d3-4c2f-8fe9-97943ce1ac69&callbackFn=pageCallBack&BusinessKeyOID=${result.BusinessKey}&TaskID=${result.Flow_AssignTaskOID}&FlowID=Flow-2026-000006&InstanceID=${result.InstanceID}&ActivityID=AC-2026-000007_Flow-2026-000006`
		}else {
			uni.navigateTo({ url: '/pages/subPackages/autopage/index?Dev_PageConfigOID=ef5641e1-5eb4-4ae5-81bb-930253611dfe&operationOID=784668fc-21c1-4fbc-975c-96f036d07ec7' })
		}
	}
	//onMounted(() => {
	  
	//  console.log('data.value',data.value)
//	})
</script>

<style scoped lang="scss">
	.title {
		text-align: center;
		font-size: 42rpx;
		color: #55575b;
		height: 100rpx;
		line-height: 100rpx;
		background: white;
	}

	.code-date {
		display: flex;
		justify-content: space-between;
		font-size: 24rpx;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		table-layout: auto;

		th,
		td {
			border: 1.7rpx solid #a9a9a9;
			padding: 18rpx;
			color: #727476;
			font-size: 24rpx;
			font-weight: 500;
			box-sizing: border-box;
			word-break: break-word;
			white-space: normal;
			overflow-wrap: break-word;
			min-width: 120rpx;
		}

		th[colspan="4"] {
			font-size: 32rpx;
			color: #606266;
			height: 88rpx;
		}

		.wrap {
			word-break: break-word;
			white-space: normal;
			overflow-wrap: break-word;
		}

		.nowrap {
			white-space: nowrap;
		}

		.label {
			width: 200rpx;
			min-width: 120rpx;
		}

		td.nowrap,
		th.label {
			width: 150rpx;
		}

		.left {
			text-align: left;
		}

		.extend {
			color: #3f3f3f;
			padding-bottom: 0;

			&>div {
				margin-bottom: 38rpx;
				display: block;
				word-break: break-word;
				overflow-wrap: break-word;
			}

			.user {
				font-size: 28rpx;
				font-family: 隶书;
				margin-right: 20rpx;
			}
		}
	}

	.audit {
		position: fixed;
		bottom: 50rpx;
		width: 90%;
		left: 5%;
	}

	.field-value {
		color: #909399;
		font-size: 23rpx;
	}

	.field-value.number-highlight {
		color: #909399;
		font-size: 23rpx;
		font-weight: bold;
	}
</style>