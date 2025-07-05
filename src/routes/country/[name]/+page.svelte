<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	
	// Type definitions (should match server-side types)
	interface CountryName {
		common: string;
		official: string;
		nativeName?: Record<string, { common: string; official: string }>;
	}

	interface Country {
		name: CountryName;
		capital?: string[];
		region?: string;
		subregion?: string;
		population?: number;
		area?: number;
		languages?: Record<string, string>;
		currencies?: Record<string, { name: string; symbol?: string }>;
		timezones?: string[];
		flags?: { svg: string; png: string };
		coatOfArms?: { svg: string; png: string };
		maps?: { googleMaps: string; openStreetMaps: string };
	}

	interface PageData {
		country: Country;
		regionalCountries: Country[];
	}
	
	let { data }: { data: PageData } = $props();
	let country = $derived(data?.country);
	let regionalCountries = $derived(data?.regionalCountries);
	let loadingCountry = $state<string | null>(null);

	function goBack() {
		if (browser) {
			history.length > 1 ? history.back() : goto('/');
		} else {
			goto('/');
		}
	}
	function goHome() {
		goto('/');
	}

	// Get languages as a readable string
	function getLanguages(country: Country): string {
		if (!country?.languages) return 'N/A';
		return Object.values(country.languages).join(', ');
	}

	// Get capital cities as a readable string
	function getCapital(country: Country): string {
		if (!country?.capital) return 'N/A';
		return Array.isArray(country.capital) ? country.capital.join(', ') : country.capital;
	}

	// Format population with commas
	function formatPopulation(pop: number): string {
		if (!pop) return 'N/A';
		return pop.toLocaleString();
	}

	// Get currency information
	function getCurrencies(country: Country): string {
		if (!country?.currencies) return 'N/A';
		return Object.values(country.currencies)
			.map((curr) => `${curr.name} (${curr.symbol || 'N/A'})`)
			.join(', ');
	}

	// Navigate to another country
	function navigateToCountry(countryName: string) {
		loadingCountry = countryName;
		goto(`/country/${encodeURIComponent(countryName.toLowerCase())}`);
	}

	// Handle keyboard navigation for country cards
	function handleKeyDown(event: KeyboardEvent, countryName: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			loadingCountry = countryName;
			navigateToCountry(countryName);
		}
	}
</script>

