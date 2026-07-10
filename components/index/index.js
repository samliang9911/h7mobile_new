import { ref } from 'vue';

//待办执行结果
const taskResultList = ref([
	{name: 'Ignored', value: '已忽略'},
	{name: 'UnProcessed', value: '未处理'},
	{name: 'Processed', value: '已处理'},
	{name: 'Fail', value: '失败'},
	{name: 'Exception', value: '异常'},
	{name: 'Canceled', value: '已撤单'},
	{name: 'Repealed', value: '已作废'},
	{name: 'Aborted', value: '已终止'},
	{name: 'AddSignatured', value: '已加签'},
	{name: 'TransferSignatured', value: '已转签'},
	{name: 'Assisted', value: '已协办'},
	{name: 'Entrusted', value: '已委托'},
])
//已办业务状态
const businessStateList = ref([
	{name: 1, value: '草稿'},
	{name: 2, value: '流转'},
	{name: 3, value: '修改'},
	{name: 4, value: '已审批'},
	{name: 5, value: '已支付'},
	{name: 100, value: '审批未通过'},
	{name: 101, value: '已作废'},
	{name: 102, value: '流程终止'},
])

export {
	taskResultList,
	businessStateList
}