---
name: user-prefs
description: 用户偏好及使用习惯
metadata: 
  node_type: memory
  type: user
  originSessionId: 2b39f68c-51ee-42c3-a7f8-d12aaaf93e34
---

# 用户偏好

## 基本信息
- GitHub 账号: luoyu5274-oss
- 操作系统: Windows 11 中文版
- 学习目标: SQL 数据分析方向
- 网络: 国内，访问 GitHub 需 VPN

## UI 偏好
- 最终采用：**暖白底色**（奶油白+琥珀金），浅色主题
- 拒绝过：深蓝黑冷色调 → 暖棕深色调 → 最终暖白
- 字体: JetBrains Mono（代码） + DM Sans（UI）

## 功能偏好
- 不需要用户系统，本地练习即可
- 表结构展示要能折叠/展开，展开后能看到类型、约束、样例数据
- 侧边栏可折叠以节省屏幕空间
- 手机也能访问（驱动了部署至 Render）

## 关键反馈
- 对"测试遗漏"敏感：部署时只测了 API 没模拟真实用户冷启动场景
- 对"过度设计"敏感：指出 Netlify+Render 双平台是多余的，单 Render 更简洁
