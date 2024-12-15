const { chromium } = require('playwright');
const fs = require('fs');

async function scrapeYahooArticles() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const articlesData = [];

  try {
    await page.goto('https://www.yahoo.com');
    await page.waitForSelector('h3 u.StretchedBox');
    const articles = await page.$$eval('h3 u.StretchedBox', elements => {
      return elements.map(el => {
        const title = el.innerText.trim();
        const link = el.closest('a')?.href || '';
        return { title, link };
      });
    });

    articlesData.push(...articles);

    const csvHeaders = 'Title,Link\n';
    const csvRows = articlesData
      .map(
        article =>
          `"${article.title.replace(/"/g, '""')}","${article.link}"`
      )
      .join('\n');
    const csvContent = csvHeaders + csvRows;

    fs.writeFileSync('yahoo_articles.csv', csvContent, 'utf8');
    console.log(`Data of ${articlesData.length} articles has been written to yahoo_articles.csv`);
  } catch (error) {
    console.error('Error during scraping:', error);
  } finally {
    await browser.close();
  }
}

scrapeYahooArticles();
