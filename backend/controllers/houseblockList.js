const express = require('express');
const router = express.Router();
const elite2Api = require('../elite2Api');
const asyncMiddleware = require('../middleware/asyncHandler');
const log = require('../log');
const moment = require('moment');

router.get('/', asyncMiddleware(async (req, res) => {
  const viewModel = await getHouseblockList(req, res);
  res.json(viewModel);
}));

const getHouseblockList = (async (reqIn, res) => {
  // once request is not used passed to downstream services we wont have to manipulate it in this dodgy way
  const req = switchDateFormat(reqIn);

  const events = await elite2Api.getHouseblockList(req, res);
  // Returns array ordered by inmate/cell or name, then start time

  log.info(events.data, 'getHouseblockList data received');
  const rows = [];
  const data = events.data;
  let i = -1;
  let lastOffenderNo = '';
  for (const event of data) {
    if (event.offenderNo !== lastOffenderNo) {
      i++;
      rows[i] = { activity: event };
    } else if (!rows[i].others) {
      rows[i].others = [event];
    } else {
      rows[i].others.push(event);
    }
    lastOffenderNo = event.offenderNo;
  }
  return rows;
});

function switchDateFormat (req) {
  const displayDate = req.query.date;
  if (displayDate) req.query.date = moment(displayDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
  return req;
}

module.exports = { router, getHouseblockList };
