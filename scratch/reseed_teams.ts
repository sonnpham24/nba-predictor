import { fetchNbaTeams } from '../lib/scraper';

async function main() {
  console.log('Reseeding NBA Teams with normalized Eastern/Western conference...');
  const res = await fetchNbaTeams();
  console.log('Reseed result:', res);
}

main().catch(console.error);
