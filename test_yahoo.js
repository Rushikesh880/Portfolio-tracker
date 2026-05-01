const yahooFinance = require('yahoo-finance2').default;

async function test() {
  try {
    const results = await yahooFinance.search('TCS', { quotesCount: 5 });
    console.log("Search results for TCS:");
    results.quotes.forEach(q => {
      console.log(`${q.symbol}: ${q.shortname} - ${q.exchange}`);
    });
    
    // Test the first quote
    const firstSymbol = results.quotes[0].symbol;
    const quote = await yahooFinance.quote(firstSymbol);
    console.log(`\nQuote for ${firstSymbol}:`, quote.regularMarketPrice);
    
    // Wait what about HDFC Mutual Fund?
    const mfResults = await yahooFinance.search('HDFC Mutual Fund', { quotesCount: 5 });
    console.log("\nSearch results for HDFC Mutual Fund:");
    mfResults.quotes.forEach(q => {
      console.log(`${q.symbol}: ${q.shortname} - ${q.exchange}`);
    });
  } catch (e) {
    console.error(e);
  }
}
test();
