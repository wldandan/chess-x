# 特性5：专业比赛界面

## 概述
提供类似Chess.com的专业级国际象棋界面，符合国际比赛标准，培养青少年专业比赛习惯和体验。

## 核心功能

### 5.1 专业棋盘系统
- **标准棋盘**：8x8国际标准棋盘
- **视觉优化**：高清矢量棋子，多种棋盘主题
- **交互反馈**：合法走法高亮，走法动画
- **坐标系统**：代数记谱法坐标显示

### 5.2 比赛控制面板
- **计时器系统**：比赛标准计时（5+3, 10+5等）
- **走法记录**：PGN标准记谱，可编辑注释
- **局面分析**：实时评估条，引擎深度
- **控制按钮**：悔棋、提和、认输、复盘

### 5.3 多视图布局
- **比赛视图**：主棋盘+计时器+走法列表
- **分析视图**：双棋盘对比分析
- **训练视图**：棋盘+训练提示+反馈
- **观战视图**：大棋盘+解说+分析

## 技术实现

### 棋盘组件架构
```javascript
// 棋盘核心组件
const ChessBoard = {
  // 渲染层
  renderer: {
    type: 'svg', // SVG矢量渲染
    theme: 'classic', // 经典、木质、大理石等
    pieceSet: 'standard', // 标准、alpha、merida等
    coordinates: true, // 显示坐标
    orientation: 'white' // 棋盘方向
  },

  // 交互层
  interaction: {
    draggable: true, // 拖放走子
    premove: true, // 预走子
    animation: {
      duration: 300, // 动画时长
      enabled: true // 启用动画
    },
    highlight: {
      lastMove: true, // 高亮上一步
      check: true, // 高亮将军
      legalMoves: true // 高亮合法走法
    }
  },

  // 状态管理
  state: {
    fen: 'startpos', // 当前局面FEN
    pgn: '', // 对局PGN
    turn: 'w', // 轮到谁走
    moveNumber: 1, // 当前步数
    history: [] // 走法历史
  }
};
```

### 计时器系统
```javascript
class ChessClock {
  constructor(timeControl) {
    this.timeControl = timeControl; // 如 '5+3'
    this.whiteTime = this.parseTime(timeControl);
    this.blackTime = this.parseTime(timeControl);
    this.increment = this.parseIncrement(timeControl);
    this.activeColor = 'white';
    this.isRunning = false;
  }

  parseTime(timeControl) {
    // 解析时间控制如 '5+3' -> 5分钟
    const [minutes] = timeControl.split('+');
    return parseInt(minutes) * 60 * 1000; // 转换为毫秒
  }

  start() {
    this.isRunning = true;
    this.startTime = Date.now();
    this.timer = setInterval(() => this.tick(), 100);
  }

  tick() {
    if (!this.isRunning) return;

    const elapsed = Date.now() - this.startTime;
    if (this.activeColor === 'white') {
      this.whiteTime -= elapsed;
    } else {
      this.blackTime -= elapsed;
    }

    this.startTime = Date.now();

    // 检查超时
    if (this.whiteTime <= 0 || this.blackTime <= 0) {
      this.gameOver('timeout');
    }
  }

  switchTurn() {
    // 换色时加秒
    if (this.activeColor === 'white') {
      this.whiteTime += this.increment * 1000;
      this.activeColor = 'black';
    } else {
      this.blackTime += this.increment * 1000;
      this.activeColor = 'white';
    }
    this.startTime = Date.now();
  }
}
```

## 用户界面设计

