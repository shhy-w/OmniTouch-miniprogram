import automator from '@mpxjs/e2e'

describe('device list', () => {
  let miniProgram: any

  beforeAll(async () => {
    try {
      miniProgram = await automator.connect({ wsEndpoint: 'ws://localhost:9420' })
    } catch (e) {
      miniProgram = await automator.launch({
        projectPath: './dist/wx'
      })
    }
  }, 30000)

  it('opens device list page', async () => {
    const page = await miniProgram.reLaunch('/pages/device-list')
    await page.waitFor(500)
    const text = await page.$('.title')
    expect(await text.text()).toContain('我的设备')
  })

  afterAll(async () => {
    await miniProgram.close()
  })
})
