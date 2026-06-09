import type { Device, DeviceStatus } from '@/types/device'

declare const wx: {
  getStorageSync: (key: string) => unknown
  setStorageSync: (key: string, value: unknown) => void
}

const STORAGE_KEY = 'smartterm_devices'

const baseStatus: DeviceStatus = {
  online: true,
  locked: false,
  mode: 'mqtt',
  battery: 85,
  charging: false,
  rssi: -45,
  currentPage: 3,
  totalPages: 20,
  pcName: '会议室 PC',
  firmware: 'v1.2.3',
  ip: '192.168.1.105',
  mac: '24:6F:28:CB:88:24',
  laserOn: false,
  backlight: 75,
  backlightAuto: true,
  zoom: 1.5,
  lastSeen: '刚刚'
}

export const fallbackDevices: Device[] = [
  { id: 'esp32-cb8824', name: 'SmartTerm_01', status: { ...baseStatus } },
  {
    id: 'esp32-a1b2c3',
    name: 'SmartTerm_02',
    status: {
      ...baseStatus,
      online: false,
      battery: 42,
      rssi: -72,
      mode: 'offline',
      pcName: '培训室 PC',
      mac: '24:6F:28:A1:B2:C3',
      ip: '未分配',
      lastSeen: '2 小时前'
    }
  }
]

function readStorage(): Device[] | null {
  if (typeof wx === 'undefined') return null
  const value = wx.getStorageSync(STORAGE_KEY)
  return Array.isArray(value) ? value : null
}

function writeStorage(devices: Device[]) {
  if (typeof wx !== 'undefined') wx.setStorageSync(STORAGE_KEY, devices)
}

export function loadDevices(): Device[] {
  return readStorage() || fallbackDevices
}

export function saveDevices(devices: Device[]) {
  writeStorage(devices)
}

export function mergeStatus(device: Device, status: Partial<DeviceStatus>): Device {
  return {
    ...device,
    status: {
      ...device.status,
      ...status,
      lastSeen: status.online === false ? device.status.lastSeen : '刚刚'
    }
  }
}

export function createDeviceFromScan(deviceId: string): Device {
  const suffix = deviceId.slice(-6).toUpperCase()
  return {
    id: deviceId,
    name: `SmartTerm_${suffix}`,
    status: {
      ...baseStatus,
      mac: `24:6F:28:${suffix.slice(0, 2)}:${suffix.slice(2, 4)}:${suffix.slice(4, 6)}`
    }
  }
}