<div class="max-w-5xl mx-auto my-20 px-4 text-black dark:text-white">
	<button onclick={goBack} class="mb-6 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm text-white transition-colors">
		← Back
	</button>

	<button onclick={goHome} class="mb-6 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm text-white transition-colors">
	🏡Home
	</button>

	{#if country && country.name}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
			<!-- Main Country Info -->
			<div class="lg:col-span-2">
				<h1 class="text-black dark:text-white text-4xl font-bold mb-6">{country.name.common}</h1>
				
				<div class="space-y-3 text-lg">
					<p class="text-black dark:text-white">
						<span class="font-semibold">Official name:</span> {country.name.official}
					</p>
					
					{#if country.name.nativeName}
						<p class="text-black dark:text-white">
							<span class="font-semibold">Native name:</span> 
							{country.name.nativeName.hin?.common || country.name.nativeName.eng?.common || Object.values(country.name.nativeName)[0]?.common || 'N/A'}
						</p>
					{/if}

					{#if country.capital}
						<p class="text-black dark:text-white">
							<span class="font-semibold">Capital:</span> {getCapital(country)}
						</p>
					{/if}

					{#if country.region}
						<p class="text-black dark:text-white">
							<span class="font-semibold">Region:</span> {country.region}
							{#if country.subregion}
								<span class="text-gray-600 dark:text-gray-400">({country.subregion})</span>
							{/if}
						</p>
					{/if}

					{#if country.population}
						<p class="text-black dark:text-white">
							<span class="font-semibold">Population:</span> {formatPopulation(country.population)}
						</p>
					{/if}

					{#if country.area}
						<p class="text-black dark:text-white">
							<span class="font-semibold">Area:</span> {country.area.toLocaleString()} km²
						</p>
					{/if}

					{#if country.languages}
						<p class="text-black dark:text-white">
							<span class="font-semibold">Languages:</span> {getLanguages(country)}
						</p>
					{/if}

					{#if country.currencies}
						<p class="text-black dark:text-white">
							<span class="font-semibold">Currencies:</span> {getCurrencies(country)}
						</p>
					{/if}

					{#if country.timezones}
						<p class="text-black dark:text-white">
							<span class="font-semibold">Timezones:</span> {country.timezones.join(', ')}
						</p>
					{/if}
				</div>
			</div>

			<!-- Flag and Additional Info -->
			<div class="lg:col-span-1">
				{#if country.flags && country.flags.svg}
					<img 
						src={country.flags.svg} 
						alt="Flag of {country.name.common}" 
						class="rounded shadow w-full h-auto mb-6 border border-gray-200 dark:border-gray-700" 
					/>
				{/if}

				{#if country.coatOfArms && country.coatOfArms.svg}
					<div class="mb-6">
						<h3 class="text-lg font-semibold mb-2">Coat of Arms</h3>
						<img 
							src={country.coatOfArms.svg} 
							alt="Coat of Arms of {country.name.common}" 
							class="rounded shadow w-32 h-auto border border-gray-200 dark:border-gray-700" 
						/>
					</div>
				{/if}

				{#if country.maps}
					<div class="space-y-2">
						<h3 class="text-lg font-semibold">Maps</h3>
						{#if country.maps.googleMaps}
							<a 
								href={country.maps.googleMaps} 
								target="_blank" 
								rel="noopener noreferrer"
								class="inline-block bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
							>
								Google Maps
							</a>
						{/if}
						{#if country.maps.openStreetMaps}
							<a 
								href={country.maps.openStreetMaps} 
								target="_blank" 
								rel="noopener noreferrer"
								class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm ml-2 transition-colors"
							>
								OpenStreetMap
							</a>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- Regional Countries -->
		{#if regionalCountries && regionalCountries.length > 0}
			<div class="mt-12">
				<h2 class="text-black dark:text-white text-2xl font-bold mb-6">
					Other Countries in {country.region}
				</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each regionalCountries.slice(0, 12) as regionCountry}
						{#if regionCountry.name}
							<button 
								class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg hover:shadow-md transition-shadow text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500 relative disabled:opacity-75 disabled:cursor-not-allowed"
								onclick={() => navigateToCountry(regionCountry.name.common)}
								onkeydown={(e) => handleKeyDown(e, regionCountry.name.common)}
								type="button"
								disabled={loadingCountry === regionCountry.name.common}
							>
								<!-- Loading overlay -->
								{#if loadingCountry === regionCountry.name.common}
									<div class="absolute inset-0 bg-white/80 dark:bg-gray-800/80 rounded-lg flex items-center justify-center">
										<div class="flex items-center space-x-2">
											<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
											<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Loading...</span>
										</div>
									</div>
								{/if}

								<div class="flex items-center mb-3">
									{#if regionCountry.flags?.svg}
										<img 
											src={regionCountry.flags.svg} 
											alt="Flag of {regionCountry.name.common}" 
											class="w-8 h-6 rounded mr-3 border border-gray-300 dark:border-gray-600"
										/>
									{/if}
									<h3 class="font-semibold text-lg">{regionCountry.name.common}</h3>
								</div>
								
								<p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
									Official: {regionCountry.name.official}
								</p>
								{#if regionCountry.capital}
									<p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
										Capital: {getCapital(regionCountry)}
									</p>
								{/if}
								{#if regionCountry.population}
									<p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
										Population: {formatPopulation(regionCountry.population)}
									</p>
								{/if}
								{#if regionCountry.languages}
									<p class="text-sm text-gray-600 dark:text-gray-400">
										Languages: {getLanguages(regionCountry)}
									</p>
								{/if}
							</button>
						{/if}
					{/each}
				</div>
			</div>
		{/if}
	{:else}
		<div class="flex items-center justify-center h-64">
			<div class="text-center">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
				<p class="text-lg">Loading country information...</p>
			</div>
		</div>
	{/if}
</div>