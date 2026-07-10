let	ID = ''
let	textName = ''
let	iconName = ''
let	gotoIcoPage = ''

import {ref} from 'vue';

//user
const userDataList = ref([
	{
		ID: 'personalInfo',
		textName: "个人信息",
		iconName: "account-fill",
	},
	{
		ID: 'signature',
		textName: "签名设置",
		iconName: "edit-pen",
	},
	{
		ID: 'about',
		textName: "关于我们",
		iconName: "info-circle",
	},
	{
		ID: 'quit',
		textName: "退出登录",
		iconName: "account",
	}
]);

//personalInfo
const userHeadPhoto = ref({
	HeadPhoto: {
		infoTitle: '头像',
		infoValue: '/static/108.png',
	}
})
const userNameList = ref({			
	nickName: {
		infoTitle: '昵称',
		infoValue: '',
	},
	personalSignature: {
		infoTitle: '个性签名',
		infoValue: '',
	}
})
const userSexList = ref({
	Sex: {
		infoTitle: '性别',
		infoValue: '',
	},		
	Birthday: {
		infoTitle: '出生日期',
		infoValue: '',
	}
})
const userUnitList = ref({			
	Unit: {
		infoTitle: '单位',
		infoValue: '',
	},
	Department: {
		infoTitle: '部门',
		infoValue: '',
	},
	PostName: {
		infoTitle: '职务',
		infoValue: '',
	},
	Email: {
		infoTitle: '邮箱',
		infoValue: '',
	},
	MobilePhone: {
		infoTitle: '手机号',
		infoValue: '',
	}
})

export {
	userDataList,
	userHeadPhoto,
	userNameList,
	userSexList,
	userUnitList
}