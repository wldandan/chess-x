import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import '../styles/theme.css'

const NewHomePage: React.FC = () => {
  // 初始化Intersection Observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement
          target.style.opacity = '1'
          target.style.transform = 'translateY(0)'
        }
      })
    }, observerOptions)

    // 观察所有动画元素
    document.querySelectorAll('.animate-fade-in, .animate-slide-up').forEach(el => {
      observer.observe(el)
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div className="page-wrapper">
      {/* 顶部导航栏 - 功能性菜单 */}
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/" className="logo">
            <span className="logo-icon">♞</span>
            <span>Aaron Chess</span>
          </Link>
          <div className="nav-links">
            <Link to="/demo" className="nav-link">对弈</Link>
            <Link to="/training" className="nav-link">训练</Link>
            <Link to="/analysis" className="nav-link">分析</Link>
            <Link to="/training-setup" className="nav-link">设置</Link>
          </div>
        </div>
        <div className="nav-right">
          <button className="nav-btn nav-btn-secondary">登录</button>
          <button className="nav-btn">注册</button>
        </div>
      </nav>

      {/* 主内容区 */}
      <div className="main-layout">
        {/* Hero 区域 */}
        <section className="hero-section animate-fade-in">
          <div className="hero-content">
            <span className="hero-badge">🎯 专为13-16岁青少年设计</span>
            <h1 className="hero-title">
              像大师一样<br />
              <span className="highlight">思考每一步棋</span>
            </h1>
            <p className="hero-subtitle">
              结合AI智能分析和游戏化学习，让你的国际象棋水平快速提升。已经有超过10,000名青少年棋手在这里开始他们的象棋之旅。
            </p>
            <div className="hero-buttons">
              <Link to="/demo" className="btn-hero">
                免费开始学习
              </Link>
              <Link to="/training" className="btn-hero btn-hero-secondary">
                了解更多
              </Link>
            </div>
          </div>
          <div className="hero-board">
            {/* Chess.com 官方动图 */}
            <img
              src="https://assets-configurator.chess.com/image/configurator/chessboard_1768166350728.gif"
              alt="Chess.com Animated Board"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </section>

        {/* 快速开始 */}
        <section className="quick-start-section animate-slide-up">
          <div className="section-header">
            <h2 className="section-title">立即开始</h2>
            <p className="section-subtitle">选择你想要的学习方式，马上开始提升棋艺</p>
          </div>
          <div className="quick-start-grid">
            <Link to="/demo" className="quick-start-card">
              <div className="quick-start-icon">🤖</div>
              <h3>对战 AI</h3>
              <p>不同难度级别的AI对手，随时对局练习</p>
            </Link>
            <Link to="/training" className="quick-start-card">
              <div className="quick-start-icon">🎯</div>
              <h3>战术训练</h3>
              <p>每日战术挑战，提升计算和识别能力</p>
            </Link>
            <Link to="/analysis" className="quick-start-card">
              <div className="quick-start-icon">📖</div>
              <h3>棋局分析</h3>
              <p>深度分析对局，发现改进空间</p>
            </Link>
          </div>
        </section>

        {/* 数据统计 */}
        <section className="stats-section animate-slide-up">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">10K+</div>
              <div className="stat-label">注册学习者</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">50K+</div>
              <div className="stat-label">完成训练</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">98%</div>
              <div className="stat-label">满意率</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">4.8★</div>
              <div className="stat-label">用户评分</div>
            </div>
          </div>
        </section>

        {/* 用户评价 */}
        <section className="testimonials-section animate-slide-up">
          <div className="section-header">
            <h2 className="section-title">学员评价</h2>
            <p className="section-subtitle">看看其他学员怎么说</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">👦</div>
                <div>
                  <div className="testimonial-name">小明</div>
                  <div className="testimonial-title">14岁，学习3个月</div>
                </div>
              </div>
              <p className="testimonial-text">"这个平台真的很有趣！AI分析帮我发现了很多自己没注意到的错误，战术训练让我的计算能力提升了很多。"</p>
              <div className="testimonial-rating">★★★★★</div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">👧</div>
                <div>
                  <div className="testimonial-name">小红</div>
                  <div className="testimonial-title">15岁，学习6个月</div>
                </div>
              </div>
              <p className="testimonial-text">"游戏化的学习方式让学棋变得不再枯燥。徽章和成就系统很有激励性，让我每天都想继续学习！"</p>
              <div className="testimonial-rating">★★★★★</div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">👦</div>
                <div>
                  <div className="testimonial-name">小刚</div>
                  <div className="testimonial-title">16岁，学习1年</div>
                </div>
              </div>
              <p className="testimonial-text">"从完全不会到能和同学对弈，Aaron Chess的循序渐进式教学非常适合初学者。推荐给所有想学国际象棋的朋友！"</p>
              <div className="testimonial-rating">★★★★★</div>
            </div>
          </div>
        </section>

        {/* CTA 区域 */}
        <section className="cta-section animate-slide-up">
          <div className="cta-content">
            <h2 className="cta-title">准备好开始你的象棋之旅了吗？</h2>
            <p className="cta-text">加入超过10,000名青少年棋手，一起在Aaron Chess提升棋艺，享受国际象棋的乐趣</p>
            <div className="cta-buttons">
              <Link to="/demo" className="btn-cta">
                注册
              </Link>
              <Link to="/training" className="btn-cta btn-cta-secondary">
                了解更多
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* 底部 */}
      <footer className="footer">
        <div className="footer-links">
          <Link to="/demo">对弈练习</Link>
          <Link to="/training">战术训练</Link>
          <Link to="/analysis">棋局分析</Link>
          <Link to="/training-setup">训练设置</Link>
          <Link to="#">帮助中心</Link>
          <Link to="#">隐私政策</Link>
        </div>
        <p className="footer-copyright">© 2025 Aaron Chess - 专为13-16岁青少年设计</p>
      </footer>
    </div>
  )
}

export default NewHomePage