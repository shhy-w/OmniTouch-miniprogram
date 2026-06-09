import { loadDevices, mergeStatus, saveDevices } from '@/services/device'
import { mqttService } from '@/services/mqtt'
import { commandLabelMap } from '@/constants/commands'
import type { CommandPayload, Device, DeviceEvent, DeviceStatus, LastCommand } from '@/types/device'

const unsafeOffline = ['lock', 'unlock', 'reboot']

class DeviceStore {
  devices: Device[] = loadDevices()
  currentDeviceId = this.devices[0]?.id || ''
  connected = false
  events: DeviceEvent[] = []
  offlineQueue: CommandPayload[] = []
  lastCommand: LastCommand = {
    cmd: '',
    label: '暂无指令',
    state: 'idle',
    detail: '等待用户操作',
    ts: Date.now()
  }

  get currentDevice(): Device | undefined {
    return this.devices.find((device) => device.id === this.currentDeviceId)
  }

  selectDevice(id: string) {
    this.currentDeviceId = id
    mqttService.disconnect()
    const device = this.currentDevice
    if (device?.status.online) mqttService.connect(id)
    if (!device?.status.online) {
      this.lastCommand = {
        cmd: 'connect',
        label: '重新连接',
        state: 'failed',
        detail: '设备离线，等待状态上报',
        ts: Date.now()
      }
    }
  }

  bindMqtt() {
    mqttService.onConnection((connected) => {
      this.connected = connected
      if (connected) this.flushQueue()
    })
    mqttService.onStatus((status) => this.updateCurrentStatus(status))
    mqttService.onEvent((event) => this.pushEvent(event))
  }

  updateCurrentStatus(status: Partial<DeviceStatus>) {
    this.devices = this.devices.map((device) => {
      return device.id === this.currentDeviceId ? mergeStatus(device, status) : device
    })
    saveDevices(this.devices)
  }

  sendCommand(cmd: string, params?: CommandPayload['params']): boolean {
    const label = commandLabelMap[cmd] || cmd
    if (!this.connected) {
      if (!unsafeOffline.includes(cmd)) {
        const msgId = `offline-${Date.now()}`
        this.offlineQueue.push({ cmd, msg_id: msgId, params })
        this.lastCommand = {
          cmd,
          label,
          state: 'cached',
          msgId,
          detail: '设备离线，指令已加入补发队列',
          ts: Date.now()
        }
      } else {
        this.lastCommand = {
          cmd,
          label,
          state: 'failed',
          detail: '该指令需要设备在线执行',
          ts: Date.now()
        }
      }
      return false
    }
    const sent = mqttService.sendCommand(cmd, params)
    this.lastCommand = {
      cmd,
      label,
      state: sent ? 'sending' : 'failed',
      topic: `term/${this.currentDeviceId}/cmd`,
      detail: sent ? '指令已发布，等待设备事件回执' : 'MQTT 未连接',
      ts: Date.now()
    }
    return sent
  }

  sendVoiceText(text: string) {
    return mqttService.sendVoiceText(text)
  }

  renameDevice(id: string, name: string) {
    this.devices = this.devices.map((device) => device.id === id ? { ...device, name } : device)
    saveDevices(this.devices)
  }

  removeDevice(id: string) {
    this.devices = this.devices.filter((device) => device.id !== id)
    this.currentDeviceId = this.devices[0]?.id || ''
    saveDevices(this.devices)
  }

  addDevice(device: Device) {
    const exists = this.devices.some((item) => item.id === device.id)
    this.devices = exists ? this.devices : [device, ...this.devices]
    this.currentDeviceId = device.id
    saveDevices(this.devices)
  }

  pushEvent(event: DeviceEvent) {
    this.events = [event, ...this.events].slice(0, 20)
    if (event.event === 'cmd_done' || event.event === 'cmd_fail') {
      this.lastCommand = {
        ...this.lastCommand,
        state: event.event === 'cmd_done' ? 'done' : 'failed',
        msgId: event.msg_id || this.lastCommand.msgId,
        detail: event.detail || event.reason || this.lastCommand.detail,
        ts: Date.now()
      }
    }
  }

  clearCache() {
    this.devices = []
    this.events = []
    this.offlineQueue = []
    this.lastCommand = {
      cmd: '',
      label: '暂无指令',
      state: 'idle',
      detail: '等待用户操作',
      ts: Date.now()
    }
    saveDevices([])
  }

  private flushQueue() {
    const queue = [...this.offlineQueue]
    this.offlineQueue = []
    queue.forEach((item) => mqttService.sendCommand(item.cmd, item.params))
  }
}

export const deviceStore = new DeviceStore()
