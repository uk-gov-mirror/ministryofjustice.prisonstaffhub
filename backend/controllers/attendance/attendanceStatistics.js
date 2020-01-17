const moment = require('moment')
const config = require('../../config')

const { stripWarning } = require('../../mappers')

const {
  capitalize,
  capitalizeStart,
  switchDateFormat,
  getCurrentPeriod,
  pascalToString,
  readableDateFormat,
  stripAgencyPrefix,
} = require('../../utils')

const attendanceReasonStatsUrl = '/manage-prisoner-whereabouts/attendance-reason-statistics'

const formatReason = ({ name, triggersIEPWarning }) =>
  triggersIEPWarning.includes(capitalizeStart(name))
    ? `${stripWarning(capitalize(pascalToString(name)))} with warning`
    : capitalize(pascalToString(name))

const buildStatsViewModel = (dashboardStats, triggersIEPWarning) => {
  const mapReasons = reasons =>
    Object.keys(reasons).map(name => ({
      id: capitalizeStart(name),
      name: formatReason({ name, triggersIEPWarning }),
      value: Number(reasons[name]),
    }))

  return {
    ...dashboardStats,
    attended: dashboardStats.paidReasons.attended,
    paidReasons: mapReasons(dashboardStats.paidReasons).filter(
      nvp => nvp.name && nvp.name.toLowerCase() !== 'attended'
    ),
    unpaidReasons: mapReasons(dashboardStats.unpaidReasons),
  }
}

const periodDisplayLookup = {
  AM: 'AM',
  PM: 'PM',
  ED: 'ED',
  AM_PM: 'AM + PM',
}

const extractCaseLoadInfo = caseloads => {
  const activeCaseLoad = caseloads.find(cl => cl.currentlyActive)
  const inactiveCaseLoads = caseloads.filter(cl => cl.currentlyActive === false)
  const activeCaseLoadId = activeCaseLoad ? activeCaseLoad.caseLoadId : null

  return {
    activeCaseLoad,
    inactiveCaseLoads,
    activeCaseLoadId,
  }
}

const absentReasonTableViewModel = offenderData => ({
  sortOptions: [
    { value: '0_ascending', text: 'Name (A-Z)' },
    { value: '0_descending', text: 'Name (Z-A)' },
    { value: '2_ascending', text: 'Location (A-Z)' },
    { value: '2_descending', text: 'Location (Z-A)' },
    { value: '3_ascending', text: 'Activity (A-Z)' },
    { value: '3_descending', text: 'Activity (Z-A)' },
  ],
  offenders: offenderData
    .sort((a, b) => a.offenderName.localeCompare(b.offenderName, 'en', { ignorePunctuation: true }))
    .map(data => {
      const quickLookUrl = `${config.app.notmEndpointUrl}offenders/${data.offenderNo}/quick-look`

      // Return the data in the appropriate format to seed the table macro
      return [
        {
          html: data.location ? `<a href=${quickLookUrl} target="_blank">${data.offenderName}</a>` : data.offenderName,
        },
        {
          text: data.offenderNo,
        },
        {
          text: data.location || '--',
        },
        {
          text: data.activity,
        },
        {
          text: data.comments,
        },
      ]
    }),
})

const validateDates = dates => {
  const errors = []

  const fromDate = moment(dates.fromDate, 'DD/MM/YYYY')
  const toDate = moment(dates.toDate, 'DD/MM/YYYY')

  const now = moment()
  if (fromDate.isAfter(now, 'day'))
    errors.push({ text: 'Select a date range that is not in the future', href: '#fromDate' })

  if (fromDate.isAfter(now, 'day'))
    errors.push({ text: 'Select a date range that is not in the future', href: '#toDate' })

  if (toDate) {
    const weeks = fromDate.diff(toDate, 'week')

    if (Math.abs(weeks) > 2)
      errors.push({ text: 'Select a date range that does not exceed two weeks', href: '#fromDate' })
  }
  return errors
}

