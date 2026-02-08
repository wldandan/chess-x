import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../styles/layout.css'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: '首页', icon: '🏠' },
    { path: '/demo', label: '对弈', icon: '♟️' },
    { path: '/training', label: '训练', icon: '🎯' },
    { path: '/analysis', label: '分析', icon: '📊' },
    { path: '/settings', label: '设置', icon: '⚙️' },
  ]

  // 如果是首页或demo页面，不显示Layout的导航栏和页脚（因为这些页面有自己的导航）
  const isHomePage = location.pathname === '/' || location.pathname === '/demo'

  return (
    <div className="layout">
      {!isHomePage && (
        <>
          <header className="header">
            <div className="header-content">
              <h1 className="logo">Aaron Chess</h1>
              <p className="subtitle">国际象棋比赛训练应用</p>
            </div>
          </header>

          <nav className="navbar">
            <ul className="nav-list">
              {navItems.map((item) => (
                <li key={item.path} className="nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}

      <main className={`main-content ${isHomePage ? 'home-page' : ''}`}>
        {children}
      </main>

      {!isHomePage && (
        <footer className="footer">
          <div className="footer-content">
            <p>© 2025 Aaron Chess - 专为13-16岁青少年设计</p>
            <p className="footer-links">
              <a href="/privacy">隐私政策</a> |
              <a href="/terms">使用条款</a> |
              <a href="/contact">联系我们</a>
            </p>
          </div>
        </footer>
      )}
    </div>
  )
}

export default Layout