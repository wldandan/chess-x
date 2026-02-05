# 特性8：比赛时间控制模拟

## 概述
模拟真实比赛时间压力和计时环境，训练青少年在时间压力下保持决策质量，提高比赛心理素质。

## 核心功能

### 8.1 标准时间控制系统
- **快棋时间控制**：3+2, 5+3, 10+5
- **常规时间控制**：15+10, 25+10, 30+30
- **慢棋时间控制**：90+30, 120+30
- **自定义时间**：任意分钟+秒数组合

### 8.2 时间压力训练模式
- **固定时间训练**：整个对局固定时间
- **阶段时间训练**：开局/中局/残局不同时间分配
- **增量时间训练**：每步加秒训练
- **突发时间训练**：突然减少可用时间

### 8.3 时间管理分析
- **用时分布分析**：各阶段用时比例
- **决策效率分析**：时间vs决策质量关系
- **压力反应分析**：时间压力下决策变化
- **优化建议**：个性化时间管理建议

## 技术实现

### 计时器系统架构
```javascript
class CompetitionTimer {
  constructor(timeControl, playerNames) {
    this.timeControl = this.parseTimeControl(timeControl);
    this.players = {
      white: {
        name: playerNames.white,
        time: this.timeControl.baseTime,
        increment: this.timeControl.increment,
        moves: 0,
        timeHistory: []
      },
      black: {
        name: playerNames.black,
        time: this.timeControl.baseTime,
        increment: this.timeControl.increment,
        moves: 0,
        timeHistory: []
      }
    };
    this.activePlayer = 'white';
    this.gamePhase = 'opening';
    this.startTime = null;
    this.isRunning = false;
    this.timeoutThreshold = 1000; // 超时阈值(ms)
  }

  parseTimeControl(timeControl) {
    // 解析如 "10+5" 的时间控制
    const [minutes, seconds] = timeControl.split('+').map(Number);
    return {
      baseTime: minutes * 60 * 1000, // 转换为毫秒
      increment: seconds * 1000,
      type: seconds > 0 ? 'increment' : 'suddenDeath'
    };
  }

  start() {
    this.startTime = Date.now();
    this.isRunning = true;
    this.timerInterval = setInterval(() => this.update(), 100);
  }

  update() {
    if (!this.isRunning) return;

    const currentTime = Date.now();
    const elapsed = currentTime - this.startTime;
    this.players[this.activePlayer].time -= elapsed;

    // 记录时间历史用于分析
    this.players[this.activePlayer].timeHistory.push({
      time: currentTime,
      remaining: this.players[this.activePlayer].time,
      moveNumber: this.players[this.activePlayer].moves,
      phase: this.gamePhase
    });

    this.startTime = currentTime;

    // 检查超时
    if (this.players[this.activePlayer].time <= 0) {
      this.handleTimeout();
    }

    // 更新游戏阶段（基于步数）
    this.updateGamePhase();
  }

  onMove() {
    // 走子完成，换色加秒
    const player = this.players[this.activePlayer];
    player.moves += 1;
    player.time += player.increment;

    // 切换活动玩家
    this.activePlayer = this.activePlayer === 'white' ? 'black' : 'white';
    this.startTime = Date.now();
  }

  updateGamePhase() {
    const totalMoves = this.players.white.moves + this.players.black.moves;
    if (totalMoves < 20) {
      this.gamePhase = 'opening';
    } else if (totalMoves < 40) {
      this.gamePhase = 'middlegame';
    } else {
      this.gamePhase = 'endgame';
    }
  }

  handleTimeout() {
    this.isRunning = false;
    clearInterval(this.timerInterval);
    // 触发超时事件
    this.onTimeout(this.activePlayer);
  }
}
```

