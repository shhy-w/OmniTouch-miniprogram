export interface CommandDefinition {
  cmd: string
  label: string
  icon: string
  params?: Record<string, string | number | boolean>
  unsafeOffline?: boolean
}

export const controlCommands: CommandDefinition[] = [
  { cmd: 'prev_page', label: '上翻', icon: '⏪' },
  { cmd: 'next_page', label: '下翻', icon: '⏩' },
  { cmd: 'zoom_in', label: '放大', icon: '＋', params: { level: 1 } },
  { cmd: 'zoom_out', label: '缩小', icon: '－', params: { level: 1 } },
  { cmd: 'scroll_up', label: '上滚', icon: '↑', params: { amount: 10 } },
  { cmd: 'scroll_down', label: '下滚', icon: '↓', params: { amount: 10 } }
]

export const modeOptions = [
  { label: '语音', value: 'voice' },
  { label: '手势', value: 'gesture' },
  { label: '远程', value: 'mqtt' }
]

export const voiceSamples = ['下一页', '上一页', '放大', '缩小', '锁定', '解锁']

export const commandTextMap: Record<string, string> = {
  下一页: 'next_page',
  上一页: 'prev_page',
  放大: 'zoom_in',
  缩小: 'zoom_out',
  锁定: 'lock',
  解锁: 'unlock'
}

export const commandLabelMap: Record<string, string> = {
  prev_page: '上一页',
  next_page: '下一页',
  zoom_in: '放大',
  zoom_out: '缩小',
  scroll_up: '上滚',
  scroll_down: '下滚',
  lock: '锁定',
  unlock: '解锁',
  laser_on: '开启激光笔',
  laser_off: '关闭激光笔',
  set_mode: '切换模式',
  set_backlight: '设置背光',
  set_backlight_auto: '自动背光',
  reboot: '重启设备',
  ping: '心跳检测'
}

export const deviceIcons = {
  terminal: '◈',
  battery: '▰',
  signal: '≋',
  mode: '◎',
  pc: '▣',
  ota: '⇪',
  wifi: '⌁',
  scan: '⌖',
  bind: '◇',
  broker: '⌬',
  queue: '☰',
  voice: '◉'
}
