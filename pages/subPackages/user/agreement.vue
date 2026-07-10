<!-- 协议 -->
<template>
	<view>
		<web-view v-if="listIndex != -1" :src="list[listIndex].url"></web-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list: [
					{
						title: '隐私政策',
						url: 'https://pcm77.com/html/Agreement/privacy.html'
					},
					{
						title: '使用条款',
						url: 'https://pcm77.com/html/Agreement/termsOfUse.html'
					},
					{
						title: '法律声明',
						url: 'https://pcm77.com/html/Agreement/legalNotice.html'
					}
				],
				listIndex: -1
			}
		},
		methods: {
			
		},
		onLoad(option) {
			this.listIndex = parseInt(option.index)
		}
	}
</script>

<style>

</style>
