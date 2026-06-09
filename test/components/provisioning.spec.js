const { parseDeviceQr } = require('../../src/services/provisioning')

describe('provisioning service', () => {
  it('parses esp32 device id from qr text', () => {
    expect(parseDeviceQr('https://setup.local?device=esp32-cb8824')).toBe('esp32-cb8824')
  })

  it('creates fallback id when qr text does not include device id', () => {
    expect(parseDeviceQr('invalid-text')).toMatch(/^esp32-\d{6}$/)
  })
})
