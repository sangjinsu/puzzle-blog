'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { StageStatus } from '@/entities/stage';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

interface GameOverlayProps {
  status: StageStatus;
  onStart?: () => void;
  onRestart: () => void;
  onContinue?: () => void;
  onDecline?: () => void;
}

export function GameOverlay({ status, onStart, onRestart, onContinue, onDecline }: GameOverlayProps) {
  if (status === 'playing') return null;

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
            {status === 'ready' && (
              <>
                <span className="text-5xl">🧩</span>
                <h2 className="text-2xl font-bold text-foreground">
                  준비 완료!
                </h2>
                <p className="text-muted-foreground">
                  목표를 달성하여 스테이지를 클리어하세요.
                </p>
                <Button onClick={onStart}>
                  게임 시작
                </Button>
              </>
            )}
            {status === 'continue_prompt' && (
              <>
                <span className="text-5xl">🤔</span>
                <h2 className="text-2xl font-bold text-foreground">
                  이동을 모두 사용했습니다
                </h2>
                <p className="text-muted-foreground">
                  계속 플레이하시겠습니까?
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={onDecline}>
                    포기
                  </Button>
                  <Button onClick={onContinue}>
                    계속하기
                  </Button>
                </div>
              </>
            )}
            {status === 'cleared' && (
              <>
                <span className="text-5xl">🎉</span>
                <h2 className="text-2xl font-bold text-foreground">
                  게임 성공!
                </h2>
                <p className="text-muted-foreground">
                  축하합니다! 모든 목표를 달성했습니다.
                </p>
                <Button onClick={onRestart}>
                  다시 시도
                </Button>
              </>
            )}
            {status === 'failed' && (
              <>
                <span className="text-5xl">😢</span>
                <h2 className="text-2xl font-bold text-foreground">
                  게임 실패
                </h2>
                <p className="text-muted-foreground">
                  다시 도전해보세요!
                </p>
                <Button onClick={onRestart}>
                  다시 시도
                </Button>
              </>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
