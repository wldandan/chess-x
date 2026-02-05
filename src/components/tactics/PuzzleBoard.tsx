// 战术题目棋盘组件
import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import type { TacticPuzzle, TacticMove } from '../../types/tactics.types';
import type { Square } from '../../types/chess.types';

interface PuzzleBoardProps {
  puzzle: TacticPuzzle | null;
  userMoves: TacticMove[];
  onMove: (move: TacticMove) => void;
  boardOrientation?: 'white' | 'black';
  showArrows?: boolean;
  showHighlights?: boolean;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  puzzle,
  userMoves,
  onMove,
  boardOrientation = 'white',
  showArrows = true,
  showHighlights = true,
}) => {
  const [chess] = useState(() => new Chess(puzzle?.fen || 'start'));
  const [currentFen, setCurrentFen] = useState(chess.fen());

  // 更新棋盘位置
  useEffect(() => {
    if (puzzle) {
      const newChess = new Chess(puzzle.fen);
      // 重放用户已走的步数
      userMoves.forEach(move => {
        try {
          newChess.move({
            from: move.from,
            to: move.to,
            promotion: move.promotion,
          });
        } catch (e) {
          // 忽略无效走法
        }
      });
      setCurrentFen(newChess.fen());
    }
  }, [puzzle, userMoves]);

  // 处理走子
  const onDrop = (sourceSquare: Square, targetSquare: Square): boolean => {
    if (!puzzle) return false;

    const move: TacticMove = {
      from: sourceSquare,
      to: targetSquare,
    };

    // 检查是否是兵升变
    const piece = chess.get(sourceSquare);
    if (piece?.type === 'p' && (targetSquare[1] === '1' || targetSquare[1] === '8')) {
      // 默认升变为后
      move.promotion = 'q';
    }

    onMove(move);
    return true;
  };

  // 获取高亮格子
  const getCustomSquareStyles = () => {
    if (!puzzle || !showHighlights) return {};

    const styles: Record<Square, React.CSSProperties> = {};

    // 高亮关键格子
    puzzle.keySquares.forEach(square => {
      styles[square] = {
        backgroundColor: 'rgba(255, 235, 59, 0.5)',
        borderRadius: '4px',
      };
    });

    // 高亮关键棋子
    puzzle.keyPieces.forEach(square => {
      styles[square] = {
        ...styles[square],
        boxShadow: 'inset 0 0 0 4px rgba(255, 193, 7, 0.8)',
        borderRadius: '50%',
      };
    });

    // 高亮已走的格子
    userMoves.forEach(move => {
      styles[move.to] = {
        backgroundColor: 'rgba(76, 175, 80, 0.3)',
        borderRadius: '4px',
      };
    });

    return styles;
  };

  // 获取箭头标注
  const getArrows = () => {
    if (!puzzle || !showArrows || userMoves.length > 0) return [];

    const arrows: Array<[Square, Square, string]> = [];

    // 添加解答箭头（仅第一步）
    if (puzzle.solution.length > 0) {
      const firstMove = puzzle.solution[0];
      arrows.push([
        firstMove.from,
        firstMove.to,
        'rgba(76, 175, 80, 0.6)',
      ]);
    }

    return arrows;
  };

  if (!puzzle) {
    return (
      <div className="puzzle-board-placeholder">
        <div className="placeholder-content">
          <div className="placeholder-icon">🎯</div>
          <h3>准备开始</h3>
          <p>点击"开始训练"获取战术题目</p>
        </div>
      </div>
    );
  }

  return (
    <div className="puzzle-board-container">
      <div className="puzzle-board-header">
        <div className="puzzle-info">
          <span className="puzzle-type-icon">{getPuzzleIcon(puzzle.type)}</span>
          <span className="puzzle-type">{getPuzzleTypeName(puzzle.type)}</span>
          <span className="puzzle-difficulty" style={{ color: getDifficultyColor(puzzle.difficulty) }}>
            {getDifficultyLabel(puzzle.difficulty)}
          </span>
        </div>
        <div className="puzzle-progress">
          {userMoves.length} / {puzzle.solution.length}
        </div>
      </div>

      <div className="puzzle-board-wrapper">
        <Chessboard
          position={currentFen}
          boardOrientation={boardOrientation}
          onPieceDrop={onDrop}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
          customSquareStyles={getCustomSquareStyles()}
          customArrows={getArrows()}
        />
      </div>
    </div>
  );
};

// 辅助函数
function getPuzzleIcon(type: string): string {
  const icons: Record<string, string> = {
    fork: '⚔️',
    pin: '📌',
    skewer: '🔱',
    discovered: '⚡',
    double_attack: '🎯',
    deflection: '↪️',
    decoy: '🎣',
    zwischenzug: '⏭️',
    overload: '⚖️',
    xray: '🔭',
    clearance: '🧹',
    interference: '🚫',
    trapped_piece: '🪤',
    hanging_piece: '💀',
    weak_backrank: '🏰',
    mate_threat: '⚠️',
    promotion: '👑',
    en_passant: '⏩',
  };
  return icons[type] || '❓';
}

function getPuzzleTypeName(type: string): string {
  const names: Record<string, string> = {
    fork: '捉双',
    pin: '牵制',
    skewer: '串击',
    discovered: '闪击',
    double_attack: '双重攻击',
    deflection: '诱离',
    decoy: '引入',
    zwischenzug: '过渡',
    overload: '过载',
    xray: '穿刺',
    clearance: '清空',
    interference: '干扰',
    trapped_piece: '陷阱',
    hanging_piece: '悬兵',
    weak_backrank: '弱底线',
    mate_threat: '杀棋威胁',
    promotion: '升变战术',
    en_passant: '吃过路兵',
  };
  return names[type] || type;
}

function getDifficultyLabel(difficulty: number): string {
  const labels: Record<number, string> = {
    1: '入门',
    2: '初级',
    3: '中级',
    4: '高级',
    5: '专家',
  };
  return labels[difficulty] || `${difficulty}`;
}

function getDifficultyColor(difficulty: number): string {
  const colors: Record<number, string> = {
    1: '#22c55e',
    2: '#3b82f6',
    3: '#f59e0b',
    4: '#f97316',
    5: '#ef4444',
  };
  return colors[difficulty] || '#6c757d';
}

export default PuzzleBoard;
