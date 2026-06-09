import type { CommandPayload, DeviceEvent, DeviceStatus } from '@/types/device'

type StatusHandler = (status: Partial<DeviceStatus>) => void
type EventHandler = (event: DeviceEvent) => void
type ConnectionHandler = (connected: boolean) => void

interface PublishRecord {
  topic: string
  payload: CommandPayload
  qos: 0 | 1
}

class DeviceMqttService {
  private deviceId = ''
  private connected = false
  private statusHandler: StatusHandler | null = null
  private eventHandler: EventHandler | null = null
  private connectionHandler: ConnectionHandler | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  private pending: Record<string, ReturnType<typeof setTimeout>> = {}
  public published: PublishRecord[] = []

  connect(deviceId: string) {
    this.deviceId = deviceId
    this.connected = true
    this.connectionHandler?.(true)
    this.startMockStatus()
  }

  disconnect() {
    this.connected = false
    this.connectionHandler?.(false)
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }

  onStatus(handler: StatusHandler) {
    this.statusHandler = handler
  }

  onEvent(handler: EventHandler) {
    this.eventHandler = handler
  }

  onConnection(handler: ConnectionHandler) {
    this.connectionHandler = handler
  }

  sendCommand(cmd: string, params?: CommandPayload['params']): boolean {
    if (!this.connected || !this.deviceId) return false
    const payload: CommandPayload = {
      cmd,
      msg_id: `cmd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      params
    }
    this.published.unshift({
      topic: `term/${this.deviceId}/cmd`,
      payload,
      qos: 1
    })
    this.mockCommandDone(payload)
    return true
  }

  sendVoiceText(text: string): boolean {
    if (!this.connected || !this.deviceId) return false
    this.eventHandler?.({
      event: 'command',
      command: text,
      detail: 'voice text sent to reserved topic',
      ts: Math.floor(Date.now() / 1000)
    })
    return true
  }

  private mockCommandDone(payload: CommandPayload) {
    this.pending[payload.msg_id] = setTimeout(() => {
      delete this.pending[payload.msg_id]
      this.eventHandler?.({
        event: 'cmd_done',
        msg_id: payload.msg_id,
        detail: `${payload.cmd} executed`,
        ts: Math.floor(Date.now() / 1000)
      })
    }, 360)
  }

  private startMockStatus() {
    if (this.timer) clearInterval(this.timer)
    this.timer = setInterval(() => {
      this.statusHandler?.({
        online: true,
        rssi: -42 - Math.floor(Math.random() * 8),
        battery: 82 + Math.floor(Math.random() * 5)
      })
    }, 5000)
  }
}

export const mqttService = new DeviceMqttService()
