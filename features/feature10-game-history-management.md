# 特性10：对局历史管理

## 概述
全面管理系统化存储、检索和分析所有对局历史，建立个人对局数据库，支持深度学习和比赛准备。

## 核心功能

### 10.1 对局存储系统
- **完整对局记录**：PGN格式完整存储
- **元数据管理**：时间、对手、结果、等级分等
- **分类标签系统**：按开局、结果、对手类型等分类
- **版本控制**：对局分析更新版本管理

### 10.2 智能检索系统
- **局面搜索**：按FEN局面搜索相似对局
- **模式搜索**：按战术模式、战略模式搜索
- **统计搜索**：按胜率、等级分范围等搜索
- **组合搜索**：多条件组合高级搜索

### 10.3 对局分析系统
- **批量分析**：对多局对局进行批量引擎分析
- **对比分析**：对比不同对局的相似局面处理
- **趋势分析**：分析对局风格和进步趋势
- **弱点分析**：从历史对局中识别个人弱点

## 技术实现

### 对局数据库架构
```javascript
class GameDatabase {
  constructor() {
    this.games = new Map(); // gameId -> game
    this.indexes = {
      byPlayer: new Map(),   // playerName -> [gameIds]
      byOpening: new Map(),  // openingECO -> [gameIds]
      byDate: new Map(),     // date -> [gameIds]
      byResult: new Map(),   // result -> [gameIds]
      byRating: new Map(),   // ratingRange -> [gameIds]
    };
    this.positionIndex = new PositionIndex(); // 局面索引
  }

  addGame(gameData) {
    const gameId = this.generateGameId(gameData);
    const game = this.processGameData(gameData);

    // 存储主记录
    this.games.set(gameId, game);

    // 更新所有索引
    this.updateIndexes(gameId, game);

    // 建立局面索引
    this.indexPositions(gameId, game);

    return gameId;
  }

  processGameData(rawData) {
    // 处理原始对局数据，提取元数据
    return {
      id: null, // 由generateGameId填充
      pgn: rawData.pgn,
      metadata: {
        date: this.extractDate(rawData.pgn),
        white: this.extractPlayer(rawData.pgn, 'White'),
        black: this.extractPlayer(rawData.pgn, 'Black'),
        result: this.extractResult(rawData.pgn),
        eco: this.extractECO(rawData.pgn),
        opening: this.extractOpening(rawData.pgn),
        event: this.extractEvent(rawData.pgn),
        site: this.extractSite(rawData.pgn),
        round: this.extractRound(rawData.pgn),
        whiteElo: this.extractElo(rawData.pgn, 'WhiteElo'),
        blackElo: this.extractElo(rawData.pgn, 'BlackElo'),
      },
      analysis: {
        engineAnalysis: null, // 后续添加
        userAnnotations: [],
        tags: [],
        highlights: []
      },
      positions: this.extractPositions(rawData.pgn),
      moves: this.extractMoves(rawData.pgn),
      statistics: this.calculateStatistics(rawData.pgn)
    };
  }

  extractPositions(pgn) {
    // 从PGN提取关键局面
    const positions = [];
    const game = new Chess();
    const moves = this.parsePgnMoves(pgn);

    moves.forEach((move, index) => {
      game.move(move);

      // 只索引关键局面
      if (this.isKeyPosition(game, index)) {
        positions.push({
          moveNumber: Math.ceil((index + 1) / 2),
          fen: game.fen(),
          eval: null, // 后续分析
          comment: '',
          isCritical: this.isCriticalPosition(game, index)
        });
      }
    });

    return positions;
  }

  isKeyPosition(game, moveIndex) {
    // 判断是否为关键局面的启发式规则
    const conditions = [
      moveIndex < 10, // 前10步都是关键
      moveIndex % 10 === 0, // 每10步
      game.in_check(), // 将军局面
      this.hasMaterialChange(game), // 子力变化
      this.hasTacticalOpportunity(game) // 战术机会
    ];

    return conditions.some(cond => cond);
  }

  searchByPosition(fen, similarityThreshold = 0.8) {
    // 按局面相似度搜索
    const results = this.positionIndex.search(fen);

    return results
      .filter(result => result.similarity >= similarityThreshold)
      .map(result => ({
        gameId: result.gameId,
        position: result.position,
        similarity: result.similarity,
        context: this.getPositionContext(result.gameId, result.positionIndex)
      }));
  }

  searchAdvanced(query) {
    // 高级组合搜索
    let results = new Set();

    // 按条件逐步过滤
    if (query.player) {
      const playerGames = this.indexes.byPlayer.get(query.player) || [];
      this.addToSet(results, playerGames);
    }

    if (query.opening) {
      const openingGames = this.indexes.byOpening.get(query.opening) || [];
      this.filterSet(results, openingGames);
    }

    if (query.dateRange) {
      const dateGames = this.getGamesInDateRange(query.dateRange);
      this.filterSet(results, dateGames);
    }

    if (query.minRating || query.maxRating) {
      const ratingGames = this.getGamesInRatingRange(query.minRating, query.maxRating);
      this.filterSet(results, ratingGames);
    }

    if (query.position) {
      const positionGames = this.searchByPosition(query.position).map(r => r.gameId);
      this.filterSet(results, positionGames);
    }

    // 转换为游戏详情
    return Array.from(results).map(gameId => this.games.get(gameId));
  }
}
```

