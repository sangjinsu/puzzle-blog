# Puzzle Content Lab

> 퍼즐 게임 데모를 통해 배우는 게임 콘텐츠 서버 설계 블로그

퍼즐 게임(3매치)의 **인터랙티브 데모**를 직접 플레이하면서, 그 뒤에서 동작하는 **서버 로직과 DB 설계**를 자연스럽게 학습하는 블로그입니다.

---

## 핵심 콘셉트: 3 Layer

```
┌─────────────────────────────────────┐
│  🎮 PLAY    인터랙티브 데모 (3매치)    │
├─────────────────────────────────────┤
│  ⚙️ LOGIC   서버 & DB 로직 해설       │
├─────────────────────────────────────┤
│  📊 COMPARE  퍼즐 게임 콘텐츠 비교     │
└─────────────────────────────────────┘
```

- **PLAY** — 로얄매치 스타일 3매치 데모를 직접 플레이
- **LOGIC** — 각 콘텐츠(라이프, 퀘스트, 패스 등)의 서버/DB 구현을 인포그래픽으로 설명
- **COMPARE** — 로얄매치 · 캔디크러쉬 · 트리플타일 등 실제 게임의 콘텐츠 비교 분석

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 런타임 | Bun |
| 스타일링 | Tailwind CSS 4 |
| 데모 렌더링 | React + CSS Grid |
| 인포그래픽 | SVG + Framer Motion |
| 마크다운 | MDX |
| 배포 | Vercel |

---

## 프로젝트 구조 (FSD)

[Feature-Sliced Design](https://feature-sliced.design/) 아키텍처를 따릅니다.

```
src/
├── app/              # Next.js App Router (라우팅, 레이아웃)
├── pages/            # 페이지 컴포지션 (위젯 조합)
├── widgets/          # 독립 UI 블록 (퍼즐 보드, 인포그래픽 뷰어)
├── features/         # 비즈니스 기능 (매치 감지, 타일 스왑, 스테이지 클리어)
├── entities/         # 도메인 객체 (Tile, Stage, Post)
└── shared/           # 공통 UI, 유틸, 상수
```

**레이어 의존성**: `app → pages → widgets → features → entities → shared`

---

## 시작하기

```bash
# 설치
bun install

# 개발 서버
bun dev

# 빌드
bun run build

# 프로덕션
bun start
```

---

## 라이선스

MIT
