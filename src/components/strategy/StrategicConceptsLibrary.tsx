// 战略概念库组件
import React, { useState } from 'react';
import type { StrategicTheme } from '../../types/training.types';

interface StrategicConceptsLibraryProps {
  themes: StrategicTheme[];
  onThemeSelect: (theme: StrategicTheme) => void;
}

const StrategicConceptsLibrary: React.FC<StrategicConceptsLibraryProps> = ({
  themes,
  onThemeSelect,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<StrategicTheme | null>(null);

  // 战略概念定义
  const conceptDefinitions: Record<StrategicTheme, {
    name: string;
    icon: string;
    description: string;
    keyPrinciples: string[];
    typicalPlans: string[];
    commonMistakes: string[];
    trainingExercises: string[];
  }> = {
    center_control: {
      name: '中心控制',
      icon: '🎯',
      description: '控制棋盘中心区域（d4、d5、e4、e5格）的战略重要性',
      keyPrinciples: [
        '中心棋子控制更多格子',
        '中心控制提供更好的子力调动',
        '中心优势可以转化为侧翼进攻',
        '中心突破是常见战术手段',
      ],
      typicalPlans: [
        '建立中心兵链（d4+e4或d5+e5）',
        '用轻子（马、象）控制中心格',
        '适时进行中心突破（d4/d5或e4/e5）',
        '中心交换后重组攻势',
      ],
      commonMistakes: [
        '过早放弃中心控制',
        '中心兵链过于暴露',
        '忽视对手的中心反击',
        '中心优势未及时转化',
      ],
      trainingExercises: [
        '中心控制局面评估',
        '中心突破计划制定',
        '中心交换决策训练',
      ],
    },
    pawn_structure: {
      name: '兵型结构',
      icon: '🧩',
      description: '分析兵链、弱兵、通路兵等兵型要素的战略意义',
      keyPrinciples: [
        '孤兵是弱点也是进攻支点',
        '叠兵限制子力活动但增加防御',
        '通路兵是残局重要优势',
        '兵链需要整体维护',
      ],
      typicalPlans: [
        '攻击对手的孤兵',
        '制造自己的通路兵',
        '改善兵型消除弱点',
        '利用兵型限制对手',
      ],
      commonMistakes: [
        '随意制造孤兵',
        '忽视兵型弱点',
        '通路兵推进过早',
        '兵型固化失去灵活性',
      ],
      trainingExercises: [
        '兵型弱点识别',
        '通路兵制造计划',
        '兵型改善决策',
      ],
    },
    piece_activity: {
      name: '子力活跃度',
      icon: '⚡',
      description: '优化棋子位置和协调性，最大化子力效率',
      keyPrinciples: [
        '好象优于坏象（有自己兵的支持）',
        '活跃马控制关键格',
        '重子需要开放线',
        '子力协调产生合力',
      ],
      typicalPlans: [
        '改善坏象位置',
        '为马寻找前进支点',
        '打开线路调动重子',
        '建立子力协同攻击',
      ],
      commonMistakes: [
        '子力被困在后方',
        '棋子互相阻碍',
        '忽视子力协调',
        '活跃子力未利用',
      ],
      trainingExercises: [
        '子力活跃度评估',
        '坏象改善计划',
        '子力协同训练',
      ],
    },
    king_safety: {
      name: '王的安全',
      icon: '🏰',
      description: '评估王城防御、弱点和安全措施',
      keyPrinciples: [
        '王的安全优先于一切',
        '易位后王城需要适当防御',
        '王前兵阵弱点需要保护',
        '攻王需要充分准备',
      ],
      typicalPlans: [
        '王城兵阵加固',
        '消除王前弱点',
        '制造对手王城弱点',
        '组织攻王组合',
      ],
      commonMistakes: [
        '王城兵阵过早削弱',
        '忽视对手攻王威胁',
        '王留在中心过久',
        '攻王准备不足',
      ],
      trainingExercises: [
        '王城弱点评估',
        '攻王计划制定',
        '王的安全决策',
      ],
    },
    space_advantage: {
      name: '空间优势',
      icon: '🌌',
      description: '利用棋盘空间控制对手活动范围',
      keyPrinciples: [
        '空间优势限制对手子力',
        '空间需要适时转化为攻势',
        '空间过大可能难以防守',
        '空间优势需要子力配合',
      ],
      typicalPlans: [
        '逐步挤压对手空间',
        '利用空间调动子力',
        '空间优势侧翼转移',
        '空间换时间决策',
      ],
      commonMistakes: [
        '空间优势未利用',
        '空间过大导致弱点',
        '忽视对手空间反击',
        '空间优势未及时转化',
      ],
      trainingExercises: [
        '空间优势评估',
        '空间挤压计划',
        '空间转化决策',
      ],
    },
    initiative: {
      name: '主动权',
      icon: '🎖️',
      description: '掌握局面主动，迫使对手被动应对',
      keyPrinciples: [
        '主动权可以补偿子力劣势',
        '主动权需要持续施压',
        '主动权可能随时间消失',
        '主动权需要准确计算',
      ],
      typicalPlans: [
        '制造持续威胁',
        '迫使对手被动防守',
        '主动权转化实际优势',
        '时间与主动权平衡',
      ],
      commonMistakes: [
        '主动权未持续',
        '过度追求主动权',
        '忽视防守弱点',
        '主动权未及时转化',
      ],
      trainingExercises: [
        '主动权评估',
        '持续施压计划',
        '主动权转化决策',
      ],
    },
    prophylaxis: {
      name: '预防性着法',
      icon: '🛡️',
      description: '预见并阻止对手计划，限制对手选择',
      keyPrinciples: [
        '预防优于治疗',
        '预见对手威胁',
        '限制对手选择',
        '保持局面弹性',
      ],
      typicalPlans: [
        '消除对手战术机会',
        '阻止对手计划执行',
        '限制对手子力活动',
        '保持局面控制',
      ],
      commonMistakes: [
        '过度预防失去主动',
        '忽视对手实际威胁',
        '预防性着法过于被动',
        '预防导致局面僵化',
      ],
      trainingExercises: [
        '威胁预见训练',
        '预防计划制定',
        '攻防平衡决策',
      ],
    },
    weaknesses: {
      name: '弱点攻击',
      icon: '🎯',
      description: '识别并攻击对手局面弱点',
      keyPrinciples: [
        '弱点需要压力才有意义',
        '多重弱点产生合力',
        '弱点可能转移',
        '弱点攻击需要耐心',
      ],
      typicalPlans: [
        '弱点识别和评估',
        '弱点施加压力',
        '弱点组合攻击',
        '弱点转化实际优势',
      ],
      commonMistakes: [
        '攻击不存在弱点',
        '弱点攻击不足',
        '忽视对手弱点补救',
        '弱点攻击不连贯',
      ],
      trainingExercises: [
        '弱点识别评估',
        '弱点攻击计划',
        '弱点转化决策',
      ],
    },
  };

  // 处理主题选择
  const handleThemeSelect = (theme: StrategicTheme) => {
    setSelectedTheme(theme);
    onThemeSelect(theme);
  };

  // 获取当前主题的概念
  const currentConcept = selectedTheme ? conceptDefinitions[selectedTheme] : null;

  return (
    <div className="strategic-concepts-library">
      <div className="library-header">
        <h3 className="library-title">
          <span className="library-icon">📚</span>
          战略概念库
        </h3>
        <p className="library-description">
          学习国际象棋核心战略概念，提升局面理解深度
        </p>
      </div>

      {/* 主题选择 */}
      <div className="theme-selection">
        <h4 className="selection-title">相关战略主题</h4>
        <div className="themes-grid">
          {themes.map((theme) => {
            const concept = conceptDefinitions[theme];
            return (
              <div
                key={theme}
                className={`theme-card ${selectedTheme === theme ? 'selected' : ''}`}
                onClick={() => handleThemeSelect(theme)}
              >
                <div className="theme-header">
                  <span className="theme-icon">{concept.icon}</span>
                  <span className="theme-name">{concept.name}</span>
                </div>
                <p className="theme-description">{concept.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 概念详情 */}
      {currentConcept && (
        <div className="concept-details">
          <div className="concept-header">
            <div className="concept-title">
              <span className="concept-icon">{currentConcept.icon}</span>
              <h4 className="concept-name">{currentConcept.name}</h4>
            </div>
            <button
              className="btn btn-sm btn-text"
              onClick={() => setSelectedTheme(null)}
            >
              关闭详情
            </button>
          </div>

          <div className="concept-content">
            <div className="concept-section">
              <h5 className="section-title">核心原则</h5>
              <ul className="principles-list">
                {currentConcept.keyPrinciples.map((principle, index) => (
                  <li key={index} className="principle-item">
                    {principle}
                  </li>
                ))}
              </ul>
            </div>

            <div className="concept-section">
              <h5 className="section-title">典型计划</h5>
              <ul className="plans-list">
                {currentConcept.typicalPlans.map((plan, index) => (
                  <li key={index} className="plan-item">
                    <span className="plan-bullet">→</span>
                    {plan}
                  </li>
                ))}
              </ul>
            </div>

            <div className="concept-section">
              <h5 className="section-title">常见错误</h5>
              <ul className="mistakes-list">
                {currentConcept.commonMistakes.map((mistake, index) => (
                  <li key={index} className="mistake-item">
                    <span className="mistake-bullet">✗</span>
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>

            <div className="concept-section">
              <h5 className="section-title">训练建议</h5>
              <div className="exercises-list">
                {currentConcept.trainingExercises.map((exercise, index) => (
                  <div key={index} className="exercise-item">
                    <span className="exercise-badge">练习 {index + 1}</span>
                    <span className="exercise-name">{exercise}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="concept-example">
              <h5 className="section-title">应用实例</h5>
              <div className="example-board">
                <div className="example-fen">r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R</div>
                <div className="example-analysis">
                  <p>
                    <strong>局面分析:</strong> 白方拥有中心控制优势，可以通过d4突破进一步巩固中心。
                  </p>
                  <p>
                    <strong>战略选择:</strong> 1.d4 exd4 2.Nxd4，获得中心空间和子力活跃度。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 学习建议 */}
      <div className="learning-tips">
        <div className="tips-header">
          <span className="tips-icon">🎓</span>
          <h4 className="tips-title">学习建议</h4>
        </div>
        <ul className="tips-list">
          <li>每次训练专注1-2个战略主题</li>
          <li>分析职业对局中的战略概念应用</li>
          <li>在实战中尝试应用学到的战略</li>
          <li>定期复习战略概念库</li>
          <li>结合具体局面理解抽象概念</li>
        </ul>
      </div>

      <style jsx>{`
        .strategic-concepts-library {
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          padding: 24px;
          border: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .library-header {
          text-align: center;
          margin-bottom: 8px;
        }

        .library-title {
          margin: 0 0 8px 0;
          font-size: 20px;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .library-icon {
          font-size: 24px;
        }

        .library-description {
          margin: 0;
          color: var(--text-secondary);
          font-size: 14px;
        }

        /* 主题选择 */
        .theme-selection {
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          padding: 20px;
        }

        .selection-title {
          margin: 0 0 16px 0;
          font-size: 18px;
          color: var(--text-primary);
          text-align: center;
        }

        .themes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .theme-card {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: 16px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .theme-card:hover {
          border-color: var(--border-light);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .theme-card.selected {
          border-color: var(--secondary-color);
          background: rgba(129, 182, 76, 0.05);
          box-shadow: var(--shadow-glow);
        }

        .theme-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .theme-icon {
          font-size: 24px;
        }

        .theme-name {
          font-size: 16px;
          font-weight: bold;
          color: var(--text-primary);
        }

        .theme-description {
          margin: 0;
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        /* 概念详情 */
        .concept-details {
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .concept-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid var(--border-color);
        }

        .concept-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .concept-icon {
          font-size: 32px;
        }

        .concept-name {
          margin: 0;
          font-size: 24px;
          color: var(--text-primary);
        }

        .concept-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .concept-section {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: 16px;
        }

        .section-title {
          margin: 0 0 12px 0;
          font-size: 18px;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 8px;
        }

        .principles-list,
        .plans-list,
        .mistakes-list,
        .tips-list {
          margin: 0;
          padding-left: 20px;
        }

        .principles-list li,
        .plans-list li,
        .mistakes-list li,
        .tips-list li {
          margin-bottom: 8px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .principle-item {
          list-style-type: '✓';
          padding-left: 8px;
          color: var(--success-color);
        }

        .plan-item {
          list-style-type: none;
          padding-left: 0;
          display: flex;
          gap: 8px;
        }

        .plan-bullet {
          color: var(--info-color);
          font-weight: bold;
        }

        .mistake-item {
          list-style-type: none;
          padding-left: 0;
          display: flex;
          gap: 8px;
        }

        .mistake-bullet {
          color: var(--danger-color);
          font-weight: bold;
        }

        .exercises-list {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .exercise-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(129, 182, 76, 0.1);
          padding: 8px 12px;
          border-radius: 20px;
          border: 1px solid rgba(129, 182, 76, 0.3);
        }

        .exercise-badge {
          font-size: 12px;
          font-weight: bold;
          color: var(--secondary-color);
          background: white;
          padding: 2px 6px;
          border-radius: 10px;
        }

        .exercise-name {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .concept-example {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: 16px;
          border-left: 4px solid var(--secondary-color);
        }

        .example-board {
          margin-top: 12px;
        }

        .example-fen {
          font-family: monospace;
          background: var(--bg-primary);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          margin-bottom: 12px;
          color: var(--text-primary);
          font-size: 14px;
          word-break: break-all;
        }

        .example-analysis {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .example-analysis strong {
          color: var(--text-primary);
        }

        /* 学习建议 */
        .learning-tips {
          background: rgba(59, 130, 246, 0.1);
          border-radius: var(--radius-md);
          padding: 20px;
          border: 1px solid var(--info-color);
        }

        .tips-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .tips-icon {
          font-size: 24px;
        }

        .tips-title {
          margin: 0;
          font-size: 18px;
          color: var(--info-color);
        }

        .tips-list {
          margin: 0;
          padding-left: 20px;
        }

        .tips-list li {
          list-style-type: '💡';
          padding-left: 8px;
          margin-bottom: 8px;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .strategic-concepts-library {
            padding: 16px;
          }

          .themes-grid {
            grid-template-columns: 1fr;
          }

          .concept-name {
            font-size: 20px;
          }

          .exercises-list {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default StrategicConceptsLibrary;