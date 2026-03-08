import type { ContentPageConfig } from '@/views/content/model/types';
import type { CodeSnippet } from '@/widgets/code-viewer';

const codeSnippets: CodeSnippet[] = [
  {
    language: 'go',
    label: 'Go',
    code: `// HandleSwap processes a tile swap request
func (s *GameService) HandleSwap(ctx context.Context, req SwapRequest) (*SwapResponse, error) {
    session, err := s.sessions.Get(ctx, req.SessionID)
    if err != nil {
        return nil, fmt.Errorf("session not found: %w", err)
    }

    // Validate swap is adjacent
    if !isAdjacent(req.From, req.To) {
        return nil, ErrInvalidSwap
    }

    // Execute swap and detect matches
    board := session.Board
    board.Swap(req.From, req.To)

    matches := detectMatches(board)
    if len(matches) == 0 {
        board.Swap(req.From, req.To) // revert
        return nil, ErrNoMatch
    }

    // Process cascades
    result := processCascades(board, matches)

    // Update session
    session.Board = result.Board
    session.MovesLeft--
    session.Score += result.Score

    if err := s.sessions.Save(ctx, session); err != nil {
        return nil, err
    }

    return &SwapResponse{
        Board:   result.Board,
        Removed: result.AllRemoved,
        Items:   result.GeneratedItems,
        Score:   session.Score,
    }, nil
}`,
  },
  {
    language: 'java',
    label: 'Java',
    code: `// GameService.java - Swap 처리
@Service
public class GameService {

    @Transactional
    public SwapResponse handleSwap(SwapRequest request) {
        GameSession session = sessionRepo
            .findById(request.getSessionId())
            .orElseThrow(() -> new SessionNotFoundException());

        Position from = request.getFrom();
        Position to = request.getTo();

        if (!Position.isAdjacent(from, to)) {
            throw new InvalidSwapException("Not adjacent");
        }

        Board board = session.getBoard();
        board.swap(from, to);

        List<MatchResult> matches = matchDetector.detect(board);
        if (matches.isEmpty()) {
            board.swap(from, to); // revert
            throw new NoMatchException();
        }

        // Process all cascades
        CascadeResult result = cascadeProcessor.process(board, matches);

        session.setBoard(result.getBoard());
        session.decrementMoves();
        session.addScore(result.getScore());
        sessionRepo.save(session);

        return new SwapResponse(
            result.getBoard(),
            result.getAllRemoved(),
            result.getGeneratedItems(),
            session.getScore()
        );
    }
}`,
  },
  {
    language: 'python',
    label: 'Python',
    code: `# game_service.py - Swap 처리
class GameService:
    def handle_swap(self, session_id: str, from_pos: Position, to_pos: Position) -> SwapResponse:
        session = self.session_repo.get(session_id)
        if not session:
            raise SessionNotFoundError(session_id)

        if not is_adjacent(from_pos, to_pos):
            raise InvalidSwapError("Tiles are not adjacent")

        board = session.board
        board.swap(from_pos, to_pos)

        matches = detect_matches(board)
        if not matches:
            board.swap(from_pos, to_pos)  # revert
            raise NoMatchError()

        # Process cascades until stable
        result = process_cascades(board, matches)

        # Update session state
        session.board = result.board
        session.moves_left -= 1
        session.score += result.score
        self.session_repo.save(session)

        return SwapResponse(
            board=result.board,
            removed=result.all_removed,
            items=result.generated_items,
            score=session.score,
        )`,
  },
  {
    language: 'typescript',
    label: 'TypeScript',
    code: `// gameService.ts - Swap 처리
export async function handleSwap(
  sessionId: string,
  from: Position,
  to: Position
): Promise<SwapResponse> {
  const session = await sessionRepo.findById(sessionId);
  if (!session) throw new Error("Session not found");

  if (!isAdjacent(from, to)) {
    throw new InvalidSwapError("Not adjacent");
  }

  const board = structuredClone(session.board);
  swapTiles(board, from, to);

  const matches = detectMatches(board);
  if (matches.length === 0) {
    swapTiles(board, from, to); // revert
    throw new NoMatchError();
  }

  // Process cascades
  const result = processCascades(board, matches);

  // Persist
  session.board = result.board;
  session.movesLeft -= 1;
  session.score += result.score;
  await sessionRepo.save(session);

  return {
    board: result.board,
    removed: result.allRemoved,
    items: result.generatedItems,
    score: session.score,
  };
}`,
  },
];

export const gameFlowConfig: ContentPageConfig = {
  title: '게임 플로우',
  description: '3매치 퍼즐의 핵심 게임 루프: 스왑 요청부터 캐스케이드 처리, 점수 계산까지의 전체 흐름을 살펴봅니다.',
  stageId: 1,
  codeSnippets,
  comparison: {
    features: [
      '스왑 방식',
      '매치 판정',
      '캐스케이드',
      '아이템 생성',
      '이동 제한',
      '목표 시스템',
    ],
    games: [
      {
        name: '로얄매치',
        features: {
          '스왑 방식': '인접 타일 스왑',
          '매치 판정': '3+ 일직선, 2×2, T/L',
          '캐스케이드': '무제한 연쇄',
          '아이템 생성': '로켓, TNT, 프로펠러',
          '이동 제한': '이동 횟수',
          '목표 시스템': '색상 수집, 장애물 제거',
        },
      },
      {
        name: '포코포코',
        features: {
          '스왑 방식': '인접 타일 스왑',
          '매치 판정': '3+ 일직선, 2×2',
          '캐스케이드': '무제한 연쇄',
          '아이템 생성': '폭탄, 레인보우',
          '이동 제한': '이동 횟수',
          '목표 시스템': '색상 수집, 잡초 제거',
        },
      },
      {
        name: '포코팡타운',
        features: {
          '스왑 방식': '터치 드래그 연결',
          '매치 판정': '3+ 동일 블록 연결',
          '캐스케이드': '연쇄 가능',
          '아이템 생성': '폭탄, 라인 클리어',
          '이동 제한': '이동 횟수',
          '목표 시스템': '색상 수집, 구출',
        },
      },
      {
        name: '매치빌런',
        features: {
          '스왑 방식': '인접 타일 스왑',
          '매치 판정': '3+ 일직선, T/L',
          '캐스케이드': '무제한 연쇄',
          '아이템 생성': '로켓, 폭탄, 미러볼',
          '이동 제한': '이동 횟수',
          '목표 시스템': '빌런 처치, 색상 수집',
        },
      },
    ],
  },
  takeaways: [
    '스왑 요청은 서버에서 검증 후 처리합니다. 클라이언트는 결과만 받아 렌더링합니다.',
    '매치 감지 → 아이템 생성 → 타일 제거 → 중력 적용 → 캐스케이드 순으로 처리합니다.',
    '캐스케이드는 매치가 없을 때까지 반복하며, 각 단계를 BoardStep으로 기록합니다.',
    '게임 세션은 서버에 저장되며, 각 스왑마다 이동 횟수를 차감하고 목표 달성을 확인합니다.',
    '4매치는 로켓, 2×2/T/L매치는 폭탄을 생성합니다. 아이템은 스왑 시 활성화됩니다.',
  ],
};
