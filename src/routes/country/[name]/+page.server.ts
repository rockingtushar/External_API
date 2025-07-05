import type { PageServerLoad } from './$types';

// Type definitions for REST Countries API
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

export const load: PageServerLoad = async ({ params }) => {
	console.log('[country param]:', params.name);

	try {
		// Use fullText=true for exact matches to avoid ambiguity
		const res = await fetch(`https://restcountries.com/v3.1/name/${params.name}?fullText=true`);
		if (!res.ok) {
			console.error('[country fetch failed]:', res.status, res.statusText);
			throw new Error('Country not found');
		}

		const countries: Country[] = await res.json();
		const country = Array.isArray(countries) ? countries[0] : countries;

		// Get countries from the same region for better relevance
		let regionalCountries: Country[] = [];
		if (country.region) {
			try {
				const regionRes = await fetch(`https://restcountries.com/v3.1/region/${country.region}?fields=name,capital,languages,flags,population`);
				if (regionRes.ok) {
					regionalCountries = await regionRes.json();
					// Remove the current country from the list
					regionalCountries = regionalCountries.filter((c: Country) => c.name?.common !== country.name?.common);
				}
			} catch (err) {
				console.error('[regional countries fetch error]:', err);
			}
		}

		console.log('[country fetched]:', country.name.common);
		console.log('[regional countries fetched]:', regionalCountries.length, 'countries');
		 
		return { country, regionalCountries };
	} catch (err) {
		console.error('[country fetch error]:', err);
		throw err;
	}
};