### 局面索引系统
```javascript
class PositionIndex {
  constructor() {
    this.positionHash = new Map(); // positionSignature -> [gameEntries]
    this.signatureCache = new Map(); // fen -> signature
  }

  addPosition(gameId, position, moveIndex) {
    const signature = this.calculateSignature(position.fen);
    const entry = {
      gameId,
      positionIndex: moveIndex,
      fen: position.fen,
      metadata: {
        moveNumber: position.moveNumber,
        isCritical: position.isCritical,
        material: this.calculateMaterial(position.fen)
      }
    };

    if (!this.positionHash.has(signature)) {
      this.positionHash.set(signature, []);
    }
    this.positionHash.get(signature).push(entry);

    // 缓存签名
    this.signatureCache.set(position.fen, signature);
  }

  calculateSignature(fen) {
    // 计算局面的特征签名，用于快速相似度比较
    const [board, activeColor, castling, enPassant, halfmove, fullmove] = fen.split(' ');

    // 简化局面表示，忽略不重要的细节
    const simplified = this.simplifyPosition(board);

    // 计算哈希
    return this.hashString(simplified + activeColor);
  }

  simplifyPosition(board) {
    // 简化局面表示，用于相似度比较
    // 移除兵的具体位置细节，保留结构特征
    const rows = board.split('/');
    const simplifiedRows = rows.map(row => {
      return row.replace(/\d+/g, match => {
        // 将连续空格替换为计数
        return '·'.repeat(parseInt(match));
      });
    });

    // 移除具体兵的位置，只保留是否有兵
    const pawnsOnly = simplifiedRows.map(row => {
      return row.replace(/[^pP·]/g, '·').replace(/[pP]/g, 'P');
    });

    return pawnsOnly.join('/');
  }

  search(targetFen, maxResults = 50) {
    const targetSignature = this.calculateSignature(targetFen);
    const results = [];

    // 搜索相似签名
    this.positionHash.forEach((entries, signature) => {
      const similarity = this.calculateSignatureSimilarity(targetSignature, signature);
      if (similarity > 0.6) { // 相似度阈值
        entries.forEach(entry => {
          // 计算精确相似度
          const exactSimilarity = this.calculatePositionSimilarity(targetFen, entry.fen);
          results.push({
            gameId: entry.gameId,
            positionIndex: entry.positionIndex,
            fen: entry.fen,
            similarity: exactSimilarity,
            metadata: entry.metadata
          });
        });
      }
    });

    // 排序返回最佳匹配
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxResults);
  }

  calculatePositionSimilarity(fen1, fen2) {
    // 计算两个局面的相似度 (0-1)
    const [board1] = fen1.split(' ');
    const [board2] = fen2.split(' ');

    const pieces1 = this.extractPiecePlacement(board1);
    const pieces2 = this.extractPiecePlacement(board2);

    // 计算共同棋子比例
    let commonPieces = 0;
    let totalPieces = 0;

    pieces1.forEach((piece, square) => {
      if (pieces2.has(square) && pieces2.get(square) === piece) {
        commonPieces++;
      }
      totalPieces++;
    });

    pieces2.forEach((piece, square) => {
      if (!pieces1.has(square)) {
        totalPieces++;
      }
    });

    return commonPieces / totalPieces;
  }
}
```