const dateRangeForStats = (subtractWeeks = 0) => {
  const sunday = moment()
    .subtract(subtractWeeks, 'week')
    .day(0)
    .format('DD/MM/YYYY')
  const saturday = moment()
    .subtract(subtractWeeks, 'week')
    .day(6)
    .format('DD/MM/YYYY')

  return {
    fromDate: sunday,
    toDate: saturday,
  }
}

const formatDatesForDisplay = ({ fromDate, toDate }) => {
  if (fromDate && toDate) {
    if (fromDate !== toDate)
      return `${readableDateFormat(fromDate, 'D/MM/YYYY')} to ${readableDateFormat(toDate, 'D/MM/YYYY')}`
  }

  return `${readableDateFormat(fromDate, 'D/MM/YYYY')}`
}

const getStatPresetsLinks = ({ activeCaseLoadId }) => {
  const currentWeek = dateRangeForStats()
  const previousWeek = dateRangeForStats(1)

  const statsForCurrentWeek = `${attendanceReasonStatsUrl}?agencyId=${activeCaseLoadId}&period=AM_PM&fromDate=${
    currentWeek.fromDate
  }&toDate=${currentWeek.toDate}`

  const statsForPreviousWeek = `${attendanceReasonStatsUrl}?agencyId=${activeCaseLoadId}&period=AM_PM&fromDate=${
    previousWeek.fromDate
  }&toDate=${previousWeek.toDate}`

  const statsFor2Weeks = `${attendanceReasonStatsUrl}?agencyId=${activeCaseLoadId}&period=AM_PM&fromDate=${
    previousWeek.fromDate
  }&toDate=${currentWeek.toDate}`

  return {
    statsForCurrentWeek,
    statsForPreviousWeek,
    statsFor2Weeks,
  }
}

const urlWithDefaultParameters = ({ activeCaseLoadId, currentPeriod }) => {
  const today = moment().format('DD/MM/YYYY')
  return `${attendanceReasonStatsUrl}?agencyId=${activeCaseLoadId}&period=${currentPeriod}&fromDate=${today}`
}

