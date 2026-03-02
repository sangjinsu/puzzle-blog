'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

interface GameOverlayProps {
  status: 'playing' | 'cleared' | 'failed';
  onRestart: () => void;
  onNextStage?: () => void;
  onStageSelect: () => void;
}

export function GameOverlay({ status, onRestart, onNextStage, onStageSelect }: GameOverlayProps) {
  if (status === 'playing') return null;

  const isCleared = status === 'cleared';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 rounded-xl"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
        >
          <Card className="flex flex-col items-center gap-4 p-8">
            <span className="text-5xl">{isCleared ? '🎉' : '😢'}</span>
            <h2 className="text-2xl font-bold text-foreground">
              {isCleared ? '스테이지 클리어!' : '실패...'}
            </h2>
            <p className="text-muted-foreground">
              {isCleared
                ? '축하합니다! 모든 목표를 달성했습니다.'
                : '이동 횟수를 모두 사용했습니다.'}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onRestart}>
                다시 시도
              </Button>
              {isCleared && onNextStage && (
                <Button onClick={onNextStage}>
                  다음 스테이지
                </Button>
              )}
              <Button variant="secondary" onClick={onStageSelect}>
                스테이지 선택
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
