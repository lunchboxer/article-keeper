# Article Keeper

A content repo for Article-a-day. Article-a-day is a reading routine for 10-20 minutes a day for elementary students to practice nonfiction reading. Read all about it at [Readworks.org](https://www.readworks.org/teacher-guide/article-a-day-routine.html).

## Set up

Article-keeper is a sveltekit project which uses the static site generator. In addition there is an article index generator and a pdf generator. These are called together as `npm run build`. The index generation is fast and simple using the filesytem. The pdf generation uses puppeteer to print the articles from the rendered site to pdfs. To run the pdf generator the rendered site must be available. The dev server will work fine for this. Run `npm run dev` and double check that the url hard-coded in `./generate-pdfs.js` matches the dev server output.

### Puppeteer problems

If you have trouble installing puppeteer (because of internet connectivity to google servers for example 🇨🇳), you can install chrome or chromium some other way and run the puppeteer install with `PUPPETEER_SKIP_DOWNLOAD=true npm install puppeteer`. By default it downloads and uses it own chrome executeable. As a result you'll then need to direct it to the chrome executeable on your machine by passing `executablePath: process.env.CHROME_EXECUTABLE_PATH` as an option to `puppeteer.launch()` and ensure that you have the environment variable set. Otherwise, comment out the line.

## Adding articles

Add articles in markdown format to `static/articles-md/`. They will need a title and the filename must follow the pattern `1101A.md` where the first digit is the number of the unit of inquiry, the second is the number of the line of inquiry, the fourth and firth are a zero-padded two-digit article number, and the letter is the level of the article starting from A as the highest. The index generation process will automatically fill in the filename with the slug generated from the title so that the articles directory is human-readable.
