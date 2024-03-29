const fs = require('fs').promises;
const path = require('path');
const moment = require('moment');
var express = require('express');
const router = express.Router();
const numeral = require('numeral');

/* GET home page. */
router.get('/', async function(req, res, next) {
  let paths = await fs.readdir(process.env.CHECKPOINTS_PATH);
  paths = paths.map(p => path.join(process.env.CHECKPOINTS_PATH, p));
  let checkpoints = [];

  for (let i = 0; i < paths.length; i++)
  {
    let fullPath = paths[i];
    if (!fullPath.endsWith('.checkpoint'))
      continue;

    let stat = await fs.stat(fullPath);

    let name = path.basename(fullPath).replace('.checkpoint', '');
    let parts = name.replace('ckbLayer', '').split('_');

    checkpoints.push({
        fullPath: fullPath,
        date: stat.ctime,
        name: name,
        errorRate: parts[0],
        iteration: numeral(parts[1]).format(',') 
    });
  }

  checkpoints.sort((c1, c2) => c2.date.getTime() - c1.date.getTime());

  res.render('checkpoints', { title: 'Checkpoints', siteTitle: 'My App', checkpoints: checkpoints, moment: moment});
});

module.exports = router;
