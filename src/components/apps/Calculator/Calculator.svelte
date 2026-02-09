<script lang="ts">
	import Plus from '~icons/ic/outline-plus';
	import Equal from '~icons/ic/round-equals';
	import Minus from '~icons/ic/round-minus';
	import PlusMinus from '~icons/majesticons/plus-minus-2';
	import Division from '~icons/ph/divide-bold';
	import Multiply from '~icons/uil/multiply';

	let display_value = $state('0');
	let first_operand = $state<number | null>(null);
	let operator = $state<string | null>(null);
	let waiting_for_second = $state(false);
	let active_operator = $state<string | null>(null);

	let display_font_size = $derived.by(() => {
		const len = display_value.length;
		if (len <= 6) return '2.5rem';
		if (len <= 9) return '2rem';
		if (len <= 12) return '1.5rem';
		return '1.2rem';
	});

	function format_display(value: string): string {
		if (value === 'Error') return value;

		const is_negative = value.startsWith('-');
		const abs_value = is_negative ? value.slice(1) : value;

		if (abs_value.includes('.')) {
			const [integer_part, decimal_part] = abs_value.split('.');
			const formatted_int = Number(integer_part).toLocaleString('en-US');
			const result = `${formatted_int}.${decimal_part}`;
			return is_negative ? `-${result}` : result;
		}

		const formatted = Number(abs_value).toLocaleString('en-US');
		return is_negative ? `-${formatted}` : formatted;
	}

	let formatted_display = $derived(format_display(display_value));

	function input_digit(digit: string) {
		if (display_value === 'Error') {
			display_value = digit;
			return;
		}

		if (waiting_for_second) {
			display_value = digit;
			waiting_for_second = false;
			active_operator = operator;
			return;
		}

		if (display_value === '0' && digit !== '0') {
			display_value = digit;
		} else if (display_value === '0' && digit === '0') {
			// do nothing, keep "0"
		} else if (display_value.replace('.', '').replace('-', '').length >= 9) {
			// max 9 digits
		} else {
			display_value = display_value + digit;
		}
	}

	function input_decimal() {
		if (display_value === 'Error') {
			display_value = '0.';
			return;
		}

		if (waiting_for_second) {
			display_value = '0.';
			waiting_for_second = false;
			active_operator = operator;
			return;
		}

		if (!display_value.includes('.')) {
			display_value = display_value + '.';
		}
	}

	function perform_calculation(op: string, a: number, b: number): number {
		switch (op) {
			case '+':
				return a + b;
			case '-':
				return a - b;
			case '*':
				return a * b;
			case '/':
				if (b === 0) return NaN;
				return a / b;
			default:
				return b;
		}
	}

	function format_result(value: number): string {
		if (!isFinite(value) || isNaN(value)) return 'Error';

		let result = String(value);

		// Handle very large/small numbers
		if (Math.abs(value) >= 1e9 || (Math.abs(value) < 1e-9 && value !== 0)) {
			return value.toExponential(4);
		}

		// Limit to 9 significant digits to avoid floating point display issues
		const rounded = parseFloat(value.toPrecision(9));
		result = String(rounded);

		// If it's too long, truncate
		if (result.replace('-', '').replace('.', '').length > 9) {
			result = String(parseFloat(value.toPrecision(9)));
		}

		return result;
	}

	function handle_operator(next_op: string) {
		if (display_value === 'Error') {
			clear_all();
			return;
		}

		const current = parseFloat(display_value);

		if (first_operand === null) {
			first_operand = current;
		} else if (operator && !waiting_for_second) {
			const result = perform_calculation(operator, first_operand, current);
			const formatted = format_result(result);
			display_value = formatted;
			first_operand = formatted === 'Error' ? null : parseFloat(formatted);

			if (formatted === 'Error') {
				operator = null;
				active_operator = null;
				return;
			}
		}

		operator = next_op;
		active_operator = next_op;
		waiting_for_second = true;
	}

	function handle_equals() {
		if (display_value === 'Error') {
			clear_all();
			return;
		}

		if (operator === null || first_operand === null) {
			active_operator = null;
			return;
		}

		const current = parseFloat(display_value);
		const result = perform_calculation(operator, first_operand, current);
		const formatted = format_result(result);

		display_value = formatted;
		first_operand = null;
		operator = null;
		active_operator = null;
		waiting_for_second = false;
	}

	function clear_all() {
		display_value = '0';
		first_operand = null;
		operator = null;
		waiting_for_second = false;
		active_operator = null;
	}

	function toggle_sign() {
		if (display_value === 'Error') return;
		if (display_value === '0') return;

		if (display_value.startsWith('-')) {
			display_value = display_value.slice(1);
		} else {
			display_value = '-' + display_value;
		}
	}

	function handle_percentage() {
		if (display_value === 'Error') return;

		const current = parseFloat(display_value);

		if (first_operand !== null && operator) {
			// In context of an operation, percentage means "x% of first_operand"
			const percent_value = first_operand * (current / 100);
			display_value = format_result(percent_value);
		} else {
			display_value = format_result(current / 100);
		}
	}

	let clear_label = $derived(
		display_value === '0' && first_operand === null && operator === null ? 'AC' : 'C'
	);

	function handle_clear() {
		if (clear_label === 'AC') {
			clear_all();
		} else {
			display_value = '0';
			waiting_for_second = false;
		}
	}
