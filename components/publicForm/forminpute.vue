<!-- 输入框 下拉框 -->
<template>
	<view style="margin-bottom: 20rpx;" v-if="showComponent">
		<view :class="['inputeFormCentent',prohibitInput && !iconShow ? 'Q_shake' :'']" :style="{
			'color': prohibitInput ? '#a8a8a8' : null,
				'display': display ?'flex' :'',
				    'borderBottom': tipsBorder? '1rpx solid crimson' : underline ? '1rpx solid #f0f0f0' :'1rpx solid transparent'
			}">
			<view class="inputeFormTitle"
				:style="{borderBottom:'2rpx dashed',borderBottomColor:IsBackLink ? '#123875' :'transparent' ,flex: display ? '1' : null}"
				@tap="toBackLink">
				<view class="inputeFormTitleIcon">
					<up-icon v-if="iconTo && !IsBackLink" :custom-prefix="iconTo" :name="iconName"
						:color="IsRequired ? '#f75556' : iconColorUr" :size="iconSize"></up-icon>
					<up-icon v-else :name="IsBackLink ? 'attach' :  icontypeDefault"
						:color=" IsRequired ? '#f75556' : iconColorUr" :size="iconSize"></up-icon>
				</view>
				<view class="inputeFormTitleText"
					:style="{color: IsRequired ? '#f75556' :  '',fontStyle:IsExtendField ? 'oblique 85deg' : null}">
					<text>{{title}}</text>
				</view>

			</view>

			<view :class="['inputeFormCententBox',prohibitInput ? 'disableStyle' : 'notDisableStyle']"
				@tap="inputDateFn(iconShow,prohibitInput)" :style="display ? 'flex: 2.4;' : ''">
				<view class="inputeFormInputPlay">
					<input :maxlength="!maxInputLength ? -1 : maxInputLength" :type="IpType"
						:placeholder="inputePlaceholder" :disabled="IsEdit_Box ? IsEdit_Box : prohibitInput"
						@input="getIpValue($event)" :value="IsType ? IsTypeNewValue : inputValue">
				</view>
				<view class="inputeFormInputIcon" :style="!iconShow ? 'display: none;':''">
					<up-icon name="arrow-down-fill" color="DarkGray" size="26"></up-icon>
				</view>
			</view>
		</view>
		<view style="display: flex;">
			<view style="flex: 1;">
			</view>
			<view style="flex:2.4;font-size: 26rpx;color:crimson;">
				{{IsTypeNewValue || inputValue ? null : tips}}
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import {
		withDefaults,
		watch,
		ref
	} from "vue"

	interface Props {
		title ? : String, //标题
			icontype ? : String, //图标类型
			iconColorUr ? : String, //图标颜色
			iconSize ? : String, //图标大小
			textSize ? : String, //标题字体大小
			iconShow ? : Boolean, //控制输入框图标 显示图标为又下拉框 不显示图标为 输入框
			inputValue ? : String, //输入框内容
			display ? : Boolean, //左右布局
			maxInputLength ? : number, //最大输入值
			prohibitInput ? : Boolean, //控制输入框是否可输入
			inputItem ? : any, //输入框数据
			tips ? : String, //提示
			tipsBorder ? : Boolean, //下滑线提示
			showComponent ? : Boolean, //是否显示该组件
			underline ? : Boolean, //下划线
			IsRequired ? : Boolean, // 必填
			IsExtendField ? : Boolean, // 扩展字段
			IsBackLink ? : Boolean, // 反链
	}
	interface Emit {
		(e: "inputeModule", event ? : [MouseEvent, Object, String], inputItem ? : Object): void;
		(e: "dateTap", event ? : MouseEvent): void;
		(e: "toBackLink"): void;
	}
	let emit = defineEmits < Emit > ();
	const props = withDefaults(defineProps < Props > (), {
		title: () => "标题",
		icontype: () => "",
		iconColorUr: () => "#2979ff",
		iconSize: () => "32",
		textSize: () => "30",
		iconShow: () => false,
		inputValue: () => "",
		display: () => false,
		maxInputLength: 0,
		prohibitInput: () => true,
		inputItem: () => {},
		tips: () => "",
		tipsBorder: () => false,
		showComponent: () => true,
		underline: () => true,
		IsRequired: () => false,
		IsExtendField: () => false,
		IsBackLink: () => false,
	})
	interface RefType < T > {
		value: T
	}
	let IpType: RefType < String > = ref("text");
	let timeID: any = null;
	let IsType: RefType < Boolean > = ref(false); //是否自定义类型
	let IsTypeNewValue: RefType < any > = ref(""); //自定义类型新内容
	let IsTypeTap: RefType < string > = ref("")
	let IsMoney: RefType < Boolean > = ref(false); //money符号
	let iconTo: RefType < string > = ref(null);
	let iconName: RefType < string > = ref(null);
	let icontypeDefault: RefType < String > = ref("")
	let inputePlaceholder: RefType < String > = ref("");
	let IsCustomizationIcon: RefType < Boolean > = ref(false); //自定义符号
	let inputeFunctionString: RefType < any > = ref(null);
	let CustomizationIconPosition = "";
	let WebControl = "";

	watch(() => props.inputValue, (newValue) => {
		if (IsCustomizationIcon.value) {
			if (CustomizationIconPosition === "forward") {
				if (IsTypeNewValue.value)
					IsTypeNewValue.value = newValue;
				else
					IsTypeNewValue.value = IsTypeTap.value + newValue;
			} else {
				IsTypeNewValue.value = newValue + IsTypeTap.value;
			}
		}
	})


	watch(() => props.inputItem, (newValue) => {
		if (newValue) {
			if (newValue.WebControl === "bussinessNumber") {
				icontypeDefault.value = "edit-pen"
			} else if (newValue.WebControl === "dateSelector") {
				icontypeDefault.value = "calendar"
			} else if (newValue.WebControl === "normalInput") {
				icontypeDefault.value = "edit-pen"
			} else if (newValue.WebControl === "oneNodeSelector") {
				icontypeDefault.value = "more-circle"
			} else if (newValue.WebControl === "citySelector") {
				icontypeDefault.value = "map"
			}
		}
		if (newValue && newValue.ParamsObj) {
			try {
				let ParamsObject = JSON.parse(newValue.ParamsObj);
				if (ParamsObject.Code) {
					if (ParamsObject.Code.CustomizationIconFunction) {
						// let funcStr = ParamsObject.Code.CustomizationIconFunction;
						// let test = eval("(false || " + funcStr + ")");
						// inputeFunctionString.value = test;
					}
				}
				if (ParamsObject.icon) {
					iconTo.value = ParamsObject.icon.type !== null && ParamsObject.icon.type !== undefined ? ParamsObject.icon.type : "custom-icon";
					iconName.value = ParamsObject.icon.name;
				}
				if (ParamsObject.Type) {
					if (ParamsObject.Type === "number") { //数字
						IpType.value = ParamsObject.Type;
					} else if (ParamsObject.Type === "percentum") { //百分百
						IsType.value = true;
						IsTypeTap.value = ParamsObject.Type; //记录百分百标签
						if (props.inputValue)
							IsTypeNewValue.value = props.inputValue.replace(/[^0-9.．]/ig, "") + "%"; //内容后面加上百分百
					} else if (ParamsObject.Type === "kilobit") { //千位符
						IsType.value = true;
						IsTypeTap.value = ParamsObject.Type; //记录百分百标签
						if (props.inputValue)
							IsTypeNewValue.value = Number(props.inputValue.replace(/[^0-9.．]/ig, ""))
							.toLocaleString();
					}
				}
				if (ParamsObject.Money) {
					IsType.value = true;
					IsMoney.value = true;
					//判断 如果进来没有输入框内容 则是第一次进入
					//只有第一次进入才有添加符号情况
					if (!IsTypeNewValue.value) {
						
						if (ParamsObject.Type)
							IsTypeNewValue.value = "￥" + IsTypeNewValue.value;
						else
							IsTypeNewValue.value = "￥" + String(props.inputValue).replace(/[^0-9.．]/ig, "");
					}
				}
				if (ParamsObject.CustomizationIcon) {
					IsTypeTap.value = ParamsObject.CustomizationIcon; //记录自定义符号
					IsCustomizationIcon.value = true;
					IsType.value = true;
					//自定义符号 正前方
					CustomizationIconPosition = ParamsObject.CustomizationIconPosition;
					if (ParamsObject.CustomizationIconPosition === "forward") {
						if (props.inputValue)
							IsTypeNewValue.value = props.inputValue
						if (IsTypeNewValue.value)
							IsTypeNewValue.value = ParamsObject.CustomizationIcon + IsTypeNewValue.value;
					} else {
						if (props.inputValue)
							IsTypeNewValue.value = props.inputValue;
						if (IsTypeNewValue.value)
							IsTypeNewValue.value = IsTypeNewValue.value + ParamsObject.CustomizationIcon;
					}
				}
				if (ParamsObject.placeholder) {
					inputePlaceholder.value = props.prohibitInput ? "" : ParamsObject.placeholder;
				}
			} catch (e) {}
		}
		if (newValue) {
			if (newValue.WebControl === "oneNodeSelector") {
				WebControl = newValue.WebControl;
				IsType.value = true;
				if (!newValue.deputyDataValue) {
					if (newValue.dataValue && newValue.list) {
						try {
							newValue.list.forEach(v => {
								if (v.CodeID == String(newValue.dataValue)) {
									IsTypeNewValue.value = v.FlowName;
								}
							})
						} catch (e) {
							//TODO handle the exception
						}

					}
				} else {
					IsTypeNewValue.value = newValue.deputyDataValue;
				}
			}
		}
	}, {
		deep: true,
		immediate: true
	})
	let IsEdit_Box: RefType < Boolean > = ref(false);

	let inputDateFn = (item: any, IsEdit: Boolean) => {
		if (!item || IsEdit) return
		IsEdit_Box.value = true;
		emit("dateTap")
	}

	/**输入框监听内容*/
	let getIpValue = (event: any) => {
		//百分比
		if (IsTypeTap.value === "percentum") {
			IsTypeNewValue.value = event.detail.value.replace(/[^0-9.．]/ig, "") + "%";
			event.detail.value = event.detail.value.replace(/[^0-9.．]/ig, "");
			if (event.detail.value >= 100) event.detail.value = 100;
		} else if (IsTypeTap.value === "kilobit") {
			event.detail.value = event.detail.value.replace(/[^0-9.．]/ig, "");
		}
		if (IsMoney.value && !IsTypeTap.value) {
			event.detail.value = event.detail.value.replace(/[^0-9.．]/ig, "");
			IsTypeNewValue.value = event.detail.value;
		}
		//自定义符号
		if (IsTypeTap.value && IsCustomizationIcon.value) {
			if (inputeFunctionString.value) {
				//第一个是存储数据,第二个展示数据
				inputeFunctionString.value(event.detail.value, IsTypeNewValue.value);
			}

		}
		if (IsTypeTap.value)
			if (timeID) {
				clearTimeout(timeID);
			}
		timeID = setTimeout(() => {
			if (IsTypeTap.value === "percentum" && Number(IsTypeNewValue.value.replace(/[^0-9.．]/ig, "")) >= 100)
				IsTypeNewValue.value = "100%";
			if (IsTypeTap.value === "kilobit") //千位符
				IsTypeNewValue.value = Number(event.detail.value).toLocaleString();
			if (IsMoney.value) //有人民币符号 这边只需要加个符号即可 , 所以去操作在上面就已经完成了,无论有没有其他Tab
			{
				let str = IsTypeNewValue.value.split('￥');
				IsTypeNewValue.value = str.join('');
				IsTypeNewValue.value = "￥" + IsTypeNewValue.value;
			}
			emit("inputeModule", event.detail.value, props.inputItem)
		}, 100)

	};
	let toBackLink = () => {
		if (props.IsBackLink) emit("toBackLink")
	}
</script>

<style lang="scss">
	.inputeFormCentent {
		width: 100%;

		.inputeFormTitle {
			display: flex;
			align-items: center;
			margin: 20rpx 0;

			.inputeFormTitleIcon {
				margin-right: 8rpx;
			}
		}

		.inputeFormCententBox {
			width: calc(100% - 1rpx);
			display: flex;
			align-items: center;
			// border: 1rpx solid #bfbfbf;
			border-radius: 8rpx;

			.inputeFormInputIcon {
				width: 7%;
				text-align: center;
				margin-right: 15rpx;
			}

			.inputeFormInputPlay {
				width: 100%;
				margin-left: 10rpx;
				margin-right: 10rpx;

				input {
					font-size: 28rpx;
					padding: 10rpx 0;
				}
			}
		}
	}

	.disableStyle {
		background-color: transparent;
		border-radius: 3rpx;
		color: #909090;
		font-size: 30rpx;
	}

	.notDisableStyle {
		color: #333;
		font-size: 30rpx;
	}
</style>