### 时间压力算法
```javascript
class TimePressureSimulator {
  constructor(difficulty) {
    this.difficulty = difficulty; // 1-5, 越高压力越大
    this.pressureLevels = {
      1: { timeReduction: 0.1, distraction: 0.1, urgency: 0.1 },
      2: { timeReduction: 0.2, distraction: 0.2, urgency: 0.3 },
      3: { timeReduction: 0.3, distraction: 0.3, urgency: 0.5 },
      4: { timeReduction: 0.4, distraction: 0.4, urgency: 0.7 },
      5: { timeReduction: 0.5, distraction: 0.5, urgency: 0.9 }
    };
    this.currentPressure = this.pressureLevels[difficulty];
  }

  applyTimePressure(baseTime, phase, timeLeft) {
    let adjustedTime = baseTime;

    // 基于剩余时间增加压力
    const timeRatio = timeLeft / baseTime;
    if (timeRatio < 0.3) {
      // 最后30%时间增加压力
      const pressureMultiplier = 1 + (0.3 - timeRatio) * 2;
      adjustedTime *= pressureMultiplier;
    }

    // 基于游戏阶段调整
    if (phase === 'endgame' && timeRatio < 0.5) {
      // 残局时间压力加倍
      adjustedTime *= 0.7;
    }

    // 应用难度系数
    adjustedTime *= (1 - this.currentPressure.timeReduction);

    return Math.max(adjustedTime, 1000); // 至少1秒
  }

  generateDistraction(timeLeft) {
    // 在时间压力下生成干扰
    if (timeLeft < 30000 && Math.random() < this.currentPressure.distraction) { // 最后30秒
      return {
        type: ['visual', 'auditory', 'cognitive'][Math.floor(Math.random() * 3)],
        intensity: Math.random() * this.currentPressure.urgency,
        duration: 1000 + Math.random() * 2000 // 1-3秒
      };
    }
    return null;
  }

  calculateUrgency(timeLeft, phase) {
    // 计算紧迫感系数 (0-1)
    let urgency = 0;

    // 基于剩余时间
    if (timeLeft < 60000) urgency += 0.4; // 最后1分钟
    if (timeLeft < 30000) urgency += 0.3; // 最后30秒
    if (timeLeft < 10000) urgency += 0.3; // 最后10秒

    // 基于游戏阶段
    if (phase === 'endgame') urgency += 0.2;

    // 应用难度系数
    urgency *= this.currentPressure.urgency;

    return Math.min(urgency, 1.0);
  }
}
```

## 用户界面

### 比赛计时界面
```
┌─────────────────────────────────────────────────┐
│ 黑方：AI-卡尔森 (ELO 2400)                      │
│ 剩余时间：⏱️ 04:32.5                            │
│ 步数：18 | 加秒：+5s | 阶段：中局               │
├─────────────────────────────────────────────────┤
│                                                 │
│                [局面棋盘]                       │
│                                                 │
├─────────────────────────────────────────────────┤
│ 白方：张小明 (ELO 1650)                         │
│ 剩余时间：⏱️ 05:45.2  ⚠️ 时间压力：中等         │
│ 步数：18 | 加秒：+5s | 阶段：中局               │
└─────────────────────────────────────────────────┘

时间压力提示：最后5分钟，建议加快节奏保持质量
当前决策时间：已思考 1分23秒
推荐最大思考：2分钟
```

### 时间管理面板
```
时间管理分析
├── 用时分布
│   ├── 开局 (1-20步)：8分32秒 (35%)
│   ├── 中局 (21-40步)：12分18秒 (50%)
│   └── 残局 (41步+)：3分10秒 (15%)
├── 决策效率
│   ├── 平均每步：32秒
│   ├── 质量评分：7.2/10
│   └── 压力反应：良好 (压力下质量下降15%)
└── 优化建议
    ├── ⭐ 开局用时减少20%
    ├── ⭐ 中局保持当前节奏
    ├── ⭐ 残局预留更多时间
    └── ⭐ 最后5分钟加速训练

[详细报告] [训练建议] [重新配置]
```

### 压力训练设置
```
压力训练模式设置
├── 基础时间控制
│   ├── 快棋：5+3 (推荐开始)
│   ├── 常规：15+10 (比赛标准)
│   └── 慢棋：90+30 (深度训练)
├── 压力级别
│   ├── 轻松 (Level 1)：无额外压力
│   ├── 中等 (Level 3)：适度时间减少
│   ├── 困难 (Level 5)：强烈时间压力
│   └── 动态：根据表现自动调整
├── 干扰设置
│   ├── 视觉干扰：闪烁计时器
│   ├── 声音干扰：倒计时提示音
│   ├── 认知干扰：额外计算任务
│   └── 无干扰：纯净比赛环境
└── 训练目标
    ├── 决策速度：保持质量下提速
    ├── 压力适应：提高抗压能力
    ├── 时间分配：优化阶段用时
    └── 心理稳定：减少时间恐慌
```

## 训练模式

### 1. 标准时间训练
- **目标**：适应标准比赛时间控制
- **模式**：完整对局标准计时
- **反馈**：时间分配合理性分析
- **难度**：从快棋到慢棋渐进

### 2. 时间压力专项训练
- **目标**：提高时间压力下决策能力
- **模式**：故意设置时间不足场景
- **反馈**：压力下决策质量评估
- **难度**：压力级别可调

### 3. 阶段时间优化训练
- **目标**：优化各阶段时间分配
- **模式**：针对性阶段时间限制
- **反馈**：阶段用时效率分析
- **难度**：阶段时间比例调整

