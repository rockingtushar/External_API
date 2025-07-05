<script lang="ts">
	import '../app.css';
	import { goto } from '$app/navigation';

	let { data } = $props();
	
	let countries = $derived(data?.countries || []);
	let currentRegion = $derived(data?.region || '');
	
	let selected = $state('');
	let search = $state('');
	let currentPage = $state(1);
	let itemsPerPage = $state(9);
	let searchField = $state('all'); // New state for search field selection

	function changeRegion(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		currentPage = 1; // Reset to first page when region changes
		goto(`/?region=${value}`);
	}

	// Helper function to extract searchable text from a country object
	function getSearchableText(country: any, field: string): string {
		switch (field) {
			case 'name':
				return country.name?.common?.toLowerCase() || '';
			case 'capital':
				return Array.isArray(country.capital) 
					? country.capital.join(' ').toLowerCase() 
					: (country.capital?.toLowerCase() || '');
			case 'region':
				return country.region?.toLowerCase() || '';
			case 'subregion':
				return country.subregion?.toLowerCase() || '';
			case 'languages':
				return country.languages 
					? Object.values(country.languages).join(' ').toLowerCase() 
					: '';
			case 'currencies':
				return country.currencies 
					? Object.values(country.currencies)
						.map((curr: any) => `${curr.name || ''} ${curr.symbol || ''}`)
						.join(' ').toLowerCase()
					: '';
			case 'all':
				// Search all fields
				const allText = [
					country.name?.common || '',
					Array.isArray(country.capital) ? country.capital.join(' ') : (country.capital || ''),
					country.region || '',
					country.subregion || '',
					country.languages ? Object.values(country.languages).join(' ') : '',
					country.currencies ? Object.values(country.currencies)
						.map((curr: any) => `${curr.name || ''} ${curr.symbol || ''}`)
						.join(' ') : ''
				].join(' ').toLowerCase();
				return allText;
			default:
				return '';
		}
	}

	let filtered = $derived.by(() => {
		if (!countries || countries.length === 0) {
			return [];
		}
		
		if (!search.trim()) {
			return countries;
		}

		const searchTerm = search.toLowerCase().trim();
		
		return countries.filter((country: any) => {
			const searchableText = getSearchableText(country, searchField);
			return searchableText.includes(searchTerm);
		});
	});

	// Pagination calculations
	let totalPages = $derived(Math.ceil(filtered.length / itemsPerPage));
	let paginatedCountries = $derived.by(() => {
		const start = (currentPage - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		return filtered.slice(start, end);
	});

	// Navigation functions
	function previousPage() {
		if (currentPage > 1) {
			currentPage--;
		}
	}

	function nextPage() {
		if (currentPage < totalPages) {
			currentPage++;
		}
	}

	// Reset to first page when search changes
	$effect(() => {
		currentPage = 1;
	});

	// Update selected when data changes
	$effect(() => {
		selected = currentRegion;
	});

	// Helper function to display country details
	function getCountryDetails(country: any): { capital: string; languages: string; currencies: string } {
		const capital = Array.isArray(country.capital) 
			? country.capital.join(', ') 
			: (country.capital || 'N/A');
		
		const languages = country.languages 
			? Object.values(country.languages).join(', ') 
			: 'N/A';
		
		const currencies = country.currencies 
			? Object.values(country.currencies)
				.map((curr: any) => `${curr.name} (${curr.symbol || 'N/A'})`)
				.join(', ')
			: 'N/A';

		return { capital, languages, currencies };
	}

	// Debug logging
	$effect(() => {
		console.log('[client] countries loaded:', countries.length);
		console.log('[client] region:', currentRegion);
		console.log('[client] filtered:', filtered.length);
	});
</script>

<div class="max-w-6xl mx-auto my-12 px-4">
	<!-- Region & Search -->
	<div class="mb-6 flex flex-col md:flex-row md:items-end gap-4">
		<div>
			<label for="region-select" class="block text-black dark:text-white mb-1 font-semibold">Select Region:</label>
			<select id="region-select" bind:value={selected} onchange={changeRegion} class="p-2 rounded bg-gray-100 text-black dark:bg-gray-800 dark:text-white">
				<option value="">All</option>
				<option value="africa">Africa</option>
				<option value="americas">Americas</option>
				<option value="asia">Asia</option>
				<option value="europe">Europe</option>
				<option value="oceania">Oceania</option>
			</select>
		</div>

		<div>
			<label for="search-field" class="block text-black dark:text-white mb-1 font-semibold">Search In:</label>
			<select id="search-field" bind:value={searchField} class="p-2 rounded bg-gray-100 text-black dark:bg-gray-800 dark:text-white">
				<option value="all">All Fields</option>
				<option value="name">Country Name</option>
				<option value="capital">Capital</option>
				<option value="region">Region</option>
				<option value="subregion">Subregion</option>
				<option value="languages">Languages</option>
				<option value="currencies">Currencies</option>
			</select>
		</div>

		<div class="flex-1">
			<label for="search-country" class="block text-black dark:text-white mb-1 font-semibold">Search Country:</label>
			<input
				id="search-country"
				type="text"
				bind:value={search}
				placeholder="e.g. India, Delhi, English, Euro..."
				class="p-2 rounded w-full bg-gray-100 text-black dark:bg-gray-800 dark:text-white"
			/>
		</div>
	</div>

	<!-- Results Info -->
	<div class="mb-4">
		<p class="text-black dark:text-white">Showing {paginatedCountries.length} of {filtered.length} countries {currentRegion ? `in ${currentRegion}` : ''}</p>
		<p class="text-black dark:text-white text-sm opacity-75">Total loaded: {countries.length} | Page {currentPage} of {totalPages}</p>
		{#if search.trim()}
			<p class="text-black dark:text-white text-sm opacity-75">
				Searching for "{search}" in {searchField === 'all' ? 'all fields' : searchField}
			</p>
		{/if}
	</div>

	<!-- Country Cards -->
	{#if paginatedCountries.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each paginatedCountries as country}
				{@const details = getCountryDetails(country)}
				<a href={`/country/${country.name.common}`} class="flex flex-col bg-gray-800 dark:bg-gray-900 text-white rounded-lg shadow-lg p-6 hover:scale-105 transition">
					<div class="bg-white rounded shadow p-2 w-full h-24 flex items-center justify-center mb-4">
						<img src={country.flags.png} alt="Flag of {country.name.common}" class="w-full h-full object-cover rounded" />
					</div>
					<h2 class="text-xl font-bold text-center mb-3">{country.name.common}</h2>
					<div class="text-sm space-y-1 text-gray-300">
						<p><span class="font-semibold">Capital:</span> {details.capital}</p>
						<p><span class="font-semibold">Region:</span> {country.region || 'N/A'}</p>
						{#if country.subregion}
							<p><span class="font-semibold">Subregion:</span> {country.subregion}</p>
						{/if}
						<p><span class="font-semibold">Languages:</span> {details.languages}</p>
						<p><span class="font-semibold">Currencies:</span> {details.currencies}</p>
					</div>
				</a>
			{/each}
		</div>

		<!-- Pagination Controls -->
		{#if totalPages > 1}
			<div class="flex items-center justify-center mt-8 gap-4">
				<button 
					onclick={previousPage}
					disabled={currentPage === 1}
					class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
				>
					<span class="text-lg">←</span>
					Previous
				</button>

				<div class="flex items-center gap-2">
					<span class="text-black dark:text-white text-sm">Page</span>
					<span class="bg-blue-600 px-3 py-1 rounded font-semibold text-white">{currentPage}</span>
					<span class="text-black dark:text-white text-sm">of {totalPages}</span>
				</div>

				<button 
					onclick={nextPage}
					disabled={currentPage === totalPages}
					class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
				>
					Next
					<span class="text-lg">→</span>
				</button>
			</div>
		{/if}
	{:else if countries.length > 0}
		<div class="text-center py-8">
			<p class="text-black dark:text-white text-lg">No countries found matching "{search}"</p>
			<p class="text-black dark:text-white text-sm opacity-75 mt-2">
				Try searching in different fields or adjusting your search term
			</p>
		</div>
	{:else}
		<div class="text-center py-8">
			<p class="text-black dark:text-white text-lg">Loading countries...</p>
		</div>
	{/if}
</div>