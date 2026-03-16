import type { GameFlowPageConfig } from '@/views/content/game-flow/model/config';
import type { ComparisonGame } from '@/views/content/model/types';

export interface LifePageConfig extends GameFlowPageConfig {
  comparison: {
    features: string[];
    games: ComparisonGame[];
  };
}

const commonActors = [
  { id: 'client', label: 'Client' },
  { id: 'server', label: 'Game Server' },
  { id: 'db', label: 'Database' },
];

export const lifeConfig: LifePageConfig = {
  title: '라이프 시스템',
  description:
    '퍼즐 게임의 핵심 자원인 라이프의 회복, 소모, 시간제 라이프 관리를 위한 서버 처리 흐름을 살펴봅니다.',
  stageId: 1,
  takeaways: [
    '라이프는 두 종류: 시간 기반 회복되는 일반 라이프와, 이벤트/선물로 받는 시간제 라이프가 있습니다.',
    '시간제 라이프가 있으면 일반 라이프보다 먼저 소모됩니다.',
    '라이프 회복은 서버에서 lastRecoveryAt 기준으로 검증하여 시간 조작을 방지합니다.',
    'max 라이프 값은 세션에서 가져오며, max 상태에서 회복 요청이 오면 서버가 거부합니다.',
    '게임 시작(Start API) 시 라이프 소모가 함께 처리되어야 합니다.',
  ],
  apiSections: [
    // ── 1. Recovery ──
    {
      id: 'recover',
      tabLabel: '회복',
      title: '1. 라이프 회복 API',
      description:
        '클라이언트가 시간 경과를 확인한 뒤 호출합니다. 서버는 lastRecoveryAt를 기준으로 회복 가능량을 계산하고, max를 초과하지 않도록 검증합니다.',
      actors: commonActors,
      messages: [
        { from: 'client', to: 'server', label: 'POST /api/life/recover { userId }' },
        { from: 'server', to: 'db', label: 'SELECT game_session (userId)' },
        { from: 'db', to: 'server', label: 'session { maxLife }', isResponse: true },
        { from: 'server', to: 'db', label: 'SELECT user_life (userId)' },
        { from: 'db', to: 'server', label: 'userLife { current, lastRecoveryAt }', isResponse: true },
        { from: 'server', to: 'server', label: '시간제 라이프 확인', isSelf: true },
        { from: 'server', to: 'server', label: '회복 가능량 계산 (now - lastRecoveryAt)', isSelf: true },
        { from: 'server', to: 'server', label: 'max 초과 검증', isSelf: true },
        { from: 'server', to: 'db', label: 'UPDATE user_life (current, lastRecoveryAt)' },
        { from: 'db', to: 'server', label: 'OK', isResponse: true },
        { from: 'server', to: 'client', label: '200 { current, max }', isResponse: true },
      ],
      codeSnippets: [
        {
          language: 'go',
          label: 'Go',
          code: `func (s *LifeService) RecoverLife(ctx context.Context, userID string) (resp *RecoverResponse, err error) {
    tx, err := s.db.BeginTx(ctx, nil)
    if err != nil {
        return nil, err
    }
    defer func() {
        if err != nil { tx.Rollback() } else { tx.Commit() }
    }()

    session, err := s.repo.GetSessionByUser(ctx, tx, userID)
    if err != nil {
        return nil, err
    }

    life, err := s.repo.GetUserLife(ctx, tx, userID)
    if err != nil {
        return nil, err
    }

    // 시간제 라이프가 있으면 회복 불필요
    timedCount, err := s.repo.CountActiveTimed(ctx, tx, userID)
    if err != nil {
        return nil, err
    }
    if timedCount > 0 {
        return &RecoverResponse{Current: life.Current, Max: session.MaxLife}, nil
    }

    // lastRecoveryAt 기준 회복 가능량 계산
    elapsed := time.Since(life.LastRecoveryAt)
    recoverable := int(elapsed / RecoveryInterval)
    if recoverable <= 0 {
        return &RecoverResponse{Current: life.Current, Max: session.MaxLife}, nil
    }

    // max 초과 검증
    if life.Current >= session.MaxLife {
        return nil, ErrAlreadyMaxLife
    }

    life.Current = min(life.Current+recoverable, session.MaxLife)
    life.LastRecoveryAt = life.LastRecoveryAt.Add(
        time.Duration(recoverable) * RecoveryInterval,
    )
    if err := s.repo.SaveUserLife(ctx, tx, life); err != nil {
        return nil, err
    }

    return &RecoverResponse{Current: life.Current, Max: session.MaxLife}, nil
}`,
        },
        {
          language: 'java',
          label: 'Java',
          code: `@Transactional
public RecoverResponse recoverLife(String userId) {
    GameSession session = sessionRepo.findByUserId(userId)
        .orElseThrow(SessionNotFoundException::new);
    UserLife life = lifeRepo.findByUserId(userId)
        .orElseThrow(UserNotFoundException::new);

    // 시간제 라이프가 있으면 회복 불필요
    int timedCount = timedLifeRepo.countActive(userId);
    if (timedCount > 0) {
        return new RecoverResponse(life.getCurrent(), session.getMaxLife());
    }

    // lastRecoveryAt 기준 회복 가능량 계산
    Duration elapsed = Duration.between(life.getLastRecoveryAt(), Instant.now());
    int recoverable = (int) (elapsed.toMinutes() / RECOVERY_MINUTES);
    if (recoverable <= 0) {
        return new RecoverResponse(life.getCurrent(), session.getMaxLife());
    }

    // max 초과 검증
    if (life.getCurrent() >= session.getMaxLife()) {
        throw new AlreadyMaxLifeException();
    }

    int newLife = Math.min(life.getCurrent() + recoverable, session.getMaxLife());
    life.setCurrent(newLife);
    life.setLastRecoveryAt(
        life.getLastRecoveryAt().plus(Duration.ofMinutes((long) recoverable * RECOVERY_MINUTES))
    );
    lifeRepo.save(life);

    return new RecoverResponse(newLife, session.getMaxLife());
}`,
        },
        {
          language: 'python',
          label: 'Python',
          code: `class LifeService:
    @transactional
    def recover_life(self, user_id: str) -> RecoverResponse:
        session = self.session_repo.get_by_user(user_id)
        life = self.life_repo.get(user_id)
        if not life:
            raise UserNotFoundError(user_id)

        # 시간제 라이프가 있으면 회복 불필요
        timed_count = self.timed_life_repo.count_active(user_id)
        if timed_count > 0:
            return RecoverResponse(current=life.current, max=session.max_life)

        # lastRecoveryAt 기준 회복 가능량 계산
        elapsed = datetime.now() - life.last_recovery_at
        recoverable = int(elapsed.total_seconds() // RECOVERY_SECONDS)
        if recoverable <= 0:
            return RecoverResponse(current=life.current, max=session.max_life)

        # max 초과 검증
        if life.current >= session.max_life:
            raise AlreadyMaxLifeError()

        new_life = min(life.current + recoverable, session.max_life)
        life.current = new_life
        life.last_recovery_at += timedelta(seconds=recoverable * RECOVERY_SECONDS)
        self.life_repo.save(life)

        return RecoverResponse(current=new_life, max=session.max_life)`,
        },
        {
          language: 'typescript',
          label: 'TypeScript',
          code: `export async function recoverLife(userId: string): Promise<RecoverResponse> {
  return db.transaction(async (tx) => {
    const session = await sessionRepo.findByUserId(tx, userId);
    if (!session) throw new Error("Session not found");

    const life = await lifeRepo.findByUserId(tx, userId);
    if (!life) throw new Error("User not found");

    // 시간제 라이프가 있으면 회복 불필요
    const timedCount = await timedLifeRepo.countActive(tx, userId);
    if (timedCount > 0) {
      return { current: life.current, max: session.maxLife };
    }

    // lastRecoveryAt 기준 회복 가능량 계산
    const elapsed = Date.now() - life.lastRecoveryAt.getTime();
    const recoverable = Math.floor(elapsed / RECOVERY_MS);
    if (recoverable <= 0) {
      return { current: life.current, max: session.maxLife };
    }

    // max 초과 검증
    if (life.current >= session.maxLife) {
      throw new AlreadyMaxLifeError();
    }

    life.current = Math.min(life.current + recoverable, session.maxLife);
    life.lastRecoveryAt = new Date(
      life.lastRecoveryAt.getTime() + recoverable * RECOVERY_MS,
    );
    await lifeRepo.save(tx, life);

    return { current: life.current, max: session.maxLife };
  });
}`,
        },
      ],
    },

    // ── 2. Consume ──
    {
      id: 'consume',
      tabLabel: '소모',
      title: '2. 라이프 소모 로직',
      description:
        '게임 스타트(Start API) 내부에서 호출되는 라이프 소모 로직입니다. Start API의 트랜잭션 안에서 실행되며, 시간제 라이프가 활성 상태이면 소모를 생략하고, 없으면 일반 라이프를 1 차감합니다.',
      actors: commonActors,
      messages: [
        { from: 'client', to: 'server', label: 'POST /api/game/start { stageId }' },
        { from: 'server', to: 'server', label: 'ConsumeLife(userId) 호출', isSelf: true },
        { from: 'server', to: 'db', label: 'SELECT user_life, timed_life (userId)' },
        { from: 'db', to: 'server', label: 'userLife { current }, timedLives', isResponse: true },
        { from: 'server', to: 'server', label: '시간제 라이프 활성 확인 (만료 전이면 소모 생략)', isSelf: true },
        { from: 'server', to: 'db', label: 'UPDATE user_life (시간제 없을 때만)' },
        { from: 'db', to: 'server', label: 'OK', isResponse: true },
      ],
      codeSnippets: [
        {
          language: 'go',
          label: 'Go',
          code: `// Start API 트랜잭션 내부에서 호출
func (s *LifeService) ConsumeLife(ctx context.Context, tx *sql.Tx, userID string) error {
    life, err := s.repo.GetUserLife(ctx, tx, userID)
    if err != nil {
        return err
    }

    // 시간제 라이프 활성 확인 (만료 전이면 소모 생략)
    hasActive, err := s.repo.HasActiveTimed(ctx, tx, userID)
    if err != nil {
        return err
    }
    if hasActive {
        return nil
    }

    // 일반 라이프 차감
    if life.Current <= 0 {
        return ErrInsufficientLife
    }
    life.Current--
    return s.repo.SaveUserLife(ctx, tx, life)
}`,
        },
        {
          language: 'java',
          label: 'Java',
          code: `// Start API의 @Transactional 안에서 호출
public void consumeLife(String userId) {
    UserLife life = lifeRepo.findByUserId(userId)
        .orElseThrow(UserNotFoundException::new);

    // 시간제 라이프 활성 확인 (만료 전이면 소모 생략)
    boolean hasActive = timedLifeRepo.existsActive(userId);
    if (hasActive) {
        return;
    }

    // 일반 라이프 차감
    if (life.getCurrent() <= 0) {
        throw new InsufficientLifeException();
    }
    life.decrementCurrent();
    lifeRepo.save(life);
}`,
        },
        {
          language: 'python',
          label: 'Python',
          code: `class LifeService:
    # Start API의 @transactional 안에서 호출
    def consume_life(self, user_id: str) -> None:
        life = self.life_repo.get(user_id)
        if not life:
            raise UserNotFoundError(user_id)

        # 시간제 라이프 활성 확인 (만료 전이면 소모 생략)
        has_active = self.timed_life_repo.has_active(user_id)
        if has_active:
            return

        # 일반 라이프 차감
        if life.current <= 0:
            raise InsufficientLifeError()
        life.current -= 1
        self.life_repo.save(life)`,
        },
        {
          language: 'typescript',
          label: 'TypeScript',
          code: `// Start API의 db.transaction 안에서 호출
export async function consumeLife(tx: Transaction, userId: string): Promise<void> {
  const life = await lifeRepo.findByUserId(tx, userId);
  if (!life) throw new Error("User not found");

  // 시간제 라이프 활성 확인 (만료 전이면 소모 생략)
  const hasActive = await timedLifeRepo.hasActive(tx, userId);
  if (hasActive) {
    return;
  }

  // 일반 라이프 차감
  if (life.current <= 0) {
    throw new InsufficientLifeError();
  }
  life.current -= 1;
  await lifeRepo.save(tx, life);
}`,
        },
      ],
    },

    // ── 3. Time-Limited ──
    {
      id: 'timed',
      tabLabel: '시간제',
      title: '3. 시간제 라이프 API',
      description:
        '이벤트 보상이나 선물로 시간제 라이프를 부여하고, 라이프 상태를 조회합니다. 테이블 기본값은 0이므로 부여 시 UPDATE를 사용합니다.',
      actors: commonActors,
      messages: [
        { from: 'client', to: 'server', label: 'POST /api/life/grant-timed { userId, duration }' },
        { from: 'server', to: 'db', label: 'UPDATE timed_life SET expiresAt (userId)' },
        { from: 'db', to: 'server', label: 'OK', isResponse: true },
        { from: 'server', to: 'client', label: '200 { success: true }', isResponse: true },
        { from: 'client', to: 'server', label: 'GET /api/life/status { userId }' },
        { from: 'server', to: 'db', label: 'SELECT game_session (userId)' },
        { from: 'db', to: 'server', label: 'session { maxLife }', isResponse: true },
        { from: 'server', to: 'db', label: 'SELECT user_life (userId)' },
        { from: 'db', to: 'server', label: 'userLife { current, timedLifeExpiresAt }', isResponse: true },
        { from: 'server', to: 'client', label: '200 { current, max, timedLife }', isResponse: true },
      ],
      codeSnippets: [
        {
          language: 'go',
          label: 'Go',
          code: `func (s *LifeService) GrantTimedLife(
    ctx context.Context, userID string, duration time.Duration,
) error {
    expiresAt := time.Now().Add(duration)
    return s.repo.UpdateTimedLife(ctx, userID, expiresAt)
}

func (s *LifeService) GetLifeStatus(ctx context.Context, userID string) (*LifeStatus, error) {
    session, err := s.repo.GetSessionByUser(ctx, nil, userID)
    if err != nil {
        return nil, err
    }

    life, err := s.repo.GetUserLife(ctx, nil, userID)
    if err != nil {
        return nil, err
    }

    return &LifeStatus{
        Current:   life.Current,
        Max:       session.MaxLife,
        TimedLife: life.TimedLifeExpiresAt,
    }, nil
}`,
        },
        {
          language: 'java',
          label: 'Java',
          code: `@Transactional
public void grantTimedLife(String userId, Duration duration) {
    Instant expiresAt = Instant.now().plus(duration);
    timedLifeRepo.updateExpiresAt(userId, expiresAt);
}

@Transactional
public LifeStatus getLifeStatus(String userId) {
    GameSession session = sessionRepo.findByUserId(userId)
        .orElseThrow(SessionNotFoundException::new);
    UserLife life = lifeRepo.findByUserId(userId)
        .orElseThrow(UserNotFoundException::new);

    return new LifeStatus(life.getCurrent(), session.getMaxLife(), life.getTimedLifeExpiresAt());
}`,
        },
        {
          language: 'python',
          label: 'Python',
          code: `class LifeService:
    @transactional
    def grant_timed_life(
        self, user_id: str, duration: timedelta,
    ) -> None:
        expires_at = datetime.now() + duration
        self.timed_life_repo.update_expires_at(user_id, expires_at)

    @transactional
    def get_life_status(self, user_id: str) -> LifeStatus:
        session = self.session_repo.get_by_user(user_id)
        life = self.life_repo.get(user_id)
        if not life:
            raise UserNotFoundError(user_id)

        return LifeStatus(
            current=life.current,
            max=session.max_life,
            timed_life=life.timed_life_expires_at,
        )`,
        },
        {
          language: 'typescript',
          label: 'TypeScript',
          code: `export async function grantTimedLife(
  userId: string, durationMs: number,
): Promise<void> {
  const expiresAt = new Date(Date.now() + durationMs);
  await timedLifeRepo.updateExpiresAt(userId, expiresAt);
}

export async function getLifeStatus(userId: string): Promise<LifeStatus> {
  const session = await sessionRepo.findByUserId(userId);
  if (!session) throw new Error("Session not found");

  const life = await lifeRepo.findByUserId(userId);
  if (!life) throw new Error("User not found");

  return { current: life.current, max: session.maxLife, timedLife: life.timedLifeExpiresAt };
}`,
        },
      ],
    },

    // ── 4. Charge ──
    {
      id: 'charge',
      tabLabel: '충전',
      title: '4. 라이프 충전 로직',
      description:
        '아이템 수령, 보상 지급 등 다른 API 내부에서 호출되는 라이프 충전 서비스입니다. 시간 기반 회복과 달리 max를 초과할 수 있습니다.',
      actors: commonActors,
      messages: [
        { from: 'client', to: 'server', label: '보상/아이템 API 호출' },
        { from: 'server', to: 'server', label: 'ChargeLife(userId, amount) 호출', isSelf: true },
        { from: 'server', to: 'db', label: 'SELECT user_life (userId)' },
        { from: 'db', to: 'server', label: 'userLife { current }', isResponse: true },
        { from: 'server', to: 'server', label: '라이프 충전 (max 초과 가능)', isSelf: true },
        { from: 'server', to: 'db', label: 'UPDATE user_life (current)' },
        { from: 'db', to: 'server', label: 'OK', isResponse: true },
      ],
      codeSnippets: [
        {
          language: 'go',
          label: 'Go',
          code: `// 다른 API 트랜잭션 내부에서 호출
func (s *LifeService) ChargeLife(ctx context.Context, tx *sql.Tx, userID string, amount int) error {
    life, err := s.repo.GetUserLife(ctx, tx, userID)
    if err != nil {
        return err
    }

    // 라이프 충전 (max 초과 가능)
    life.Current += amount
    return s.repo.SaveUserLife(ctx, tx, life)
}`,
        },
        {
          language: 'java',
          label: 'Java',
          code: `// 다른 API의 @Transactional 안에서 호출
public void chargeLife(String userId, int amount) {
    UserLife life = lifeRepo.findByUserId(userId)
        .orElseThrow(UserNotFoundException::new);

    // 라이프 충전 (max 초과 가능)
    life.addCurrent(amount);
    lifeRepo.save(life);
}`,
        },
        {
          language: 'python',
          label: 'Python',
          code: `class LifeService:
    # 다른 API의 @transactional 안에서 호출
    def charge_life(self, user_id: str, amount: int) -> None:
        life = self.life_repo.get(user_id)
        if not life:
            raise UserNotFoundError(user_id)

        # 라이프 충전 (max 초과 가능)
        life.current += amount
        self.life_repo.save(life)`,
        },
        {
          language: 'typescript',
          label: 'TypeScript',
          code: `// 다른 API의 db.transaction 안에서 호출
export async function chargeLife(tx: Transaction, userId: string, amount: number): Promise<void> {
  const life = await lifeRepo.findByUserId(tx, userId);
  if (!life) throw new Error("User not found");

  // 라이프 충전 (max 초과 가능)
  life.current += amount;
  await lifeRepo.save(tx, life);
}`,
        },
      ],
    },
  ],
  comparison: {
    features: [],
    games: [],
  },
};
