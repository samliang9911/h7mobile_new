import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'

dayjs.extend(weekOfYear)

export function formatValue(cfg : any, rawData : Record<string, any>) {
	let value = rawData?.[cfg.field] ?? ''

	// 如果有 render 配置，优先执行 render
	if (cfg.render) {
		try {
			value = eval(`(${cfg.render})(rawData, value)`)
		} catch (e) {
			console.warn('Render 执行失败:', e)
		}
	}

	// 日期处理
	if (cfg.format && cfg.type === 'date') {
		const date = dayjs(value)
		if (!date.isValid()) return value

		switch (cfg.format) {
			case 'yyyy-MM-dd hh:mm:ss':
				// 默认显示年月日时分秒
				value = date.format('YYYY-MM-DD HH:mm:ss')
				break

			case 'yyyy-MM-dd':
				// 仅显示年月日
				value = date.format('YYYY-MM-DD')
				break

			case 'yyyy年第WW周':
				// 显示第几周
				const week = date.week()
				value = `${date.format('YYYY')}年第${week.toString().padStart(2, '0')}周`
				break

			default:
				// 默认情况：年月日时分秒
				value = date.format('YYYY-MM-DD HH:mm:ss')
				break
		}
	}

	// 金额/税处理逻辑
	if (cfg.type === 'number') {
		let amount = Number(value) || 0

		// 1. 金额换算（使用 M_calculate）
		if (cfg.conversion) {
			const divisor = Number(cfg.conversion)
			if (!isNaN(divisor) && divisor !== 0) {
				const calcResult = M_calculate(`${amount}/${divisor}`, cfg.decimal ? Number(cfg.decimal) : 2)
				amount = calcResult !== null ? calcResult : amount
			}
		}

		// 2. 保留小数位数（使用 M_calculate）
		const decimalPlaces = cfg.decimal ? Number(cfg.decimal) : 2
		const rounded = M_calculate(`${amount}`, decimalPlaces)
		amount = rounded !== null ? rounded : amount

		// 3. 千位符开关
		if (cfg.thousands === 'true' || cfg.thousands === true) {
			value = M_formatCurrency(amount.toFixed(decimalPlaces))
		} else {
			value = amount.toFixed(decimalPlaces)
		}

		// 4. 拼接左右符号
		if (cfg.leftStr) {
			value = `${cfg.leftStr}${value}`
		}
		if (cfg.rightStr) {
			value = `${value}${cfg.rightStr}`
		}
	}

	return value
}

// 返回千位符
export function M_formatCurrency(num : number | string) : string {
	let strNum = num.toString().replace(/\$|\,/g, '');
	if (isNaN(Number(strNum))) strNum = "0";

	const sign = Number(strNum) === Math.abs(Number(strNum));
	strNum = Math.abs(Number(strNum)).toString();

	const r = /^[0-9]*[1-9][0-9]*$/;
	if (r.test(strNum) || strNum === "0") {
		for (let i = 0; i < Math.floor((strNum.length - (1 + i)) / 3); i++) {
			strNum =
				strNum.substring(0, strNum.length - (4 * i + 3)) +
				',' +
				strNum.substring(strNum.length - (4 * i + 3));
		}
		return (sign ? '' : '-') + strNum;
	} else {
		const b = strNum.split(".");
		let intPart = b[0];
		const decimalPart = b[1];
		for (let i = 0; i < Math.floor((intPart.length - (1 + i)) / 3); i++) {
			intPart =
				intPart.substring(0, intPart.length - (4 * i + 3)) +
				',' +
				intPart.substring(intPart.length - (4 * i + 3));
		}
		return (sign ? '' : '-') + intPart + "." + decimalPart;
	}
}

// 解决 JS 算法精度丢失
export function M_calculate(expression : string, decimal : number = 2) : number | null {
	if (!expression || typeof expression !== 'string') return null;
	if (typeof decimal !== 'number' || decimal < 0 || decimal > 10) return null;

	let expr = expression.replace(/\s+/g, '');
	expr = expr.replace(/(^|[(+\-*/])-(?=\d|\.)/g, '$1~');
	expr = expr.replace(/\b(undefined|null)\b/g, '0');

	try {
		const operators : Record<string, any> = {
			'+': (a : number, b : number) => a + b,
			'-': (a : number, b : number) => a - b,
			'*': (a : number, b : number) => a * b,
			'/': (a : number, b : number) => (b === 0 ? null : a / b),
			'~': (a : number) => -a
		};

		const precedence : Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '~': 3 };
		const output : (number | string)[] = [];
		const stack : string[] = [];

		let i = 0;
		while (i < expr.length) {
			const char = expr[i];
			if ((char >= '0' && char <= '9') || char === '.') {
				let num = '';
				while (i < expr.length && ((expr[i] >= '0' && expr[i] <= '9') || expr[i] === '.')) {
					num += expr[i];
					i++;
				}
				const numValue = parseFloat(num);
				if (isNaN(numValue)) return null;
				output.push(numValue);
				continue;
			}
			if (char === '~') {
				stack.push('~');
				i++;
				continue;
			}
			if (['+', '-', '*', '/'].includes(char)) {
				while (stack.length > 0 && stack[stack.length - 1] !== '(' && precedence[stack[stack.length - 1]] >= precedence[char]) {
					output.push(stack.pop() as string);
				}
				stack.push(char);
			} else if (char === '(') {
				stack.push(char);
			} else if (char === ')') {
				while (stack.length > 0 && stack[stack.length - 1] !== '(') {
					output.push(stack.pop() as string);
				}
				if (stack.pop() !== '(') return null;
			} else {
				return null;
			}
			i++;
		}

		while (stack.length > 0) {
			const op = stack.pop() as string;
			if (op === '(') return null;
			output.push(op);
		}

		const calcStack : number[] = [];
		for (const token of output) {
			if (typeof token === 'number') {
				calcStack.push(token);
			} else if (token === '~') {
				const a = calcStack.pop();
				if (a === undefined) return null;
				calcStack.push(-a);
			} else {
				const b = calcStack.pop();
				const a = calcStack.pop();
				if (a === undefined || b === undefined) return null;
				const result = operators[token](a, b);
				if (result === null) return null;
				calcStack.push(result);
			}
		}

		if (calcStack.length !== 1) return null;
		const result = calcStack[0];
		if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) return null;

		return parseFloat(result.toFixed(decimal));
	} catch {
		return null;
	}
}