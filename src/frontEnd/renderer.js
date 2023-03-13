console.log('Now in Browser console');

const { startScraping, stopAllScraping, updadeQueryString, getUserSettings } =
  window.electron;

// startScraping('scrape');
// startScraping('scrape');
console.log('done');

// getAllWebContents();
// On first open, show a page to user to show some settings --> Call an endpoint to

document.getElementById('closeAllWin').addEventListener('click', () => {
  stopAllScraping('stopAllScraping');
});
document.getElementById('startScrape').addEventListener('click', () => {
  const text = startScraping('scrape');
  console.log(text);
  console.log(getUserSettings());
});
