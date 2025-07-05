<script lang="ts">
 import "../app.css";
 import { ModeWatcher } from "mode-watcher";
 let { children } = $props();
 import SunIcon from "@lucide/svelte/icons/sun";
 import MoonIcon from "@lucide/svelte/icons/moon";
 import { toggleMode } from "mode-watcher";
 import { Button } from "$lib/components/ui/button/index.js";
</script>

<div class="fixed top-4 right-4 z-50">
	<Button onclick={toggleMode} variant="outline" size="icon">
		<SunIcon
			class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 !transition-all dark:-rotate-90 dark:scale-0"
		/>
		<MoonIcon
			class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 !transition-all dark:rotate-0 dark:scale-100"
		/>
		<span class="sr-only">Toggle theme</span>
	</Button>
</div>

<ModeWatcher />
{@render children?.()}