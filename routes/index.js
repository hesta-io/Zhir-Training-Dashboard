const express = require('express');
const numeral = require('numeral');
const readLastLines = require('read-last-lines');
const fs = require('fs').promises;
const router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {

  const logsDir = process.env.LOGS_PATH;
  const fontsDir = process.env.FONTS_LIST_PATH;
  const progress_regex = /LINES PROCESSED: (\d+)? of font # (\d+)?/;
  const font_regex = /gt\/ckb-200\/(.*)?\//
  const totalNumberOfLines = 45917;

  let batches = [];
  const batchesCount = process.env.BATCHES_COUNT;

  for (let i = 0; i < batchesCount; i++) {
    let batch = { id: i, name: `Batch ${i + 1}` };
    batch.logs = await readLastLines.read(logsDir + '/' + `${i + 1}.log`, 50);
    batch.logs = batch.logs.split('\n').reverse().join('\n');
    let fontsList = await fs.readFile(fontsDir + '/' + `ckb-${i + 1}.fontslist.txt`, 'utf-8');
    batch.totalFontsCount = fontsList.split('\n').filter(l => l.length > 0).length

    let match = progress_regex.exec(batch.logs);
    if (match)
    {
      let linesProcessed = match[1];
      batch.linesProcessed = numeral(linesProcessed).format(',');
      batch.progress = (linesProcessed / totalNumberOfLines) * 100;
      batch.currentFontCount = match[2];
    }

    match = font_regex.exec(batch.logs);
    if (match)
    {
      if (match[1].indexOf('.') > 0)
        match[1] = match[1].substr(0, match[1].indexOf('.'));

      batch.currentFont = match[1]
    }

    batches.push(batch);
  }
  
  res.render('index', { title: 'Home', siteTitle: 'My App', totalLines: totalNumberOfLines, batches: batches });
});

module.exports = router;
