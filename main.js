import App from './App'
import uviewPlus from "uview-plus";
import { createSSRApp } from 'vue'
import { http_request, throttle } from '/api/api.js'
import './new_file.scss'
import { setupPinia } from './store/index.ts';

export function createApp() {
	const app = createSSRApp(App)
	app.config.globalProperties.$throttle = throttle;//全局节流阀
	app.config.globalProperties.$http_request = http_request;//全局请求
	app.config.globalProperties.serverUrlTypeSwitch = "production";//请求地址demo演示production开发
	setupPinia(app)
	app.use(uviewPlus, () => {
		return {
			options: {
				// 修改$u.config对象的属性
				config: {
					// 修改默认单位为rpx，相当于执行 uni.$u.config.unit = 'rpx'
					unit: 'rpx'
				}
			}
		}
	})
	
	return {
		app
	}
}
