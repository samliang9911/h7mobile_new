<template>
	<view>
		<view class="uni-container" :class="{'containerLandscape landscape-table':table.isLandscape}" v-for="(table, index) in tablesData" :key="index">
			<view v-if="table.isLandscape || !allTableIsLandscape ">
				<!-- 表头、旋转按钮 -->
				<!-- #ifdef H5 -->
				<view class="tableTitle">
					<view>{{table.title}}</view>
					<button class="btn" @click="toggleTableOrientation(index)" >
						<image class="rotatePNG" src="/static/pingmuxuanzhuan.png" mode="aspectFit"></image>
					</button>
				</view>
				<!-- #endif -->
				
				<!-- #ifdef APP-PLUS -->
				<view :class="table.isLandscape ? 'tableTitleLandscape ' : 'tableTitle' ">
					<view>{{table.title}}</view>
					<button @click="toggleTableOrientation(index)" :class="table.isLandscape ? 'btnLandscape ' : 'btn' ">
						<up-icon custom-prefix="custom-icon" name="pingmuxuanzhuan" color="#4395ff" :size="table.isLandscape ? 20 : 40"></up-icon>
					</button>
				</view>
				<!-- #endif -->
				
				<!-- 表体 -->
			    <uni-table  :class="table.isLandscape ? 'bodyLandscape ' : 'bodyNormal'" 
				ref="table" border stripe  emptyText="暂无更多数据" >
					<!-- 列名 -->
			    	<uni-tr >
						<uni-th class="fixed-serial" width="50" align="center">序号</uni-th>
						<uni-th :class="{'fixed-col':col.fixed}" v-for="col in table.columns" sortable align="center">{{col.header}}</uni-th>
			    	</uni-tr>
					
					<!-- 数据 -->
			    	<uni-tr v-for="(row,rowIndex) in table.data" :key="rowIndex">
						<uni-td class="fixed-serial" align="center">{{rowIndex+1}}</uni-td>
			    		<uni-td class="cell" :class="{'fixed-col':colDef.fixed}" :width="colDef.width ? colDef.width : 'auto'" align="center" 
						v-for="(colDef,colDefIndex) in table.columns">{{ row[colDef.field] }}</uni-td>
			    	</uni-tr>
			    </uni-table>
			    
			</view>
		</view>
	</view>
</template>

<script setup>
	import {onMounted, ref} from 'vue';
	import {getStatusBar_Height} from '/utils/systemInfo_navBarHeight';
	
	const props = defineProps({
		tablesData:Array
	})
	
	
	
	onMounted(()=>{
		console.log(props.tablesData);
		// 固定列
		let fixPosition = 0;
		let fixIndex = 0;
		props.tablesData.forEach((item)=>{
			if(item.fixed && item.width){
				if(fixIndex===0){
					item.fixPosition = 50;
					fixIndex++;
				}else{
					item.fixPosition += item.width;
				}
			}
		})
	})
	
	//检测横屏状态
	const allTableIsLandscape = props.tablesData.some(s=>s.isLandscape);
	
	// 点击旋转
	const toggleTableOrientation = (index) => {
	  
	  // 设置当前表格状态
	  const currentTable = props.tablesData[index];
	  currentTable.isLandscape = !currentTable.isLandscape;
	
	  // 屏幕方向切换
	  // #ifdef APP-PLUS
	  plus.screen.lockOrientation(currentTable.isLandscape ? 'landscape-primary' : 'portrait-primary');
	  
	  // #endif
	  
	  // #ifdef H5
	  const tableContainer = document.querySelectorAll('.uni-container')[index]
	  tableContainer.style.transform = currentTable.isLandscape ? 'rotate(90deg)' : 'none'
	  // 添加视口尺寸适配
	  tableContainer.style.width = currentTable.isLandscape ? '100vh' : '100%'
	  tableContainer.style.height = currentTable.isLandscape ? '100vw' : 'auto'
	  // #endif
	  
	};
	
	
</script>

<style lang="scss"  scoped>

.uni-container{
	padding: 80rpx 15rpx 0 15rpx;
	
}
.uni-container:first-child{ padding-top: 50rpx; }

.containerLandscape{
	padding: 25rpx 15rpx 10rpx 15rpx;
}


	.tableTitle{
		width: 100%;
		height: 80rpx;
		background-color: #eee;
		text-align: center;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		
		.btn{
			width: 100rpx;
			height: 60rpx;
			position: absolute;
			right: 20rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			
			.rotatePNG{
				width: 100%;
				height: 100%;
			}
		}
	}

	.tableTitleLandscape{
		width: 100%;
		height: 40rpx;
		background-color: #eee;
		text-align: center;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		
		.btnLandscape{
			width: 40rpx;
			height: 30rpx;
			position: absolute;
			right: 20rpx;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}

.bodyNormal{
		max-height: 30vh;
		width: 95vw;
	}
	
/* #ifdef H5 */
	.bodyLandscape{
		height: calc(100vw - 35rpx - 80rpx );
		width: calc(100vh - 30rpx);
		overflow: auto;
	}
/* #endif */

/* #ifdef APP-PLUS */
	.bodyLandscape{
		height: calc(100vh - 30rpx - 40rpx );
		width: calc(100vw - 30rpx);
		overflow: auto;
	}
/* #endif */


.cell{
	min-width: 80rpx;
	max-width: 500rpx;
}

.fixed-serial{
	position: sticky;
	left: 0;
	z-index: 20;
	background: #fff;  /* 必须设置背景色避免穿透 */
	// min-width: 100rpx; /* 固定列宽度 */
	 box-shadow: 2px 0 5px rgba(0,0,0,0.1);
}

.fixed-col {
  position: sticky;
  left: 100rpx;
  z-index: 20;
  background: #fff;  /* 必须设置背景色避免穿透 */
  // min-width: 100rpx; /* 固定列宽度 */
   box-shadow: 2px 0 5px rgba(0,0,0,0.1);
}
.fixed-col:last-child{ box-shadow: 2px 0 5px rgba(0,0,0,0.1); }


/* 横屏模式样式 */
/* #ifdef H5 */
	.landscape-table {
	  width: 100vh ;
	  height: 100vw ;
	  background-color: #fff;
	  overflow: auto;/* 溢出滚动 */
	  touch-action: manipulation;/* 缩放功能 */
	  transform: rotate(90deg);
	  transform-origin: top left;
	  transition: transform 0.3s ease-in-out;
	  position: fixed;
	  top: 0;
	  left: 100vw;
	  z-index: 998;
	}
/* #endif */

/* #ifdef APP-PLUS */
	.landscape-table {
	  width: 100%;
	  height: 100%;
	  background-color: #fff;
	  // overflow: auto;/* 溢出滚动 */
	  touch-action: manipulation;/* 缩放功能 */
	  transform-origin: top left;
	  transition: transform 0.3s ease-in-out;
	  position: fixed;
	  top: 0;
	  left: 0;
	  z-index: 998;
	}
/* #endif */

</style>

