import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const region = url.searchParams.get('region');
	console.log('[region param]:', region);

	// Updated to include additional fields
	const fields = 'name,flags,capital,region,subregion,languages,currencies';
	const endpoint = region 
		? `https://restcountries.com/v3.1/region/${region}?fields=${fields}`
		: `https://restcountries.com/v3.1/all?fields=${fields}`;

	console.log('[fetching from]:', endpoint);

	try {
		const res = await fetch(endpoint);
		if (!res.ok) {
			console.error('[fetch failed]:', res.status, res.statusText);
			return { countries: [], region };
		}

		const countries = await res.json();
		console.log('[countries fetched]:', countries.length);

		return {
			countries: countries || [],
			region
		};
	} catch (err) {
		console.error('[fetch error]:', err);
		return { countries: [], region };
	}
};