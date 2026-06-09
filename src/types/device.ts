export type DeviceMode = 'voice' | 'gesture' | 'mqtt' | 'offline'

export interface DeviceStatus {
  online: boolean
  locked: boolean
  mode: DeviceMode
  battery: number
  charging: boolean
  rssi: number
  currentPage: number
  totalPages: number
  pcName: string
  firmware: string
  ip: string
  mac: string
  laserOn: boolean
  backlight: number
  backlightAuto: boolean
  zoom: number
  lastSeen: string
}

export interface Device {
  id: string
  name: string
  status: DeviceStatus
}

export interface DeviceEvent {
  event: string
  msg_id?: string
  detail?: string
  reason?: string
  command?: string
  gesture_id?: string
  confidence?: number
  ts: number
}

export interface CommandPayload {
  cmd: string
  msg_id: string
  params?: Record<string, string | number | boolean>
}

export type CommandState = 'idle' | 'sending' | 'done' | 'cached' | 'failed'

export interface LastCommand {
  cmd: string
  label: string
  state: CommandState
  topic?: string
  msgId?: string
  detail: string
  ts: number
}
