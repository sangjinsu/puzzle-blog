import type { SequenceActor, SequenceMessage } from '@/widgets/infographic-viewer/model/types';
import type { CodeSnippet } from '@/widgets/code-viewer';

interface ApiSection {
  id: string;
  tabLabel: string;
  title: string;
  description: string;
  actors: SequenceActor[];
  messages: SequenceMessage[];
  codeSnippets: CodeSnippet[];
}

export interface GameFlowPageConfig {
  title: string;
  description: string;
  stageId: number;
  takeaways: string[];
  apiSections: ApiSection[];
}

const commonActors: SequenceActor[] = [
  { id: 'client', label: 'Client' },
  { id: 'server', label: 'Game Server' },
  { id: 'db', label: 'Database' },
];

export const gameFlowConfig: GameFlowPageConfig = {
  title: '게임 플로우',
  description:
    '캐주얼 게임의 핵심 루프를 구성하는 4가지 API — Start, Clear, Continue, Fail의 서버 처리 흐름을 살펴봅니다.',
  stageId: 1,
  takeaways: [
    '게임 세션은 로그인 시 생성되며, 시드(seed)값을 포함합니다.',
    '4가지 API(Start, Clear, Continue, Fail)가 게임 루프를 구성합니다.',
    'Start → Play → Clear 또는 Fail 순서로 진행되며, Continue는 실패 직전 추가 기회를 제공합니다.',
    '대부분의 API는 유저 상태, 재화, 이벤트(퀘스트·시즌 패스) 데이터를 함께 처리합니다.',
    '서버는 클라이언트의 요청을 검증한 뒤 DB에 반영하고, 결과를 응답합니다.',
  ],
  apiSections: [
    // ── 1. Game Start ──
    {
      id: 'start',
      tabLabel: 'Start',
      title: '1. 게임 스타트 API',
      description:
        '유저가 스테이지에 진입할 때 호출됩니다. 로그인 시 생성된 세션을 조회하고, 레디 아이템을 소모한 뒤 플레이 로그와 게임 유저 정보를 생성합니다.',
      actors: commonActors,
      messages: [
        { from: 'client', to: 'server', label: 'POST /api/game/start { stageId, readyItems }' },
        { from: 'server', to: 'db', label: 'SELECT game_session (userId)' },
        { from: 'db', to: 'server', label: 'session { seed }', isResponse: true },
        { from: 'server', to: 'server', label: '레디 아이템 검증 & 소모', isSelf: true },
        { from: 'server', to: 'db', label: 'INSERT play_log, user_stage; UPDATE user_items' },
        { from: 'db', to: 'server', label: 'OK', isResponse: true },
        { from: 'server', to: 'client', label: '200 { sessionId, seed, consumedItems }', isResponse: true },
      ],
      codeSnippets: [
        {
          language: 'go',
          label: 'Go',
          code: `func (s *GameService) StartGame(ctx context.Context, req StartRequest) (resp *StartResponse, err error) {
    tx, err := s.db.BeginTx(ctx, nil)
    if err != nil {
        return nil, err
    }
    defer func() {
        if err != nil { tx.Rollback() } else { tx.Commit() }
    }()

    session, err := s.repo.GetSessionByUser(ctx, tx, req.UserID)
    if err != nil {
        return nil, err
    }

    // 레디 아이템 검증 & 소모
    consumed, err := s.validateAndConsumeItems(ctx, tx, req.UserID, req.ReadyItems)
    if err != nil {
        return nil, err
    }

    // 플레이 로그 & 유저 스테이지 생성
    if err := s.repo.CreatePlayLog(ctx, tx, session.ID, req.StageID); err != nil {
        return nil, err
    }
    if err := s.repo.CreateUserStage(ctx, tx, req.UserID, req.StageID); err != nil {
        return nil, err
    }

    return &StartResponse{
        SessionID:     session.ID,
        Seed:          session.Seed,
        ConsumedItems: consumed,
    }, nil
}`,
        },
        {
          language: 'java',
          label: 'Java',
          code: `@Transactional
public StartResponse startGame(StartRequest request) {
    GameSession session = sessionRepo.findByUserId(request.getUserId())
        .orElseThrow(SessionNotFoundException::new);

    // 레디 아이템 검증 & 소모
    List<ConsumedItem> consumed = validateAndConsumeItems(
        request.getUserId(), request.getReadyItems());

    // 플레이 로그 & 게임 유저 정보 생성
    playLogRepo.save(new PlayLog(session.getId(), request.getStageId()));
    userStageRepo.save(new UserStage(request.getUserId(), request.getStageId()));

    return new StartResponse(
        session.getId(), session.getSeed(), consumed
    );
}`,
        },
        {
          language: 'python',
          label: 'Python',
          code: `class GameService:
    @transactional
    def start_game(self, user_id: str, stage_id: int, ready_items: list[str]) -> StartResponse:
        session = self.session_repo.get_by_user(user_id)
        if not session:
            raise SessionNotFoundError(user_id)

        # 레디 아이템 검증 & 소모
        consumed = self._validate_and_consume_items(user_id, ready_items)

        # 플레이 로그 & 유저 스테이지 생성
        self.play_log_repo.create(session.id, stage_id)
        self.user_stage_repo.create(user_id, stage_id)

        return StartResponse(
            session_id=session.id,
            seed=session.seed,
            consumed_items=consumed,
        )`,
        },
        {
          language: 'typescript',
          label: 'TypeScript',
          code: `export async function startGame(userId: string, stageId: number, readyItems: string[]): Promise<StartResponse> {
  return db.transaction(async (tx) => {
    const session = await sessionRepo.findByUserId(tx, userId);
    if (!session) throw new Error("Session not found");

    // 레디 아이템 검증 & 소모
    const consumed = await validateAndConsumeItems(tx, userId, readyItems);

    // 플레이 로그 & 유저 스테이지 생성
    await playLogRepo.create(tx, session.id, stageId);
    await userStageRepo.create(tx, userId, stageId);

    return {
      sessionId: session.id,
      seed: session.seed,
      consumedItems: consumed,
    };
  });
}`,
        },
      ],
    },

    // ── 2. Game Continue ──
    {
      id: 'continue',
      tabLabel: 'Continue',
      title: '2. 게임 컨티뉴 API',
      description:
        '이동 횟수를 모두 소진했지만 목표를 달성하지 못했을 때, 재화를 소모하여 추가 이동을 받는 API입니다. 재화를 차감하고 컨티뉴 이력을 유저 스테이지와 플레이 로그에 기록합니다.',
      actors: commonActors,
      messages: [
        { from: 'client', to: 'server', label: 'POST /api/game/continue { sessionId }' },
        { from: 'server', to: 'server', label: '재화 확인 & 차감', isSelf: true },
        { from: 'server', to: 'db', label: 'UPDATE currency, user_stage, play_log' },
        { from: 'db', to: 'server', label: 'OK', isResponse: true },
        { from: 'server', to: 'client', label: '200 { extraMoves, remainingCurrency }', isResponse: true },
      ],
      codeSnippets: [
        {
          language: 'go',
          label: 'Go',
          code: `func (s *GameService) ContinueGame(ctx context.Context, req ContinueRequest) (resp *ContinueResponse, err error) {
    tx, err := s.db.BeginTx(ctx, nil)
    if err != nil {
        return nil, err
    }
    defer func() {
        if err != nil { tx.Rollback() } else { tx.Commit() }
    }()

    session, err := s.repo.GetSession(ctx, tx, req.SessionID)
    if err != nil {
        return nil, err
    }

    // 재화 확인 & 차감
    userStage, err := s.repo.GetUserStage(ctx, tx, session.UserID, session.StageID)
    if err != nil {
        return nil, err
    }
    cost := getContinueCost(userStage.ContinueCount)
    currency, err := s.currencyRepo.Get(ctx, tx, session.UserID)
    if err != nil {
        return nil, err
    }
    if currency.Gems < cost {
        return nil, ErrInsufficientCurrency
    }
    currency.Gems -= cost

    // 컨티뉴 이력 기록
    extraMoves := 5
    userStage.ContinueCount++
    if err := s.repo.SaveUserStage(ctx, tx, userStage); err != nil {
        return nil, err
    }
    if err := s.repo.AppendPlayLog(ctx, tx, session.ID, "continue"); err != nil {
        return nil, err
    }
    if err := s.currencyRepo.Save(ctx, tx, currency); err != nil {
        return nil, err
    }

    return &ContinueResponse{
        ExtraMoves:        extraMoves,
        RemainingCurrency: currency.Gems,
    }, nil
}`,
        },
        {
          language: 'java',
          label: 'Java',
          code: `@Transactional
public ContinueResponse continueGame(ContinueRequest request) {
    GameSession session = sessionRepo.findById(request.getSessionId())
        .orElseThrow(SessionNotFoundException::new);

    // 재화 확인 & 차감
    UserStage userStage = userStageRepo.findByUserAndStage(
        session.getUserId(), session.getStageId());
    int cost = getContinueCost(userStage.getContinueCount());
    Currency currency = currencyRepo.findByUserId(session.getUserId());

    if (currency.getGems() < cost) {
        throw new InsufficientCurrencyException();
    }
    currency.deductGems(cost);

    // 컨티뉴 이력 기록
    int extraMoves = 5;
    userStage.incrementContinueCount();
    userStageRepo.save(userStage);
    playLogRepo.append(session.getId(), "continue");
    currencyRepo.save(currency);

    return new ContinueResponse(extraMoves, currency.getGems());
}`,
        },
        {
          language: 'python',
          label: 'Python',
          code: `class GameService:
    @transactional
    def continue_game(self, session_id: str) -> ContinueResponse:
        session = self.session_repo.get(session_id)
        if not session:
            raise SessionNotFoundError(session_id)

        # 재화 확인 & 차감
        user_stage = self.user_stage_repo.get(session.user_id, session.stage_id)
        cost = get_continue_cost(user_stage.continue_count)
        currency = self.currency_repo.get(session.user_id)

        if currency.gems < cost:
            raise InsufficientCurrencyError()
        currency.gems -= cost

        # 컨티뉴 이력 기록
        extra_moves = 5
        user_stage.continue_count += 1
        self.user_stage_repo.save(user_stage)
        self.play_log_repo.append(session.id, "continue")
        self.currency_repo.save(currency)

        return ContinueResponse(
            extra_moves=extra_moves,
            remaining_currency=currency.gems,
        )`,
        },
        {
          language: 'typescript',
          label: 'TypeScript',
          code: `export async function continueGame(sessionId: string): Promise<ContinueResponse> {
  return db.transaction(async (tx) => {
    const session = await sessionRepo.findById(tx, sessionId);
    if (!session) throw new Error("Session not found");

    // 재화 확인 & 차감
    const userStage = await userStageRepo.findByUserAndStage(tx, session.userId, session.stageId);
    const cost = getContinueCost(userStage.continueCount);
    const currency = await currencyRepo.findByUserId(tx, session.userId);

    if (currency.gems < cost) {
      throw new InsufficientCurrencyError();
    }
    currency.gems -= cost;

    // 컨티뉴 이력 기록
    const extraMoves = 5;
    userStage.continueCount += 1;
    await userStageRepo.save(tx, userStage);
    await playLogRepo.append(tx, session.id, "continue");
    await currencyRepo.save(tx, currency);

    return { extraMoves, remainingCurrency: currency.gems };
  });
}`,
        },
      ],
    },

    // ── 3. Game Clear ──
    {
      id: 'clear',
      tabLabel: 'Clear',
      title: '3. 게임 클리어 API',
      description:
        '스테이지 목표를 달성하면 호출됩니다. 클리어 조건을 검증하고, 진행도를 갱신합니다. 첫 클리어 여부를 확인한 뒤 퀘스트 진행과 시즌 패스 XP를 함께 처리합니다.',
      actors: commonActors,
      messages: [
        { from: 'client', to: 'server', label: 'POST /api/game/clear { sessionId, score }' },
        { from: 'server', to: 'server', label: '클리어 조건 검증', isSelf: true },
        { from: 'server', to: 'db', label: 'UPDATE stage_progress (clear count, first clear)' },
        { from: 'db', to: 'server', label: 'OK', isResponse: true },
        { from: 'server', to: 'server', label: '퀘스트 & 시즌 패스 처리', isSelf: true },
        { from: 'server', to: 'db', label: 'UPDATE quest_progress, season_pass' },
        { from: 'db', to: 'server', label: 'OK', isResponse: true },
        { from: 'server', to: 'client', label: '200 { rewards, questProgress, seasonPassXP }', isResponse: true },
      ],
      codeSnippets: [
        {
          language: 'go',
          label: 'Go',
          code: `func (s *GameService) ClearGame(ctx context.Context, req ClearRequest) (*ClearResponse, error) {
    session, err := s.repo.GetSession(ctx, req.SessionID)
    if err != nil {
        return nil, err
    }

    // 클리어 조건 검증
    if !session.ObjectivesMet() {
        return nil, ErrObjectivesNotMet
    }

    // 진행도 갱신 & 첫 클리어 체크
    progress, err := s.repo.GetProgress(ctx, session.UserID, session.StageID)
    if err != nil {
        return nil, err
    }
    isFirstClear := progress.ClearCount == 0
    progress.ClearCount++
    rewards := calculateRewards(session.StageID, req.Score, isFirstClear)

    // 퀘스트 & 시즌 패스 처리
    questResult := s.questService.OnStageClear(ctx, session.UserID, session.StageID)
    passResult := s.seasonPass.AddXP(ctx, session.UserID, rewards.XP)

    if err := s.repo.SaveProgress(ctx, progress); err != nil {
        return nil, err
    }

    return &ClearResponse{
        Rewards:       rewards,
        QuestProgress: questResult,
        SeasonPassXP:  passResult,
    }, nil
}`,
        },
        {
          language: 'java',
          label: 'Java',
          code: `@Transactional
public ClearResponse clearGame(ClearRequest request) {
    GameSession session = sessionRepo.findById(request.getSessionId())
        .orElseThrow(SessionNotFoundException::new);

    // 클리어 조건 검증
    if (!session.objectivesMet()) {
        throw new ObjectivesNotMetException();
    }

    // 진행도 갱신 & 첫 클리어 체크
    StageProgress progress = progressRepo
        .findByUserAndStage(session.getUserId(), session.getStageId());
    boolean isFirstClear = progress.getClearCount() == 0;
    progress.incrementClearCount();
    Rewards rewards = RewardCalculator.calculate(
        session.getStageId(), request.getScore(), isFirstClear);

    // 퀘스트 & 시즌 패스 처리
    QuestResult questResult = questService
        .onStageClear(session.getUserId(), session.getStageId());
    PassResult passResult = seasonPassService
        .addXP(session.getUserId(), rewards.getXp());

    progressRepo.save(progress);

    return new ClearResponse(rewards, questResult, passResult);
}`,
        },
        {
          language: 'python',
          label: 'Python',
          code: `class GameService:
    def clear_game(self, session_id: str, score: int) -> ClearResponse:
        session = self.session_repo.get(session_id)
        if not session:
            raise SessionNotFoundError(session_id)

        # 클리어 조건 검증
        if not session.objectives_met():
            raise ObjectivesNotMetError()

        # 진행도 갱신 & 첫 클리어 체크
        progress = self.progress_repo.get(session.user_id, session.stage_id)
        is_first_clear = progress.clear_count == 0
        progress.clear_count += 1
        rewards = calculate_rewards(session.stage_id, score, is_first_clear)

        # 퀘스트 & 시즌 패스 처리
        quest_result = self.quest_service.on_stage_clear(
            session.user_id, session.stage_id)
        pass_result = self.season_pass.add_xp(session.user_id, rewards.xp)

        self.progress_repo.save(progress)

        return ClearResponse(
            rewards=rewards,
            quest_progress=quest_result,
            season_pass_xp=pass_result,
        )`,
        },
        {
          language: 'typescript',
          label: 'TypeScript',
          code: `export async function clearGame(sessionId: string, score: number): Promise<ClearResponse> {
  const session = await sessionRepo.findById(sessionId);
  if (!session) throw new Error("Session not found");

  // 클리어 조건 검증
  if (!session.objectivesMet()) {
    throw new ObjectivesNotMetError();
  }

  // 진행도 갱신 & 첫 클리어 체크
  const progress = await progressRepo.findByUserAndStage(session.userId, session.stageId);
  const isFirstClear = progress.clearCount === 0;
  progress.clearCount += 1;
  const rewards = calculateRewards(session.stageId, score, isFirstClear);

  // 퀘스트 & 시즌 패스 처리
  const questResult = await questService.onStageClear(session.userId, session.stageId);
  const passResult = await seasonPass.addXP(session.userId, rewards.xp);

  await progressRepo.save(progress);

  return { rewards, questProgress: questResult, seasonPassXP: passResult };
}`,
        },
      ],
    },

    // ── 4. Game Fail ──
    {
      id: 'fail',
      tabLabel: 'Fail',
      title: '4. 게임 실패 API',
      description:
        '컨티뉴를 거부하거나 재화가 부족할 때 호출됩니다. 유저 스테이지의 실패 카운트를 증가시키고 플레이 로그에 기록합니다.',
      actors: commonActors,
      messages: [
        { from: 'client', to: 'server', label: 'POST /api/game/fail { sessionId }' },
        { from: 'server', to: 'db', label: 'UPDATE user_stage (failCount++), play_log' },
        { from: 'db', to: 'server', label: 'OK', isResponse: true },
        { from: 'server', to: 'client', label: '200 { success: true }', isResponse: true },
      ],
      codeSnippets: [
        {
          language: 'go',
          label: 'Go',
          code: `func (s *GameService) FailGame(ctx context.Context, req FailRequest) (resp *FailResponse, err error) {
    tx, err := s.db.BeginTx(ctx, nil)
    if err != nil {
        return nil, err
    }
    defer func() {
        if err != nil { tx.Rollback() } else { tx.Commit() }
    }()

    session, err := s.repo.GetSession(ctx, tx, req.SessionID)
    if err != nil {
        return nil, err
    }

    // 실패 카운트 증가 & 로그 기록
    userStage, err := s.repo.GetUserStage(ctx, tx, session.UserID, session.StageID)
    if err != nil {
        return nil, err
    }
    userStage.FailCount++
    if err := s.repo.SaveUserStage(ctx, tx, userStage); err != nil {
        return nil, err
    }
    if err := s.repo.AppendPlayLog(ctx, tx, session.ID, "fail"); err != nil {
        return nil, err
    }

    return &FailResponse{Success: true}, nil
}`,
        },
        {
          language: 'java',
          label: 'Java',
          code: `@Transactional
public FailResponse failGame(FailRequest request) {
    GameSession session = sessionRepo.findById(request.getSessionId())
        .orElseThrow(SessionNotFoundException::new);

    // 실패 카운트 증가 & 로그 기록
    UserStage userStage = userStageRepo.findByUserAndStage(
        session.getUserId(), session.getStageId());
    userStage.incrementFailCount();
    userStageRepo.save(userStage);
    playLogRepo.append(session.getId(), "fail");

    return new FailResponse(true);
}`,
        },
        {
          language: 'python',
          label: 'Python',
          code: `class GameService:
    @transactional
    def fail_game(self, session_id: str) -> FailResponse:
        session = self.session_repo.get(session_id)
        if not session:
            raise SessionNotFoundError(session_id)

        # 실패 카운트 증가 & 로그 기록
        user_stage = self.user_stage_repo.get(session.user_id, session.stage_id)
        user_stage.fail_count += 1
        self.user_stage_repo.save(user_stage)
        self.play_log_repo.append(session.id, "fail")

        return FailResponse(success=True)`,
        },
        {
          language: 'typescript',
          label: 'TypeScript',
          code: `export async function failGame(sessionId: string): Promise<FailResponse> {
  return db.transaction(async (tx) => {
    const session = await sessionRepo.findById(tx, sessionId);
    if (!session) throw new Error("Session not found");

    // 실패 카운트 증가 & 로그 기록
    const userStage = await userStageRepo.findByUserAndStage(tx, session.userId, session.stageId);
    userStage.failCount += 1;
    await userStageRepo.save(tx, userStage);
    await playLogRepo.append(tx, session.id, "fail");

    return { success: true };
  });
}`,
        },
      ],
    },
  ],
};
