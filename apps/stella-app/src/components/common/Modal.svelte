<script lang="ts">
	import { createDialog } from 'svelte-headlessui';
	import Transition from 'svelte-transition';

	export const dialog = createDialog();
</script>

<slot name="button" {dialog} />
<div class="relative z-10">
	<Transition show={$dialog.expanded}>
		<div class="fixed inset-0 overflow-y-auto bg-gray-950/90">
			<div class="flex min-h-full items-center justify-center p-4 text-center">
				<Transition
					enter="ease-out duration-300"
					enterFrom="opacity-0 scale-95"
					enterTo="opacity-100 scale-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100 scale-100"
					leaveTo="opacity-0 scale-95"
				>
					<div
						class="scrollbar-thin relative max-h-[95vh] w-[90vw] max-w-[90vw] transform overflow-hidden overflow-y-auto rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all lg:min-w-fit lg:max-w-md"
						use:dialog.modal
					>
						<slot {dialog} />
					</div>
				</Transition>
			</div>
		</div>
	</Transition>
</div>
