// tracker.js - Runs on GitHub Actions every 10 minutes
const SHEET_URL = process.env.SHEET_URL;

async function fetchBazaar() {
  const response = await fetch('https://blacket.org/worker/bazaar');
  const data = await response.json();
  
  let listings = [];
  if (Array.isArray(data)) listings = data;
  else if (data.bazaar) listings = Object.values(data.bazaar);
  else {
    for (let k in data) {
      if (Array.isArray(data[k])) { listings = data[k]; break; }
    }
  }
  
  // Filter troll prices (>100,000)
  const validListings = listings.filter(l => {
    const price = Number(l.price || 0);
    return price > 0 && price < 100000;
  });
  
  // Group by blook to calculate averages
  const blookPrices = {};
  validListings.forEach(l => {
    const name = l.item || l.blook || l.name;
    const price = Number(l.price || 0);
    if (!blookPrices[name]) blookPrices[name] = [];
    blookPrices[name].push(price);
  });
  
  // Send averages to Google Sheets
  for (const [blook, prices] of Object.entries(blookPrices)) {
    const avg = prices.reduce((a,b) => a + b, 0) / prices.length;
    const url = `${SHEET_URL}?action=addPrice&blook=${encodeURIComponent(blook)}&avg=${avg}&count=${prices.length}`;
    await fetch(url).catch(e => console.log('Error saving price:', blook));
  }
  
  // Send all listings to Google Sheets
  const listingsData = validListings.map(l => ({
    blook: l.item || l.blook || l.name,
    price: Number(l.price || 0),
    seller: l.seller || l.username || '?',
    qty: l.quantity || 1
  }));
  
  const url = `${SHEET_URL}?action=addListings&data=${encodeURIComponent(JSON.stringify(listingsData))}`;
  await fetch(url).catch(e => console.log('Error saving listings'));
  
  console.log(`Tracked ${validListings.length} listings, ${Object.keys(blookPrices).length} unique blooks`);
}

fetchBazaar();
