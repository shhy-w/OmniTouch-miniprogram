import { createDeviceFromScan } from '@/services/device'
import type { Device } from '@/types/device'

export interface WifiForm {
  ssid: string
  password: string
}

export function parseDeviceQr(raw: string): string {
  const match = raw.match(/(esp32-[a-zA-Z0-9]{6,})/)
  return match ? match[1].toLowerCase() : `esp32-${Date.now().toString().slice(-6)}`
}

export function simulateProvisioning(raw: string, form: WifiForm): Promise<Device> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!form.ssid.trim()) {
        reject(new Error('请输入 WiFi 名称'))
        return
      }
      resolve(createDeviceFromScan(parseDeviceQr(raw)))
    }, 900)
  })
}