### 4. 突发压力应对训练
- **目标**：应对突发时间减少
- **模式**：对局中突然减少时间
- **反馈**：应急反应能力评估
- **难度**：时间减少幅度可调

## 时间管理策略

### 开局时间策略
- **理论位置**：记忆开局减少思考时间
- **计划制定**：快速形成整体计划
- **风险控制**：避免开局复杂变化
- **时间预算**：预留总时间20-25%

### 中局时间策略
- **决策优先级**：关键决策多花时间
- **计算深度**：复杂局面深度计算
- **简化选择**：减少不必要分支计算
- **时间预算**：预留总时间50-60%

### 残局时间策略
- **精确计算**：残局要求精确性
- **技术应用**：快速应用残局知识
- **时间预留**：确保足够残局时间
- **时间预算**：预留总时间20-25%

### 最后阶段策略
- **加速决策**：最后阶段提高节奏
- **质量保持**：加速不降质训练
- **恐慌控制**：避免时间恐慌错误
- **应急计划**：时间不足简化策略

## 心理训练模块

### 1. 时间恐慌识别训练
- **症状识别**：识别时间恐慌早期信号
- **心理干预**：恐慌时心理调节技巧
- **行为模式**：恐慌时典型错误模式
- **预防训练**：避免恐慌的预规划

### 2. 压力适应训练
- **渐进暴露**：逐渐增加时间压力
- **心理韧性**：压力下保持冷静训练
- **注意力控制**：压力下注意力集中
- **自信建立**：时间压力下成功体验

### 3. 节奏控制训练
- **内在节奏**：建立个人最佳决策节奏
- **变速能力**：根据局面调整思考速度
- **节奏恢复**：被打乱后恢复节奏
- **时间感知**：准确感知时间流逝

## 数据分析系统

### 时间使用效率指标
```javascript
const timeEfficiencyMetrics = {
  // 基本指标
  moveTimeAverage: 0,      // 平均每步用时
  moveTimeStdDev: 0,       // 用时标准差
  phaseTimeDistribution: { // 阶段用时分布
    opening: 0,
    middlegame: 0,
    endgame: 0
  },

  // 质量指标
  timeQualityCorrelation: 0, // 时间与决策质量相关性
  pressurePerformance: 0,    // 压力下表现
  criticalMoveTime: 0,      // 关键决策用时

  // 效率指标
  timeEfficiency: 0,        // 时间使用效率 (0-1)
  wasteTime: 0,             // 浪费的时间
  optimalTime: 0,           // 理论最优用时

  // 心理指标
  panicThreshold: 0,        // 恐慌时间阈值
  recoveryAbility: 0,       // 时间恢复能力
  consistency: 0            // 用时一致性
};
```

### 个性化时间分析报告
```
时间管理分析报告：张小明
分析周期：2025年2月 (20局对局)

优势：
- 残局时间控制优秀 (效率评分: 8.2/10)
- 压力下决策稳定性好 (下降仅12%)
- 时间感知准确 (误差<10%)

待改进：
- 开局用时过多 (平均超时35%)
- 中局复杂局面决策慢 (超时42%)
- 最后5分钟加速不足 (质量下降25%)

个性化建议：
1. 开局训练：记忆主要变化，减少计算时间
2. 中局训练：提高复杂局面处理速度
3. 压力训练：加强最后阶段加速训练
4. 心理训练：建立开局时间预算意识

推荐训练计划：
- 每周3次开局时间专项训练 (30分钟)
- 每周2次时间压力模拟训练 (45分钟)
- 每日5分钟快速决策练习
```

## 技术挑战

### 挑战1：时间压力模拟真实性
- **解决方案**：基于比赛数据分析的真实压力模式
- **验证方法**：与实际比赛时间压力体验对比

### 挑战2：个性化推荐准确性
- **解决方案**：机器学习用户时间使用模式
- **目标**：时间优化建议有效性 > 70%

### 挑战3：心理训练科学性
- **解决方案**：基于运动心理学的时间管理训练方法
- **验证方法**：训练效果前后对比测试

## 测试计划

### 时间准确性测试
- 计时器精度测试 (误差 < 100ms)
- 时间控制规则测试
- 压力模拟一致性测试

### 训练效果测试
- 时间管理能力前后对比
- 压力下决策质量测试
- 比赛时间使用效率测试

### 系统功能测试
- 多种时间控制模式测试
- 个性化分析准确性测试
- 训练模式完整性测试

## 成功标准
- 时间使用效率提升 > 25%
- 压力下决策质量下降 < 15%
- 时间恐慌发生率减少 > 40%
- 比赛时间管理满意度 > 4.0/5分