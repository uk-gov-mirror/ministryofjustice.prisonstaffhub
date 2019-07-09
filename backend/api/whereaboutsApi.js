const { arrayToQueryString } = require('../utils')

const whereaboutsApiFactory = client => {
  const processResponse = () => response => response.data

  const get = (context, url) => client.get(context, url).then(processResponse())
  const post = (context, url, data) => client.post(context, url, data).then(processResponse())
  const put = (context, url, data) => client.put(context, url, data).then(processResponse())

  const getAttendance = (context, { agencyId, period, locationId, date }) =>
    get(context, `/attendance/${agencyId}/${locationId}?date=${date}&period=${period}`)

  // New endpoint for NN-2041
  const getAttendanceForBookings = (context, { agencyId, period, bookings, date }) =>
    get(context, `/attendance/${agencyId}?${arrayToQueryString(bookings, 'bookings')}&date=${date}&period=${period}`)

  const postAttendance = (context, body) => post(context, '/attendance', body)

  const putAttendance = (context, body, id) => put(context, `/attendance/${id}`, body)

  const getAbsenceReasons = (context, body) => get(context, '/attendance/absence-reasons', body)

  return {
    getAttendance,
    getAttendanceForBookings,
    postAttendance,
    putAttendance,
    getAbsenceReasons,
  }
}

module.exports = {
  whereaboutsApiFactory,
}
