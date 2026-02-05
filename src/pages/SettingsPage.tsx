import React, { useState } from 'react'
import '../styles/pages.css'

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    theme: 'classic',
    pieceStyle: 'standard',
    showCoordinates: true,
    highlightLastMove: true,
    showLegalMoves: true,
    enableAnimation: true,
    soundEffects: true,
    timeControl: '10+5',
    enablePremove: true,
    confirmMoves: false,
    language: 'zh-CN',
    notifications: true,
    autoSave: true
  })

  const themes = [
    { id: 'classic', name: '经典绿', preview: '🟩🟫' },
    { id: 'wood', name: '木质棕', preview: '🟫🟨' },
    { id: 'marble', name: '大理石', preview: '⬜⬛' },
    { id: 'dark', name: '深色模式', preview: '⬛⬜' }
  ]

  const pieceStyles = [
    { id: 'standard', name: '标准', description: '传统国际象棋棋子' },
    { id: 'alpha', name: 'Alpha', description: '简洁字母棋子' },
    { id: 'merida', name: 'Merida', description: '艺术风格棋子' },
    { id: 'lego', name: '乐高风格', description: '趣味乐高棋子' }
  ]

  const timeControls = [
    { id: '1+0', name: '闪电战 1+0' },
    { id: '3+2', name: '快棋 3+2' },
    { id: '5+3', name: '快棋 5+3' },
    { id: '10+5', name: '标准 10+5' },
    { id: '15+10', name: '标准 15+10' },
    { id: '30+0', name: '慢棋 30+0' }
  ]

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleResetSettings = () => {
    if (window.confirm('确定要重置所有设置为默认值吗？')) {
      setSettings({
        theme: 'classic',
        pieceStyle: 'standard',
        showCoordinates: true,
        highlightLastMove: true,
        showLegalMoves: true,
        enableAnimation: true,
        soundEffects: true,
        timeControl: '10+5',
        enablePremove: true,
        confirmMoves: false,
        language: 'zh-CN',
        notifications: true,
        autoSave: true
      })
    }
  }

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = 'aaron-chess-settings.json'

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h2 className="page-title">设置</h2>
        <p className="page-subtitle">
          自定义你的国际象棋训练体验
        </p>
      </div>

      <div className="settings-sections">
        <div className="settings-section">
          <h3 className="section-title">界面设置</h3>

          <div className="setting-group">
            <h4 className="setting-label">棋盘主题</h4>
            <div className="theme-grid">
              {themes.map(theme => (
                <div
                  key={theme.id}
                  className={`theme-option ${settings.theme === theme.id ? 'selected' : ''}`}
                  onClick={() => handleSettingChange('theme', theme.id)}
                >
                  <div className="theme-preview">{theme.preview}</div>
                  <div className="theme-name">{theme.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="setting-group">
            <h4 className="setting-label">棋子样式</h4>
            <div className="piece-style-grid">
              {pieceStyles.map(style => (
                <div
                  key={style.id}
                  className={`piece-style-option ${settings.pieceStyle === style.id ? 'selected' : ''}`}
                  onClick={() => handleSettingChange('pieceStyle', style.id)}
                >
                  <div className="piece-style-name">{style.name}</div>
                  <div className="piece-style-description">{style.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="setting-group">
            <h4 className="setting-label">显示选项</h4>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.showCoordinates}
                  onChange={(e) => handleSettingChange('showCoordinates', e.target.checked)}
                />
                <span>显示坐标</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.highlightLastMove}
                  onChange={(e) => handleSettingChange('highlightLastMove', e.target.checked)}
                />
                <span>高亮上一步</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.showLegalMoves}
                  onChange={(e) => handleSettingChange('showLegalMoves', e.target.checked)}
                />
                <span>显示合法走法</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.enableAnimation}
                  onChange={(e) => handleSettingChange('enableAnimation', e.target.checked)}
                />
                <span>走子动画</span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="section-title">比赛设置</h3>

          <div className="setting-group">
            <h4 className="setting-label">默认时间控制</h4>
            <div className="select-group">
              <select
                value={settings.timeControl}
                onChange={(e) => handleSettingChange('timeControl', e.target.value)}
                className="setting-select"
              >
                {timeControls.map(control => (
                  <option key={control.id} value={control.id}>
                    {control.name}
                  </option>
                ))}
              </select>
              <div className="select-description">
                选择默认的对局时间控制方式
              </div>
            </div>
          </div>

          <div className="setting-group">
            <h4 className="setting-label">对局选项</h4>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.enablePremove}
                  onChange={(e) => handleSettingChange('enablePremove', e.target.checked)}
                />
                <span>启用预走子</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.confirmMoves}
                  onChange={(e) => handleSettingChange('confirmMoves', e.target.checked)}
                />
                <span>确认走子</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.soundEffects}
                  onChange={(e) => handleSettingChange('soundEffects', e.target.checked)}
                />
                <span>声音效果</span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="section-title">系统设置</h3>

          <div className="setting-group">
            <h4 className="setting-label">语言</h4>
            <div className="select-group">
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="setting-select"
              >
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
                <option value="ja-JP">日本語</option>
                <option value="ko-KR">한국어</option>
              </select>
            </div>
          </div>

          <div className="setting-group">
            <h4 className="setting-label">通知和保存</h4>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                />
                <span>训练提醒通知</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                />
                <span>自动保存对局</span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="section-title">账户和数据</h3>

          <div className="setting-group">
            <h4 className="setting-label">数据管理</h4>
            <div className="button-group">
              <button className="btn btn-outline" onClick={handleExportSettings}>
                导出设置
              </button>
              <button className="btn btn-outline">
                导出对局历史
              </button>
              <button className="btn btn-outline">
                清除缓存
              </button>
            </div>
          </div>

          <div className="setting-group">
            <h4 className="setting-label">重置设置</h4>
            <div className="reset-section">
              <p className="reset-description">
                将所有设置恢复为默认值，这不会删除你的对局历史和个人数据。
              </p>
              <button className="btn btn-danger" onClick={handleResetSettings}>
                重置所有设置
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="section-title">关于</h3>

          <div className="about-section">
            <div className="about-content">
              <h4 className="about-title">Aaron Chess v1.0.0</h4>
              <p className="about-description">
                专为13-16岁青少年设计的国际象棋比赛准备Web应用
              </p>
              <div className="about-info">
                <div className="info-item">
                  <span className="info-label">版本：</span>
                  <span className="info-value">1.0.0</span>
                </div>
                <div className="info-item">
                  <span className="info-label">构建日期：</span>
                  <span className="info-value">2025-03-15</span>
                </div>
                <div className="info-item">
                  <span className="info-label">技术支持：</span>
                  <span className="info-value">support@aaronchess.com</span>
                </div>
              </div>
            </div>
            <div className="about-actions">
              <button className="btn btn-outline">检查更新</button>
              <button className="btn btn-outline">用户手册</button>
              <button className="btn btn-outline">隐私政策</button>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn btn-primary">保存设置</button>
        <button className="btn btn-outline" onClick={() => window.history.back()}>
          取消
        </button>
      </div>
    </div>
  )
}

export default SettingsPage