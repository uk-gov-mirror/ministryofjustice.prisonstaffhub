const releaseDatesViewModel = require('./sentenceAndReleaseViewModels/releaseDatesViewModel')
const sentenceAdjustmentsViewModel = require('./sentenceAndReleaseViewModels/sentenceAdjustmentsViewModel')
const courtCasesViewModel = require('./sentenceAndReleaseViewModels/courtCasesViewModel')
const { readableDateFormat } = require('../../utils')

module.exports = ({ prisonerProfileService, prisonApi, systemOauthClient }) => async (req, res) => {
  const { offenderNo } = req.params

  const { username } = req.session.userDetails
  const systemContext = await systemOauthClient.getClientCredentialsTokens(username)

  const [prisonerProfileData, sentenceData, bookingDetails, offenceHistory] = await Promise.all([
    prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
    prisonApi.getPrisonerSentenceDetails(res.locals, offenderNo),
    prisonApi.getDetails(res.locals, offenderNo),
    prisonApi.getOffenceHistory(systemContext, offenderNo),
  ])
  const releaseDates = releaseDatesViewModel(sentenceData.sentenceDetail)

  const { bookingId } = bookingDetails

  const [sentenceAdjustmentsData, courtCaseData, sentenceTermsData] = await Promise.all([
    prisonApi.getSentenceAdjustments(res.locals, bookingId),
    prisonApi.getCourtCases(res.locals, bookingId),
    prisonApi.getSentenceTerms(res.locals, bookingId),
  ])

  const sentenceAdjustments = sentenceAdjustmentsViewModel(sentenceAdjustmentsData)
  const courtCases = courtCasesViewModel({ courtCaseData, sentenceTermsData, offenceHistory })

  return res.render('prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk', {
    prisonerProfileData,
    releaseDates,
    sentenceAdjustments,
    courtCases,
    showSentences: Boolean(courtCases.find(courtCase => courtCase.sentenceTerms.length)),
    effectiveSentenceEndDate:
      sentenceData &&
      sentenceData.sentenceDetail &&
      readableDateFormat(sentenceData.sentenceDetail.effectiveSentenceEndDate, 'YYYY-MM-DD'),
  })
}
