// 设备的状态栏高度
const systemInfo = uni.getSystemInfoSync();
export const getStatusBar_Height = ()=> systemInfo.statusBarHeight || 15;

// 小程序 胶囊按钮的高度
export const getTitleBar_Height = ()=>{
	if(uni.getMenuButtonBoundingClientRect){
		let {height,top} = uni.getMenuButtonBoundingClientRect();
		return height + (top - getStatusBar_Height())*2
	}else{
		return 50;
	}
} 

// 小程序 导航栏的高度
export const getNavigateBar_Height =()=> getStatusBar_Height()+getTitleBar_Height();
