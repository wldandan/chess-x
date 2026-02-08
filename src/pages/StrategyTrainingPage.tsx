// 策略思维指导训练页面
import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import StrategyBoard from '../components/strategy/StrategyBoard';
import PositionEvaluationPanel from '../components/strategy/PositionEvaluationPanel';
import PlanGenerationPanel from '../components/strategy/PlanGenerationPanel';
import DecisionTrainingPanel from '../components/strategy/DecisionTrainingPanel';
import StrategicConceptsLibrary from '../components/strategy/StrategicConceptsLibrary';
import type {
  StrategyExercise,
  StrategicPlan,
  PositionEvaluation,
  StrategicTheme
} from '../types/training.types';
import '../styles/pages.css';
import '../styles/strategy.css';

const StrategyTrainingPage: React.FC = () => {
  // State
  const [currentExercise, setCurrentExercise] = useState<StrategyExercise | null>(null);
  const [userEvaluation, setUserEvaluation] = useState<PositionEvaluation | null>(null);
  const [userPlan, setUserPlan] = useState<StrategicPlan | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<StrategicPlan | null>(null);
  const [decision, setDecision] = useState<string>('');
  const [trainingMode, setTrainingMode] = useState<'evaluation' | 'planning' | 'decision'>('evaluation');
  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'partial' | 'incorrect' | 'hint' | null;
    message: string;
    details?: string[];
  }>({ type: null, message: '' });

  // 加载示例训练题目
  useEffect(() => {
    // 暂时使用模拟数据，后续从API获取
    const mockExercise: StrategyExercise = {
      id: 'strategy-001',
      type: 'strategy',
      difficulty: 'intermediate',
      title: '中心控制与空间优势',
      description: '评估当前局面并制定中心突破计划',
      fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
      orientation: 'white',
      objective: 'create_plan',
      solution: [],
      alternativeSolutions: [],
      hints: [
        { level: 1, content: '关注中心d4和e5格的控制' },
        { level: 2, content: '考虑白方空间优势的利用' },
        { level: 3, content: '制定具体的中心突破计划' },
      ],
      explanation: '白方拥有轻微的空间优势，需要通过d4突破来巩固中心控制。',
      tags: ['center_control', 'space_advantage', 'planning'],
      estimatedTime: 180,
      rating: 3.5,
      attempts: 0,
      successRate: 0,
      averageTime: 0,
      strategicThemes: ['center_control', 'space_advantage', 'piece_activity'],
      positionEvaluation: {
        score: 0.8,
        breakdown: {
          material: 0.0,
          activity: 0.3,
          pawnStructure: 0.2,
          kingSafety: 0.1,
          space: 0.2,
          tempo: 0.0,
        },
        verbal: '白方有轻微的空间优势和更好的子力配置',
      },
      planOptions: [
        {
          name: '中心突破计划',
          description: '通过d4突破巩固中心优势',
          steps: [
            {
              moveRange: '接下来3-5步',
              objectives: ['准备d4突破', '控制中心格', '限制黑方反击'],
              keyPositions: [
                'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R b KQkq - 0 4',
              ],
            },
          ],
          advantages: ['获得空间和主动权', '限制黑方子力活动', '创造进攻机会'],
          risks: ['可能形成孤兵', '过早进攻暴露弱点'],
          suitability: 0.85,
        },
        {
          name: '侧翼进攻计划',
          description: '在国王翼发起攻击',
          steps: [
            {
              moveRange: '接下来4-6步',
              objectives: ['推进h兵', '打开h线', '调动重子攻击'],
              keyPositions: [],
            },
          ],
          advantages: ['制造王城压力', '利用空间优势'],
          risks: ['削弱己方王城', '战线过长'],
          suitability: 0.72,
        },
      ],
      timeForPlanning: 300,
    };
    setCurrentExercise(mockExercise);
  }, []);

  // 处理局面评估提交
  const handleEvaluationSubmit = (evaluation: PositionEvaluation) => {
    setUserEvaluation(evaluation);
    if (currentExercise) {
      // 简单比较：检查评分是否接近AI评估
      const scoreDiff = Math.abs(evaluation.score - currentExercise.positionEvaluation.score);
      if (scoreDiff < 0.5) {
        setFeedback({
          type: 'correct',
          message: '评估准确！与AI评估基本一致。',
          details: [`你的评分: ${evaluation.score.toFixed(1)}`, `AI评分: ${currentExercise.positionEvaluation.score.toFixed(1)}`],
        });
      } else if (scoreDiff < 1.0) {
        setFeedback({
          type: 'partial',
          message: '评估基本正确，但有一些偏差。',
          details: [`评分差异: ${scoreDiff.toFixed(1)}`],
        });
      } else {
        setFeedback({
          type: 'incorrect',
          message: '评估需要改进。查看详细分析。',
          details: [`你的评分: ${evaluation.score.toFixed(1)}`, `AI评分: ${currentExercise.positionEvaluation.score.toFixed(1)}`],
        });
      }
    }
  };

  // 处理计划提交
  const handlePlanSubmit = (plan: StrategicPlan) => {
    setUserPlan(plan);
    if (currentExercise) {
      // 简单评估：检查计划是否有合理的步骤和目标
      const hasSteps = plan.steps.length > 0;
      const hasClearObjectives = plan.steps.every(step => step.objectives.length > 0);

      if (hasSteps && hasClearObjectives) {
        setFeedback({
          type: 'correct',
          message: '计划制定良好！结构清晰，目标明确。',
          details: [`计划名称: ${plan.name}`, `步骤数: ${plan.steps.length}`],
        });
      } else {
        setFeedback({
          type: 'partial',
          message: '计划需要完善。确保每个步骤都有明确目标。',
          details: [],
        });
      }
    }
  };

  // 处理决策提交
  const handleDecisionSubmit = (decision: string) => {
    setDecision(decision);
    // 简单反馈：基于决策类型
    const decisionAnalysis: Record<string, string> = {
      '进攻性': '积极寻求机会，适合优势局面',
      '局面性': '稳健积累优势，适合均势局面',
      '防守性': '巩固局面消除弱点，适合劣势局面',
      '等待性': '考验耐心和心理，适合复杂局面',
    };

    if (decisionAnalysis[decision]) {
      setFeedback({
        type: 'correct',
        message: `选择${decision}策略是合理的。`,
        details: [decisionAnalysis[decision]],
      });
    }
  };

  // 切换训练模式
  const handleModeChange = (mode: 'evaluation' | 'planning' | 'decision') => {
    setTrainingMode(mode);
    setFeedback({ type: null, message: '' });
  };

  // 开始新训练
  const handleNewTraining = () => {
    // 重置状态
    setUserEvaluation(null);
    setUserPlan(null);
    setSelectedPlan(null);
    setDecision('');
    setFeedback({ type: null, message: '' });
  };

  // 如果没有训练题目，显示加载状态
  if (!currentExercise) {
    return (
      <div className="strategy-training-page loading">
        <div className="page-header">
          <h2 className="page-title">策略思维指导训练</h2>
          <p className="page-subtitle">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="strategy-training-page">
      <div className="page-header">
        <h2 className="page-title">策略思维指导训练</h2>
        <p className="page-subtitle">
          培养局面评估、计划制定和战略决策能力
        </p>
      </div>

      {/* 训练模式选择 */}
      <div className="training-mode-selector">
        <div className="mode-tabs">
          <button
            className={`mode-tab ${trainingMode === 'evaluation' ? 'active' : ''}`}
            onClick={() => handleModeChange('evaluation')}
          >
            <span className="tab-icon">📊</span>
            <span className="tab-label">局面评估训练</span>
          </button>
          <button
            className={`mode-tab ${trainingMode === 'planning' ? 'active' : ''}`}
            onClick={() => handleModeChange('planning')}
          >
            <span className="tab-icon">🗺️</span>
            <span className="tab-label">计划制定训练</span>
          </button>
          <button
            className={`mode-tab ${trainingMode === 'decision' ? 'active' : ''}`}
            onClick={() => handleModeChange('decision')}
          >
            <span className="tab-icon">🤔</span>
            <span className="tab-label">决策训练</span>
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="strategy-content">
        {/* 棋盘区域 */}
        <div className="strategy-board-section">
          <StrategyBoard
            fen={currentExercise.fen}
            orientation={currentExercise.orientation}
            currentPlan={selectedPlan}
            showEvaluation={trainingMode === 'evaluation'}
          />

          {/* 训练题目信息 */}
          <div className="exercise-info">
            <h3 className="exercise-title">{currentExercise.title}</h3>
            <p className="exercise-description">{currentExercise.description}</p>
            <div className="exercise-tags">
              {currentExercise.strategicThemes.map((theme, index) => (
                <span key={index} className="tag">{theme}</span>
              ))}
            </div>
          </div>
        </div>

        {/* 训练面板区域 */}
        <div className="strategy-panel-section">
          {trainingMode === 'evaluation' && (
            <PositionEvaluationPanel
              exercise={currentExercise}
              userEvaluation={userEvaluation}
              onSubmit={handleEvaluationSubmit}
              feedback={feedback}
            />
          )}

          {trainingMode === 'planning' && (
            <PlanGenerationPanel
              exercise={currentExercise}
              userPlan={userPlan}
              onSubmit={handlePlanSubmit}
              onSelectPlan={setSelectedPlan}
              feedback={feedback}
            />
          )}

          {trainingMode === 'decision' && (
            <DecisionTrainingPanel
              exercise={currentExercise}
              userDecision={decision}
              onSubmit={handleDecisionSubmit}
              feedback={feedback}
            />
          )}
        </div>
      </div>

      {/* 反馈显示 */}
      {feedback.type && (
        <div className={`feedback-overlay feedback-${feedback.type}`}>
          <div className="feedback-content">
            <h3 className="feedback-title">
              {feedback.type === 'correct' ? '✓ 正确' :
               feedback.type === 'partial' ? '⚠ 部分正确' :
               '✗ 需要改进'}
            </h3>
            <p className="feedback-message">{feedback.message}</p>
            {feedback.details && feedback.details.length > 0 && (
              <ul className="feedback-details">
                {feedback.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            )}
            <button
              className="btn btn-primary"
              onClick={() => setFeedback({ type: null, message: '' })}
            >
              继续
            </button>
          </div>
        </div>
      )}

      {/* 战略概念库 */}
      <div className="strategic-concepts-section">
        <StrategicConceptsLibrary
          themes={currentExercise.strategicThemes}
          onThemeSelect={(theme) => console.log('Theme selected:', theme)}
        />
      </div>

      {/* 控制按钮 */}
      <div className="strategy-controls">
        <button className="btn btn-outline" onClick={handleNewTraining}>
          新训练
        </button>
        <button className="btn btn-secondary" onClick={() => console.log('Hint')}>
          提示
        </button>
        <button className="btn btn-primary" onClick={() => console.log('Next')}>
          下一个
        </button>
      </div>
    </div>
  );
};

export default StrategyTrainingPage;