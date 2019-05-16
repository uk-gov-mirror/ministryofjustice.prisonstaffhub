package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import org.junit.Rule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses.AdjudicationResponses
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.TestFixture
import uk.gov.justice.digital.hmpps.prisonstaffhub.pages.AdjudicationHistoryPage

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount.ITAG_USER
import static uk.gov.justice.digital.hmpps.prisonstaffhub.specs.AgencySelectionSpecification.NOTM_URL

class AdjudicationsSpecification extends BrowserReportingSpec {
    @Rule
    Elite2Api elite2api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    def setup() {
        def offenderDetails = [
                firstName: "HARRY",
                lastName: "SMITH",
        ]

        elite2api.stubAdjudicationHistory('AA00112', AdjudicationResponses.historyResponse)
        elite2api.stubOffenderDetails('AA00112', offenderDetails)
    }

    TestFixture fixture = new TestFixture(browser, elite2api, oauthApi)

    def "should present adjudication history results"() {

        given: "I am logged in"
        fixture.loginAs(ITAG_USER)

        when: "I do view an offenders adjudications"
        to AdjudicationHistoryPage

        then: "I should be presented with results"

        breadcrumb == [['Home', NOTM_URL],
                       ['Smith, Harry', "${NOTM_URL}offenders/AA00112/quick-look"],
                       ['Adjudications', '']]

        tableRows.size() == 4 // Including header row
        def columns1 = tableRows[1].find('td')
        columns1*.text() == ["1492249", "23/02/2017 10:02", "Moorland (HMP & YOI)",	"Absents himself from any place he is required to be or is present at any place where he is not authorised to be - absence without permission",	"Guilty"]
        def columns2 = tableRows[2].find('td')
        columns2*.text() == ["554213","05/01/2012 15:01", "Onley (HMP)", "Commits any assault - assault on prison officer",	"Not Guilty"]
        def columns3 = tableRows[3].find('td')
        columns3*.text() == ["529404", "03/11/2011 15:11",	"Onley (HMP)",	"Disobeys or fails to comply with any rule or regulation applying to him - offence against good order and discipline","Guilty"]
    }

    def "can filter by establishment"() {

        given: "I am logged in"
        fixture.loginAs(ITAG_USER)

        when: "I do view an offenders adjudications"
        to AdjudicationHistoryPage

        then: "I should be presented with results"

        tableRows.size() == 4

        elite2api.stubAdjudicationHistory('AA00112', AdjudicationResponses.mdihistoryResponse, '?agencyId=MDI')
        when: "I filter establishment to only show moorland"
        establishmentSelect = 'MDI'
        applyFilter.click()

        then: "I should be presented with filtered results"
        at AdjudicationHistoryPage
        tableRows.size() == 2 // Including header row

        def columns1 = tableRows[1].find('td')
        columns1*.text() == ["1492249", "23/02/2017 10:02", "Moorland (HMP & YOI)",	"Absents himself from any place he is required to be or is present at any place where he is not authorised to be - absence without permission",	"Guilty"]
    }

    def "can filter by report date"(){

        given: "I am logged in"
        fixture.loginAs(ITAG_USER)

        when: "I do view an offenders adjudications"
        to AdjudicationHistoryPage

        then: "I should be presented with results"

        tableRows.size() == 4

        elite2api.stubAdjudicationHistory('AA00112', AdjudicationResponses.dateFilteringhistoryResponse, '?fromDate=2012-01-01&toDate=2012-02-01')
        when: "I filter establishment to only show offences in January 2012"
        setFromDate(2012, 0, 1)
        setToDate(2012, 1, 1)
        applyFilter.click()

        then: "I should be presented with filtered results"
        at AdjudicationHistoryPage
        tableRows.size() == 2 // Including header row

        def columns1 = tableRows[1].find('td')
        columns1*.text() == ["554213", "05/01/2012 15:01", "Onley (HMP)", "Commits any assault - assault on prison officer", "Not Guilty"]
    }

    def "can reset filter"() {

        given: "I am logged in"
        fixture.loginAs(ITAG_USER)

        when: "I do view an offenders adjudications"
        to AdjudicationHistoryPage

        then: "I should be presented with results"

        tableRows.size() == 4

        elite2api.stubAdjudicationHistory('AA00112', AdjudicationResponses.mdihistoryResponse, '?agencyId=MDI')

        when: "I filter establishment to only show moorland"
        establishmentSelect = 'MDI'
        applyFilter.click()

        then: "I should be presented with all the results"
        at AdjudicationHistoryPage
        tableRows.size() == 2 // Including header row

        clearFiltersLink.click()
        tableRows.size() == 4
    }
}
