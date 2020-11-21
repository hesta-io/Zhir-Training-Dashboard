var express = require('express');
var numeral = require('numeral');
var readLastLines = require('read-last-lines');
var router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {

  const logsDir = process.env.LOGS_PATH;
  const progress_regex = /LINES PROCESSED: (\d+)? of font # (\d+)?/;
  const font_regex = /gt\/ckb-200\/(.*)?\.\d+/
  const totalNumberOfLines = 45917;

  let batches = [];
  const batchCount = 8;

  for (let i = 0; i < batchCount; i++) {
    let batch = { id: i, name: `Batch ${i + 1}`, file: `${i + 1}.log` };
    let filePath = logsDir + '/' + batch.file;
    batch.logs = await readLastLines.read(filePath, 50);

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