const attendanceStatisticsFactory = (oauthApi, elite2Api, whereaboutsApi, logError) => {
  const attendanceStatistics = async (req, res) => {
    const currentPeriod = getCurrentPeriod(moment().format())

    const { agencyId, fromDate, toDate } = req.query || {}
    const period = (req.query && req.query.period) || currentPeriod

    try {
      const [user, caseloads, roles] = await Promise.all([
        oauthApi.currentUser(res.locals),
        elite2Api.userCaseLoads(res.locals),
        oauthApi.userRoles(res.locals),
      ])

      const { activeCaseLoad, inactiveCaseLoads, activeCaseLoadId } = extractCaseLoadInfo(caseloads)

      if (!period || !fromDate) return res.redirect(urlWithDefaultParameters({ activeCaseLoadId, currentPeriod }))

      const shouldClearFormValues = Boolean(fromDate && toDate)

      const mainViewModel = {
        title: 'Attendance reason statistics',
        user: {
          displayName: user.name,
          activeCaseLoad: {
            description: activeCaseLoad.description,
            id: activeCaseLoadId,
          },
        },
        displayDate: formatDatesForDisplay({ fromDate, toDate }),
        caseLoadId: activeCaseLoad.caseLoadId,
        allCaseloads: caseloads,
        inactiveCaseLoads,
        userRoles: roles,
        shouldClearFormValues,
        period,
        fromDate,
        toDate,
        clickThrough: {
          fromDate,
          toDate,
          period,
        },
        displayPeriod: periodDisplayLookup[period],
        ...getStatPresetsLinks({ activeCaseLoadId }),
      }

      if (fromDate) {
        const errors = validateDates({ fromDate, toDate })

        if (errors.length > 0)
          return res.render('attendanceStatistics.njk', {
            errors,
            ...mainViewModel,
          })
      }

      const fromDateValue = switchDateFormat(fromDate, 'DD/MM/YYYY')
      const toDateValue = toDate && switchDateFormat(toDate, 'DD/MM/YYYY')

      const dashboardStats = await whereaboutsApi.getAttendanceStats(res.locals, {
        agencyId,
        fromDate: fromDateValue,
        toDate: toDateValue || fromDateValue,
        period: period === 'AM_PM' ? '' : period,
      })

      const { triggersIEPWarning } = await whereaboutsApi.getAbsenceReasons(res.locals)

      return res.render('attendanceStatistics.njk', {
        ...mainViewModel,
        dashboardStats: buildStatsViewModel(dashboardStats, triggersIEPWarning),
      })
    } catch (error) {
      logError(req.originalUrl, error, 'Sorry, the service is unavailable')
      return res.render('error.njk', {
        url: attendanceReasonStatsUrl,
      })
    }
  }

  const attendanceStatisticsOffendersList = async (req, res) => {
    const { reason } = req.params
    const { agencyId, period, fromDate, toDate } = req.query || {}

    const formattedFromDate = switchDateFormat(fromDate, 'DD/MM/YYYY')
    const formattedToDate = switchDateFormat(toDate, 'DD/MM/YYYY')
    const currentPeriod = getCurrentPeriod(moment().format())
    const today = moment().format('DD/MM/YYYY')

    try {
      const [user, caseloads, roles] = await Promise.all([
        oauthApi.currentUser(res.locals),
        elite2Api.userCaseLoads(res.locals),
        oauthApi.userRoles(res.locals),
      ])

      const { activeCaseLoad, activeCaseLoadId } = extractCaseLoadInfo(caseloads)

      if (!period || !fromDate) {
        return res.redirect(
          `${attendanceReasonStatsUrl}/reason/${reason}?agencyId=${activeCaseLoadId}&period=${currentPeriod}&fromDate=${today}&toDate=${today}`
        )
      }

      const { absences } = await whereaboutsApi.getAbsences(res.locals, {
        agencyId,
        reason,
        period: period === 'AM_PM' ? '' : period,
        fromDate: formattedFromDate,
        toDate: formattedToDate || formattedFromDate,
      })

      const offenderData = absences.map(absence => ({
        offenderName: `${capitalize(absence.lastName)}, ${capitalize(absence.firstName)}`,
        offenderNo: absence.offenderNo,
        location: stripAgencyPrefix(absence.cellLocation, agencyId),
        activity: absence.eventDescription,
        comments: absence.comments,
        eventDate: readableDateFormat(absence.eventDate, 'YYYY-MM-DD'),
      }))

      const { offenders, sortOptions } = absentReasonTableViewModel(offenderData)
      const { triggersIEPWarning } = await whereaboutsApi.getAbsenceReasons(res.locals)
      const displayReason = formatReason({ name: reason, triggersIEPWarning })

      return res.render('attendanceStatisticsOffendersList.njk', {
        title: `${displayReason}`,
        user: {
          displayName: user.name,
          activeCaseLoad: {
            description: activeCaseLoad.description,
            id: activeCaseLoadId,
          },
        },
        displayDate: formatDatesForDisplay({ fromDate, toDate }),
        displayPeriod: periodDisplayLookup[period],
        reason: displayReason,
        dashboardUrl: `${attendanceReasonStatsUrl}?agencyId=${agencyId}&period=${period}&fromDate=${fromDate}&toDate=${toDate}`,
        offenders,
        sortOptions,
        caseLoadId: activeCaseLoad.caseLoadId,
        allCaseloads: caseloads,
        userRoles: roles,
      })
    } catch (error) {
      logError(req.originalUrl, error, 'Sorry, the service is unavailable')
      return res.render('error.njk', {
        url: `${attendanceReasonStatsUrl}/reason/${reason}`,
      })
    }
  }

  return {
    attendanceStatistics,
    attendanceStatisticsOffendersList,
  }
}

module.exports = { attendanceStatisticsFactory }