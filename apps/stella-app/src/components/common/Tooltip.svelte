<script lang="ts">
	import tippy, { type Props } from 'tippy.js';
	import 'tippy.js/animations/shift-away.css';
	import 'tippy.js/dist/tippy.css';

	export let options: Partial<Props>;

	function tooltip(node: HTMLElement, params: Partial<Props>) {
		let tip = tippy(node, params);
		return {
			update: (newParams: Partial<Props>) => {
				tip.setProps(newParams);
			},
			destroy: () => {
				tip.destroy();
			}
		};
	}
</script>

<button
	use:tooltip={{
		...options,
		animation: 'shift-away',
		maxWidth: '13rem',
		arrow: true
	}}
>
	<slot />
</button>
