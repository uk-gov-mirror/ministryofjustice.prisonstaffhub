package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class GlobalSearchPage extends Page {
    static url = "/globalsearch"

    static at = {
        pageTitle == 'Global search results'
        headerTitle == 'Global search'
    }

    static content = {
        pageTitle { $('h1.heading-large').text() }
        headerTitle { $('.page-header .title').text() }
        tableRows(required: false) { $('tr') }
        nextPage(required: false) { $('#next-page')}
        previousPage(required: false) { $('#previous-page')}
        searchAgainButton { $('#search-again') }
        searchInput { $('#search-text') }
    }
}