## 用户界面

### 对局库浏览器
```
我的对局库 (共248局)
┌─────────────────────────────────────────────────────────┐
│ 搜索：____________________ [搜索] [高级搜索]           │
│                                                         │
│ 筛选器：                                                │
│ □ 全部对局 (248) □ 胜利 (156) □ 失败 (72) □ 和棋 (20)  │
│ □ 执白 (124) □ 执黑 (124) □ vs AI (180) □ vs 人 (68)   │
│ □ 最近7天 (12) □ 最近30天 (48) □ 最近90天 (112)       │
│                                                         │
│ 排序：▽ 日期 ▽ 对手等级 ▽ 结果 ▽ 对局评分             │
├─────────────────────────────────────────────────────────┤
│ 2025-03-15 AI-卡尔森 (2400) 胜 1-0 评分:8.2 ★★★★☆    │
│ 2025-03-14 李华 (1750) 胜 1-0 评分:7.5 ★★★☆☆        │
│ 2025-03-13 AI-卡斯帕罗夫 (2200) 负 0-1 评分:6.8 ★★★☆☆│
│ 2025-03-12 AI-卡尔森 (2400) 负 0-1 评分:7.1 ★★★☆☆    │
│ 2025-03-11 王明 (1680) 胜 1-0 评分:8.5 ★★★★★        │
│ 2025-03-10 AI-卡鲁阿纳 (2100) 和 ½-½ 评分:7.8 ★★★★☆  │
│ 2025-03-09 AI-卡尔森 (2400) 负 0-1 评分:6.5 ★★☆☆☆    │
│ 2025-03-08 张伟 (1720) 胜 1-0 评分:8.9 ★★★★★        │
│ 2025-03-07 AI-丁立人 (2300) 负 0-1 评分:7.2 ★★★☆☆    │
│ 2025-03-06 AI-卡尔森 (2400) 胜 1-0 评分:9.1 ★★★★★    │
└─────────────────────────────────────────────────────────┘
```

