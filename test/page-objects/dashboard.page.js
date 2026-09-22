import { browser, $, $$ } from '@wdio/globals'

import { Page } from '#page-objects/page'

const thirtySeconds = 30 * 1000

/**
 * The dashboard is a React SPA whose panels render a "Loading…" placeholder until the analytics
 * backend responds, so every spec waits for the data to settle before asserting.
 */
class DashboardPage extends Page {
  open() {
    return super.open('/')
  }

  get root() {
    return $('#root')
  }

  get skipLink() {
    return $('a[href="#main-content"]')
  }

  get banner() {
    return $('header')
  }

  get main() {
    return $('main')
  }

  get logo() {
    return $('[data-testid="header-logo"]')
  }

  get serviceHeading() {
    return $('h1')
  }

  get serviceTagline() {
    return $('header p')
  }

  get dateRangeButton() {
    return $('header button')
  }

  get settingsButton() {
    return $('button[aria-label="Open settings"]')
  }

  get themeToggle() {
    return $('button.theme-toggle')
  }

  get breadcrumb() {
    return $('nav[aria-label="Breadcrumb"]')
  }

  get backButton() {
    return $('button[aria-label="Back to All Repositories"]')
  }

  get viewHeading() {
    return $('main h2')
  }

  get qualityGateSummary() {
    return $('[aria-label="Quality gate summary"]')
  }

  get qualityGateItems() {
    return $$('[aria-label="Quality gate summary"] [role="listitem"]')
  }

  get repositoryList() {
    return $('ul[aria-label="Open a repository"]')
  }

  get commitStreamChart() {
    return $('figure[aria-label^="Live commit stream"]')
  }

  get commitStreamRows() {
    return $$('figure[aria-label^="Live commit stream"] tbody tr')
  }

  get personaMappingTable() {
    return $('//table[.//th[normalize-space()="GitHub handle"]]')
  }

  get auditLogTable() {
    return $(
      '//table[caption[normalize-space()="Audited changes, newest first"]]'
    )
  }

  /* Section headings are upper-cased by CSS, so match on the DOM text via XPath rather than getText. */
  sectionHeading(name) {
    return $(`//main//h2[normalize-space()="${name}"]`)
  }

  kpiCard(name) {
    return $(
      `//button[contains(@class,"kpi-card")][starts-with(normalize-space(.), "${name}")]`
    )
  }

  personaCard(persona) {
    return $(`section[aria-label="${persona} — Copilot delivery metrics"]`)
  }

  repositoryLink(repository) {
    return $(
      `//ul[@aria-label="Open a repository"]//button[starts-with(normalize-space(.), "${repository}")]`
    )
  }

  async waitForDataToLoad() {
    await this.serviceHeading.waitForDisplayed({ timeout: thirtySeconds })
    await browser.waitUntil(
      async () => !(await this.main.getText()).includes('Loading…'),
      {
        timeout: thirtySeconds,
        timeoutMsg: 'Dashboard panels were still loading after 30 seconds'
      }
    )
  }

  currentTheme() {
    return browser.execute(() => document.documentElement.dataset.theme)
  }

  documentLanguage() {
    return browser.execute(() => document.documentElement.lang)
  }
}

export default new DashboardPage()