</script>

<section class="container">
	<header class="app-window-drag-handle"></header>

	<section class="show-area" style:font-size={display_font_size}>
		{formatted_display}
	</section>

	<section class="buttons-container">
		<button class="top-row-button" onclick={handle_clear}>
			{clear_label}
		</button>
		<button class="top-row-button" onclick={toggle_sign}>
			<PlusMinus />
		</button>
		<button class="top-row-button" onclick={handle_percentage}> % </button>
		<button
			class="operation-button"
			class:op-active={active_operator === '/'}
			onclick={() => handle_operator('/')}
		>
			<Division />
		</button>

		<button class="number-button" onclick={() => input_digit('7')}> 7 </button>
		<button class="number-button" onclick={() => input_digit('8')}> 8 </button>
		<button class="number-button" onclick={() => input_digit('9')}> 9 </button>
		<button
			class="operation-button"
			class:op-active={active_operator === '*'}
			onclick={() => handle_operator('*')}
		>
			<Multiply />
		</button>

		<button class="number-button" onclick={() => input_digit('4')}> 4 </button>
		<button class="number-button" onclick={() => input_digit('5')}> 5 </button>
		<button class="number-button" onclick={() => input_digit('6')}> 6 </button>
		<button
			class="operation-button"
			class:op-active={active_operator === '-'}
			onclick={() => handle_operator('-')}
		>
			<Minus />
		</button>

		<button class="number-button" onclick={() => input_digit('1')}> 1 </button>
		<button class="number-button" onclick={() => input_digit('2')}> 2 </button>
		<button class="number-button" onclick={() => input_digit('3')}> 3 </button>
		<button
			class="operation-button"
			class:op-active={active_operator === '+'}
			onclick={() => handle_operator('+')}
		>
			<Plus />
		</button>

		<button
			class="number-button curved-bottom-left-button zero-button"
			onclick={() => input_digit('0')}
		>
			0
		</button>
		<button class="number-button" onclick={input_decimal}> . </button>
		<button class="operation-button curved-bottom-right-button" onclick={handle_equals}>
			<Equal />
		</button>
	</section>
</section>

<style>
	header {
		padding: 0.75rem;
		background-color: #4a4a4c;
	}

	.container {
		height: 100%;
		width: 100%;

		background-color: #1c1c1e;

		border-radius: inherit;

		display: grid;
		grid-template-rows: auto auto 1fr;

		font-family: var(--system-font-family) !important;

		user-select: none;
	}

	.buttons-container {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(5, 1fr);
		gap: 1px;

		margin: 1.5px;

		& > button {
			font-size: 1.414rem;
			font-weight: 400 !important;
			color: white;
			fill: white;
			border: none;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			transition:
				background-color 0.1s ease,
				filter 0.1s ease;
			min-height: 52px;
		}

		:global(svg) {
			font-size: 1.2rem;
		}
	}

	.top-row-button {
		background-color: #a5a5a5;
		color: #1c1c1e !important;
	}

	.top-row-button:hover {
		background-color: #b8b8b8;
	}

	.top-row-button:active {
		background-color: #c9c9c9;
	}

	.number-button {
		background-color: #333333;
	}

	.number-button:hover {
		background-color: #444444;
	}

	.number-button:active {
		background-color: #555555;
	}

	.operation-button {
		background-color: #ff9500;
	}

	.operation-button:hover {
		background-color: #ffaa33;
	}

	.operation-button:active {
		background-color: #ffbb55;
	}

	.op-active {
		background-color: #ffffff !important;
		color: #ff9500 !important;
		fill: #ff9500 !important;
	}

	.op-active:hover {
		background-color: #f0f0f0 !important;
	}

	.zero-button {
		grid-column: 1 / span 2;
		justify-content: flex-start;
		padding-left: 1.5rem;
	}

	.curved-bottom-left-button {
		border-radius: 0 0 0 0.7rem;
	}

	.curved-bottom-right-button {
		border-radius: 0 0 0.7rem 0;
	}

	.show-area {
		font-size: 2.5rem;
		color: white;
		text-align: end;
		font-weight: 200;

		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;

		padding: 0.25rem 1rem 0.5rem;

		min-height: 3.5rem;
		display: flex;
		align-items: flex-end;
		justify-content: flex-end;

		background-color: #4a4a4c;
	}

	:global(.tl-container.calculator) {
		top: 0.7rem;
		left: 0.7rem;
	}

	/* Light mode overrides */
	@media (prefers-color-scheme: light) {
		.container {
			background-color: #f0f0f0;
		}

		.number-button {
			background-color: #e0e0e0;
			color: #1c1c1e !important;
		}

		.number-button:hover {
			background-color: #d0d0d0;
		}

		.number-button:active {
			background-color: #c0c0c0;
		}

		.top-row-button {
			background-color: #d4d4d4;
		}

		.top-row-button:hover {
			background-color: #c4c4c4;
		}

		.top-row-button:active {
			background-color: #b4b4b4;
		}
	}
</style>