### 对局详情页面
```
对局详情 #G-20250315-001
┌─────────────────────────────────────────────────────────┐
│ 基本信息                                                │
│ 日期：2025-03-15 14:30 │ 时长：45分23秒                │
│ 结果：白方胜 (1-0)    │ 对局评分：8.2/10              │
│ 开局：西班牙开局 (C84)│ 阶段：中局战术决胜            │
│                                                         │
│ 白方：张小明 (1652)   │ 黑方：AI-卡尔森 (2400)        │
│ 步数：42              │ 最终局面：白方多一车          │
├─────────────────────────────────────────────────────────┤
│ 关键局面                                              │
│ 第18步：战术组合机会 (+2.1)                          │
│ 第25步：决定性优势 (+3.5)                            │
│ 第32步：技术转换 (+4.2)                              │
│                                                         │
│ 标签：                                                │
│ #战术组合 #西班牙开局 #战胜强AI #时间压力             │
├─────────────────────────────────────────────────────────┤
│ 走法记录                                              │
│ 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6              │
│ 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O              │
│ 9. h3 Bb7 10. d4 Re8 11. Nbd2 Bf8 12. a4 h6           │
│ 13. Bc2 exd4 14. cxd4 Nb4 15. Bb1 c5 16. d5 Nd7       │
│ 17. Ra3 c4 18. axb5 axb5 19. Nc4! Nb6 20. Nxb6 Qxb6   │
│ 21. Rg3! Kh8 22. Bh6! gxh6 23. Qd2 Rg8 24. Rxg8+ Kxg8 │
│ 25. e5! dxe5 26. Re1 Qd8 27. d6 Bc6 28. Bg5 hxg5      │
│ 29. Qxg5+ Kh8 30. Qh6+ Kg8 31. Re3 f5 32. Rg3+ Kf7    │
│ 33. Qg7+ Ke6 34. Qxf8 Qxf8 35. Rg7 Qf7 36. Rxf7 Kxf7  │
│ 37. d7 Ke7 38. d8=Q+ Kf7 39. Qd7+ Kg6 40. Qe8+ Kg7    │
│ 41. Qxe5+ Kg8 42. Qxb5 1-0                            │
└─────────────────────────────────────────────────────────┘
```

### 高级搜索界面
```
高级搜索
├── 基本条件
│   ├── 对手：________ (名称或等级分范围)
│   ├── 日期：从 _年_月_日 到 _年_月_日
│   ├── 结果：▽ 全部 ▽ 胜 ▽ 负 ▽ 和
│   └── 颜色：▽ 全部 ▽ 白 ▽ 黑
├── 开局条件
│   ├── ECO代码：________ (如 C84)
│   ├── 开局名称：________ (如 西班牙开局)
│   └── 变例：________ (如 马歇尔弃兵)
├── 局面条件
│   ├── FEN代码：______________________________________
│   ├── 相似度：▽ 精确 ▽ 高 (>80%) ▽ 中 (>60%)
│   └── 搜索范围：▽ 全部局面 ▽ 关键局面 ▽ 指定步数
├── 分析条件
│   ├── 最低评分：____/10
│   ├── 错误数量：少于 ____ 个
│   ├── 战术机会：至少抓住 ____%
│   └── 时间使用：效率高于 ____%
└── 标签条件
    ├── 包含标签：________________
    ├── 排除标签：________________
    └── 我的注释：包含关键词 ________

[搜索] [保存搜索条件] [重置]
```

## 智能分析功能

### 1. 批量对局分析
- **引擎分析**：使用Stockfish批量分析历史对局
- **统计分析**：计算胜率、错误率、最佳走法率等统计
- **模式识别**：识别个人常见模式和习惯
- **进步验证**：验证训练效果在对局中的体现

### 2. 对手对局研究
- **对手数据库**：建立常遇对手的对局库
- **风格分析**：分析对手的棋风、习惯、弱点
- **开局偏好**：统计对手常用开局和应对
- **针对性准备**：基于历史对局的比赛准备

### 3. 开局库构建
- **个人开局统计**：统计各开局的胜率和表现
- **变例效果分析**：分析不同变例的效果
- **武器库优化**：基于数据优化个人开局武器库
- **比赛准备**：针对特定对手的开局准备

