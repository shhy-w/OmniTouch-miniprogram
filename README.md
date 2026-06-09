# 多模态智能交互终端小程序

这是面向多模态智能交互终端的微信小程序前端工程。小程序用于设备配网、设备管理、远程文档控制和状态监控，服务于商务演示、教学培训、会议展示等场景。

当前项目基于 Mpx 初始化工程改造，默认使用本地模拟数据和模拟 MQTT 传输，便于在后端、Broker、ASR、OTA 服务尚未接入时完成页面和交互验证。

## 功能清单

- 设备列表：展示在线/离线设备、搜索设备、查看电量/信号/模式/同步状态。
- 远程主控：支持翻页、缩放、滚动、激光笔、锁定/解锁、模式切换。
- 设备详情：展示 MAC、IP、固件、电池、信号、连接电脑，支持重命名、删除、OTA 检查 UI。
- 设备配网：支持扫码入口、手动输入设备 ID、WiFi 表单、配网进度和绑定模拟。
- 设置页面：维护 MQTT Broker 配置、本地调试开关、离线队列状态和缓存清理。
- 交互反馈：命令发送后展示发送中、已执行、已缓存或失败状态；离线普通命令会进入补发队列。

## 页面结构

```text
src/pages/
├── index.mpx            # 启动后跳转到设备列表
├── device-list.mpx      # 我的设备
├── remote-control.mpx   # 核心遥控页
├── device-detail.mpx    # 设备详情
├── provisioning.mpx     # 配网绑定
└── settings.mpx         # 设置
```

## 目录说明

```text
src/
├── components/          # 设备卡片、控制按钮、状态标签、空状态
├── constants/           # 命令、文案、图标常量
├── services/            # 设备存储、MQTT 封装、配网模拟
├── stores/              # 设备状态、事件、离线队列、最近命令
├── types/               # 设备、状态、命令类型
├── pages/               # 小程序页面
└── app.mpx              # 应用入口和页面栈
```

## MQTT 协议摘要

设备 ID 格式：`esp32-` + MAC 地址后 6 位，例如 `esp32-cb8824`。

| 方向 | Topic | 说明 |
| --- | --- | --- |
| 小程序到设备 | `term/{device_id}/cmd` | 下发控制命令 |
| 设备到小程序 | `term/{device_id}/status` | 设备状态上报 |
| 设备到小程序 | `term/{device_id}/event` | 命令结果、语音、手势、错误事件 |
| 小程序到设备 | `term/{device_id}/voice` | 预留语音识别文本发送 |

命令 payload：

```json
{
  "cmd": "next_page",
  "msg_id": "cmd-1717849320",
  "params": {}
}
```

已封装命令包括：`zoom_in`、`zoom_out`、`next_page`、`prev_page`、`scroll_up`、`scroll_down`、`lock`、`unlock`、`set_mode`、`set_backlight`、`set_backlight_auto`、`ping`、`reboot`。

## 模拟与真实接入

- 默认设备数据来自 `src/services/device.ts`，并写入微信本地缓存。
- 默认 MQTT 服务在 `src/services/mqtt.ts` 中模拟连接、状态刷新和命令完成事件。
- 接入真实 Broker 时，保留页面和 store，只替换 `mqttService` 内部连接、订阅、发布实现。
- ASR、OTA、账号体系当前只保留小程序侧入口和接口边界，不包含真实后端能力。

## 开发与构建

```bash
pnpm install
pnpm run serve       # 微信小程序开发构建
pnpm run build       # 微信小程序生产构建
pnpm run lint        # 代码检查
pnpm run test        # 单元测试
```

跨平台构建命令仍保留：

```bash
pnpm run serve:ali
pnpm run serve:web
pnpm run build:ali
pnpm run build:web
```

## 验证建议

提交前至少运行：

```bash
pnpm run lint
pnpm run build
pnpm run test
```

手动检查：

- 设备列表在线、离线、低电量、空列表状态显示清晰。
- 主控页翻页、缩放、滚动、锁定、激光笔、模式切换都有即时反馈。
- 离线设备的普通命令进入离线队列，高风险命令提示需要在线执行。
- 配网页面对扫码失败、WiFi 未填、绑定成功和失败都有明确提示。

## 提交规范

提交信息使用中文，并带以下前缀之一：

- `feat`：新增功能
- `fix`：修复问题
- `remove`：移除代码或能力
- `style`：样式调整
- `refactor`：重构
- `chore`：工程维护

示例：

```text
feat: 完成设备主控页交互升级
style: 优化科技感渐变主题
```
