import { browser, expect, $ } from '@wdio/globals'

import DashboardPage from '#page-objects/dashboard.page'

const sections = [
  'Live commit stream',
  'Key Metrics',
  'Repository Metrics',
  'Persona / role insights',
  'Code Quality',
  'Repository-level insights',
  'Contributor-level insights',
  'Contributor × repository heatmap'
]

const kpis = [
  'Copilot Adoption',
  'Avg Cycle Time',
  'Copilot Leverage',
  'Copilot Assist Rate',
  'Copilot Line Rate',
  'Rework Ratio',
  'Net Lines Delivered'
]

const personas = ['Developers', 'DevOps Engineers', 'QA Engineers']

describe('Copilot Dashboard', () => {
  beforeEach(async () => {
    await DashboardPage.open()
    await DashboardPage.waitForDataToLoad()
  })

  it('loads the dashboard shell with the expected title', async () => {
    await expect(browser).toHaveTitle(
      'Copilot analytics | mmo-cr-copilot-dashboard'
    )
    await expect(DashboardPage.root).toBeDisplayed()
    await expect(DashboardPage.skipLink).toHaveAttribute(
      'href',
      '#main-content'
    )
    await expect(await DashboardPage.documentLanguage()).toBe('en')
  })

  it('renders the service header', async () => {
    await expect(DashboardPage.banner).toBeDisplayed()
    await expect(DashboardPage.logo).toBeDisplayed()
    await expect(DashboardPage.serviceHeading).toHaveText(
      'MMO Catch Recording Code Delivery Insights'
    )
    await expect(DashboardPage.serviceTagline).toHaveText(
      'Accelerated delivery using GitHub Copilot'
    )
    await expect(DashboardPage.dateRangeButton).toBeDisplayed()
    await expect(DashboardPage.settingsButton).toBeEnabled()
    await expect(DashboardPage.themeToggle).toBeEnabled()
  })

  it('opens on the global overview with an All Repositories breadcrumb', async () => {
    await expect(DashboardPage.viewHeading).toHaveText('Global Overview')
    await expect(DashboardPage.breadcrumb).toHaveText(/All Repositories/i)
    await expect(DashboardPage.backButton).not.toExist()
  })

  it('renders every dashboard section', async () => {
    for (const section of sections) {
      await expect(DashboardPage.sectionHeading(section)).toExist()
    }
  })

  it('resolves the headline KPI cards away from their loading state', async () => {
    for (const kpi of kpis) {
      await expect(DashboardPage.kpiCard(kpi)).toBeDisplayed()
    }
    await expect(DashboardPage.main).not.toHaveText(/Loading…/)
  })

  it('streams commit data into an accessible table', async () => {
    await expect(DashboardPage.commitStreamChart).toBeDisplayed()

    const rows = await DashboardPage.commitStreamRows
    expect(rows.length).toBeGreaterThan(0)
  })

  it('summarises quality gates and persona breakdowns', async () => {
    const gates = await DashboardPage.qualityGateItems
    expect(gates.length).toBe(3)

    for (const label of ['Passed', 'Failed', 'No analysis']) {
      await expect(DashboardPage.qualityGateSummary).toHaveText(
        new RegExp(label, 'i')
      )
    }

    for (const persona of personas) {
      await expect(DashboardPage.personaCard(persona)).toBeDisplayed()
    }
  })

  it('offers quick date ranges from the sprint selector', async () => {
    await DashboardPage.dateRangeButton.click()

    await expect(DashboardPage.banner).toHaveText(/quick ranges/i)
    await expect($('button*=Apply custom range')).toBeDisplayed()
  })

  it('toggles between light and dark themes', async () => {
    await expect(DashboardPage.themeToggle).toHaveAttribute(
      'aria-label',
      'Switch to dark theme'
    )
    await expect(await DashboardPage.currentTheme()).toBe('light')

    await DashboardPage.themeToggle.click()

    await expect(DashboardPage.themeToggle).toHaveAttribute(
      'aria-label',
      'Switch to light theme'
    )
    await expect(await DashboardPage.currentTheme()).toBe('dark')
  })

  it('drills into a repository and returns to the overview', async () => {
    await DashboardPage.repositoryLink('mmo-cr-android').click()

    await expect(DashboardPage.viewHeading).toHaveText('mmo-cr-android')
    await expect(DashboardPage.breadcrumb).toHaveText(/mmo-cr-android/)

    await DashboardPage.backButton.click()

    await expect(DashboardPage.viewHeading).toHaveText('Global Overview')
  })

  it('shows persona mappings and the audit log in settings', async () => {
    await DashboardPage.settingsButton.click()

    await expect(DashboardPage.viewHeading).toHaveText('Settings')
    await expect(DashboardPage.breadcrumb).toHaveText(/Settings/i)
    await expect(DashboardPage.personaMappingTable).toBeDisplayed()
    await expect(DashboardPage.auditLogTable).toBeDisplayed()

    await DashboardPage.backButton.click()

    await expect(DashboardPage.viewHeading).toHaveText('Global Overview')
  })
})