### 4. 弱点系统性分析
```javascript
function analyzeSystematicWeaknesses(gameHistory) {
  const weaknesses = {
    tactical: { patterns: [], frequency: 0, impact: 0 },
    positional: { patterns: [], frequency: 0, impact: 0 },
    timeManagement: { patterns: [], frequency: 0, impact: 0 },
    psychological: { patterns: [], frequency: 0, impact: 0 },
    opening: { patterns: [], frequency: 0, impact: 0 },
    endgame: { patterns: [], frequency: 0, impact: 0 }
  };

  gameHistory.forEach(game => {
    // 分析每局对局的错误模式
    const gameWeaknesses = analyzeGameWeaknesses(game);

    // 累加到总体弱点
    Object.keys(gameWeaknesses).forEach(type => {
      if (weaknesses[type]) {
        weaknesses[type].patterns.push(...gameWeaknesses[type].patterns);
        weaknesses[type].frequency += gameWeaknesses[type].frequency;
        weaknesses[type].impact += gameWeaknesses[type].impact;
      }
    });
  });

  // 计算平均频率和影响
  Object.keys(weaknesses).forEach(type => {
    if (gameHistory.length > 0) {
      weaknesses[type].frequency /= gameHistory.length;
      weaknesses[type].impact /= gameHistory.length;
    }

    // 识别最常见模式
    weaknesses[type].commonPatterns = identifyCommonPatterns(weaknesses[type].patterns);
  });

  return weaknesses;
}

function analyzeGameWeaknesses(game) {
  const weaknesses = {};
  const analysis = game.analysis.engineAnalysis;

  analysis.criticalMoves.forEach(move => {
    if (move.scoreDiff < -1.0) { // 严重错误
      const weaknessType = classifyWeaknessType(move);
      if (!weaknesses[weaknessType]) {
        weaknesses[weaknessType] = { patterns: [], frequency: 0, impact: 0 };
      }

      weaknesses[weaknessType].patterns.push({
        moveNumber: move.moveNumber,
        position: move.position,
        mistake: move.mistake,
        correctMove: move.correctMove,
        scoreLoss: move.scoreDiff
      });
      weaknesses[weaknessType].frequency++;
      weaknesses[weaknessType].impact += Math.abs(move.scoreDiff);
    }
  });

  return weaknesses;
}
```

## 数据导出和分享

### 导出格式支持
- **PGN标准格式**：完整对局记录，兼容所有国际象棋软件
- **CSV统计数据**：对局统计数据的表格格式
- **PDF分析报告**：美观的打印格式分析报告
- **JSON原始数据**：完整数据，用于进一步分析

### 分享功能
- **对局链接**：生成可分享的对局查看链接
- **局面图分享**：生成局面图片分享到社交媒体
- **分析报告分享**：分享完整分析报告
- **训练成果分享**：分享进步成果和成就

### 云同步功能
- **自动备份**：对局数据自动云备份
- **多设备同步**：在多个设备间同步对局库
- **数据恢复**：误删除数据的恢复功能
- **版本历史**：对局分析的历史版本

## 隐私和安全

### 数据保护
- **本地存储优先**：对局数据优先存储在本地
- **加密传输**：云同步时使用端到端加密
- **访问控制**：分享链接的访问权限控制
- **数据所有权**：用户完全拥有自己的对局数据

### 隐私设置
- **公开范围控制**：控制哪些对局可以公开分享
- **匿名选项**：分享时隐藏真实姓名
- **数据导出控制**：控制哪些数据可以导出
- **自动清理**：设置自动清理旧对局数据

## 技术挑战

### 挑战1：搜索性能
- **解决方案**：高效的索引结构和缓存机制
- **目标**：局面搜索响应时间 < 500ms

### 挑战2：存储效率
- **解决方案**：数据压缩和增量存储
- **目标**：1000局对局存储空间 < 100MB

### 挑战3：分析准确性
- **解决方案**：多引擎分析和人工验证
- **目标**：弱点识别准确率 > 85%

## 测试计划

### 功能完整性测试
- 对局存储和检索功能测试
- 搜索功能准确性测试
- 分析功能有效性测试

### 性能测试
- 大规模对局库性能测试
- 搜索响应时间测试
- 存储空间效率测试

### 用户体验测试
- 界面操作流畅性测试
- 功能易用性测试
- 数据管理便利性测试

## 成功标准
- 对局检索准确率 > 99%
- 局面搜索响应时间 < 1秒
- 用户数据管理满意度 > 4.5/5分
- 对局分析价值认可度 > 85%