### 主比赛界面布局
```
┌─────────────────────────────────────────────────────────┐
│ 黑方：AI-卡尔森 (ELO 2400)        ⏱️ 04:32            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  8 ♜ ♞ ♝ ♛ ♚ ♝ ♞ ♜     [评估条] +1.2                  │
│  7 ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟                                     │
│  6 · · · · · · · ·                                     │
│  5 · · · · · · · ·                                     │
│  4 · · · ♙ · · · ·                                     │
│  3 · · · · · · · ·                                     │
│  2 ♙ ♙ ♙ · ♙ ♙ ♙ ♙                                     │
│  1 ♖ ♘ ♗ ♕ ♔ ♗ ♘ ♖                                     │
│    a b c d e f g h                                     │
│                                                         │
│ 白方：张小明 (ELO 1650)         ⏱️ 05:45            │
├─────────────────────────────────────────────────────────┤
│ 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7    │
│ 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Bb7 10. d4 Re8     │
│ 11. Nbd2 Bf8 12. a4 h6 13. Bc2 exd4 14. cxd4 Nb4       │
│ 15. Bb1 c5 16. d5 Nd7 17. Ra3 c4 18. axb5 axb5         │
│                                                         │
│ [悔棋] [提和] [认输] [分析] [设置]                     │
└─────────────────────────────────────────────────────────┘
```

### 分析界面布局
```
┌─────────────────────────┬─────────────────────────┐
│ 实际对局                │ 最佳变化分析            │
│                         │                         │
│  8 ♜ ♞ · ♛ ♚ ♝ ♞ ♜     │  8 ♜ ♞ · ♛ ♚ ♝ ♞ ♜     │
│  7 ♟ ♟ ♟ · ♟ ♟ ♟ ♟     │  7 ♟ ♟ ♟ · ♟ ♟ ♟ ♟     │
│  6 · · · · · · · ·     │  6 · · · · · · · ·     │
│  5 · · ♝ ♟ · · · ·     │  5 · · ♝ ♟ · · · ·     │
│  4 · · · ♙ · · · ·     │  4 · · · ♙ · · · ·     │
│  3 · · · · · · · ·     │  3 · · · · · · · ·     │
│  2 ♙ ♙ ♙ · ♙ ♙ ♙ ♙     │  2 ♙ ♙ ♙ · ♙ ♙ ♙ ♙     │
│  1 ♖ ♘ ♗ ♕ ♔ · ♘ ♖     │  1 ♖ ♘ ♗ ♕ ♔ · ♘ ♖     │
│    a b c d e f g h     │    a b c d e f g h     │
│                         │                         │
│ 第18步：axb5 (+0.2)    │ 推荐：Nf6! (+1.5)       │
│                         │ 威胁：Nh5攻击f4弱点     │
└─────────────────────────┴─────────────────────────┘
```

### 设置面板
```
界面设置
├── 棋盘主题
│   ├── █ 经典绿 (默认)
│   ├── □ 木质棕
│   ├── □ 大理石
│   └── □ 深色模式
├── 棋子样式
│   ├── █ 标准 (推荐)
│   ├── □ Alpha
│   ├── □ Merida
│   └── □ 乐高风格
├── 显示选项
│   ├── ✓ 显示坐标
│   ├── ✓ 高亮上一步
│   ├── ✓ 显示合法走法
│   ├── ✓ 走子动画
│   └── [ ] 3D棋盘效果
└── 比赛设置
    ├── 默认时间控制：10+5
    ├── 预走子：启用
    ├── 确认走子：禁用
    └── 声音效果：启用
```

## 专业功能

### 1. 标准记谱系统
- **PGN支持**：完整PGN导入/导出
- **代数记谱**：标准e4、Nf3等记法
- **注释系统**：走法注释、评估符号（!、?等）
- **变例记录**：分支变例记录和查看

### 2. 比赛计时器
- **时间控制**：5+3、10+5、15+10等标准
- **加秒机制**：费舍尔加秒精确计时
- **时间压力警告**：最后1分钟警示
- **超时判负**：自动检测和判决

### 3. 局面分析工具
- **评估条**：实时局面优劣可视化
- **引擎深度**：显示当前分析深度
- **走法列表**：引擎推荐走法列表
- **威胁检测**：显示当前威胁

### 4. 对局管理
- **保存/加载**：PGN/FEN格式支持
- **对局库**：按时间、对手、结果分类
- **搜索功能**：按局面、开局、结果搜索
- **分享功能**：生成分享链接或图片

## 视觉设计系统

### 颜色主题系统
```css
:root {
  /* 经典绿主题 */
  --chessboard-light: #f0d9b5;
  --chessboard-dark: #b58863;
  --piece-white: #ffffff;
  --piece-black: #000000;
  --highlight-move: rgba(255, 255, 0, 0.3);
  --highlight-check: rgba(255, 0, 0, 0.3);
  --highlight-legal: rgba(0, 255, 0, 0.2);
}

.theme-wood {
  --chessboard-light: #d8b387;
  --chessboard-dark: #a87850;
}

.theme-marble {
  --chessboard-light: #e8e8e8;
  --chessboard-dark: #a0a0a0;
}

.theme-dark {
  --chessboard-light: #666666;
  --chessboard-dark: #333333;
  --piece-white: #f0f0f0;
  --piece-black: #d0d0d0;
}
```

### 响应式布局
```javascript
const responsiveLayouts = {
  desktop: {
    boardSize: 600,
    panelWidth: 300,
    fontSize: 14,
    spacing: 16
  },
  tablet: {
    boardSize: 450,
    panelWidth: 250,
    fontSize: 13,
    spacing: 12
  },
  mobile: {
    boardSize: 320,
    panelWidth: 0, // 隐藏面板
    fontSize: 12,
    spacing: 8,
    layout: 'vertical' // 垂直布局
  }
};
```

## 交互体验优化

### 拖放走子系统
1. **点击反馈**：点击棋子高亮合法走法
2. **拖放动画**：平滑拖放和放置动画
3. **非法走法**：无效放置回弹动画
4. **预走子**：对手思考时可预先走子

### 触摸屏优化
- **触摸区域**：增大棋子触摸区域
- **手势支持**：双指缩放棋盘
- **长按菜单**：长按弹出走法选项
- **滑动滚轮**：走法列表滑动浏览

### 键盘快捷键
```javascript
const keyboardShortcuts = {
  'ArrowLeft': 'prevMove',    // 上一步
  'ArrowRight': 'nextMove',   // 下一步
  'Space': 'togglePlay',      // 播放/暂停
  'z': 'undoMove',           // 悔棋
  'r': 'resign',             // 认输
  'd': 'drawOffer',          // 提和
  'a': 'toggleAnalysis',     // 切换分析
  's': 'saveGame',           // 保存对局
};
```

## 专业比赛功能

### 1. 比赛规则执行
- **50步规则**：自动检测和宣布
- **三次重复**：局面重复检测
- **逼和识别**：无子可动判定
- **升变处理**：兵升变选择界面

### 2. 比赛数据记录
- **走法时间**：记录每步用时
- **局面评估**：记录每步评估值
- **决策质量**：记录与最佳走法差异
- **心理数据**：时间压力下的决策变化

### 3. 比赛报告生成
- **技术统计**：准确率、最佳走法率等
- **时间管理**：用时分布和效率
- **错误分析**：错误类型和分布
- **改进建议**：针对性训练建议

## 技术挑战

### 挑战1：性能优化
- **解决方案**：Canvas/SVG渲染优化，虚拟滚动
- **目标**：60fps流畅动画，内存使用<50MB

### 挑战2：跨平台兼容
- **解决方案**：响应式设计，触摸/鼠标双模式
- **目标**：桌面/平板/手机全设备兼容

### 挑战3：专业标准
- **解决方案**：遵循FIDE和PGN标准
- **验证方法**：与专业软件功能对比

## 测试计划

### 视觉测试
- 主题切换一致性测试
- 响应式布局适配测试
- 动画流畅度测试

### 功能测试
- 比赛规则准确性测试
- 计时器精度测试
- 交互操作完整性测试

### 性能测试
- 大规模对局加载测试
- 长时间运行稳定性测试
- 多标签页内存管理测试

## 成功标准
- 界面响应时间 < 100ms
- 专业功能完整度 > 95%
- 用户界面满意度 > 4.5/5分
- 跨设备兼容性 > 90%