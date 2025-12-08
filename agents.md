# Finpalette 프로젝트 가이드 (agents.md)

이 문서는 Finpalette 프로젝트의 코드 퀄리티를 일관되게 유지하고, 효율적인 개발 문화를 만들기 위해 작성되었습니다. 프로젝트에 참여하는 모든 기여자는 아래 가이드라인을 숙지하고 따라주시길 바랍니다.

---

## 1. Git 사용 및 커밋 컨벤션

깨끗하고 추적하기 쉬운 히스토리를 위해 다음 규칙을 따릅니다.

### 브랜치 전략

- **`main`**: 항상 배포 가능한 상태를 유지하는 프로덕션 브랜치입니다. 직접적인 푸시(push)는 금지하며, 오직 Pull Request를 통해서만 병합합니다.
- **`feat/<기능명>`**: 새로운 기능 개발 시 사용하는 브랜치입니다.
  - 예시: `feat/login-page`, `feat/add-transaction-form`
- **`fix/<이슈내용>`**: 버그 수정 시 사용하는 브랜치입니다.
  - 예시: `fix/header-style-bug`, `fix/login-validation`
- **`refactor/<리팩토링-대상>`**: 코드 리팩토링 시 사용하는 브랜치입니다.
  - 예시: `refactor/use-auth-hook`
- **`docs/<문서명>`**: 문서 수정 시 사용하는 브랜치입니다.
  - 예시: `docs/readme-update`

### 커밋 메시지 컨벤션

커밋 메시지는 **Conventional Commits** 명세를 따릅니다. 이는 커밋 히스토리의 가독성을 높이고, 변경 사항을 쉽게 파악할 수 있게 도와줍니다.

**형식:**
```
<타입>(<스코프>): <제목>

<본문 (선택 사항)>

<꼬리말 (선택 사항)>
```

**주요 타입:**
- **`feat`**: 새로운 기능 추가
- **`fix`**: 버그 수정
- **`docs`**: 문서 수정 (README.md, agents.md 등)
- **`style`**: 코드 포맷팅, 세미콜론 누락 등 (코드 로직 변경 없음)
- **`refactor`**: 코드 리팩토링
- **`test`**: 테스트 코드 추가 또는 수정
- **`chore`**: 빌드 관련 파일 수정, 패키지 매니저 설정 변경 등 (프로덕션 코드 변경 없음)

**예시:**
```
feat(auth): 로그인 페이지 UI 구현

- 이메일, 비밀번호 입력 필드 추가
- 로그인 버튼 컴포넌트 생성
```
```
fix(header): 모바일에서 로고가 깨지는 문제 수정

로고 이미지의 max-width를 100%로 설정하여 해결합니다.
```

---

## 2. 코딩 스타일 및 컨벤션

### 일반 원칙
- **ESLint & Prettier**: 프로젝트에 설정된 ESLint와 Prettier 규칙을 반드시 따릅니다. 커밋 전에는 항상 포맷팅을 실행해주세요.
- **네이밍**:
  - 컴포넌트, 인터페이스, 타입: `PascalCase` (예: `TransactionList`, `IUser`)
  - 변수, 함수: `camelCase` (예: `currentUser`, `getTransactions`)
- **폴더 구조**: `PROJECT_PLAN.md`에 정의된 폴더 구조를 따릅니다.
  - `src/components`: 재사용 가능한 UI 컴포넌트
  - `src/pages`: 페이지 단위 컴포넌트
  - `src/hooks`: 커스텀 훅
  - `src/lib`: 외부 라이브러리 설정 (예: `supabaseClient.ts`)
  - `src/types`: 전역 타입 정의

### React & TypeScript

- **컴포넌트**: 함수형 컴포넌트와 훅(Hook) 사용을 원칙으로 합니다.
- **타입 정의**:
  - 컴포넌트의 `props` 타입은 항상 정의합니다.
  - API 응답 데이터 등 객체 형태가 명확한 경우 `interface`를 우선적으로 사용합니다.
  - 간단한 타입 조합이나 유틸리티 타입은 `type`을 사용합니다.
- **상태 관리**: 간단한 상태는 `useState`를 사용하고, 여러 컴포넌트에서 공유해야 하는 전역 상태는 `Context API` 또는 `Zustand` 같은 상태 관리 라이브러리를 사용합니다.

### 아이콘 사용 정책

- **SVG 우선 사용**: 프로젝트 내 모든 아이콘은 이미지 파일(png, jpg 등) 대신 SVG(Scalable Vector Graphics) 사용을 원칙으로 합니다.
- **구현 방식**:
  - **아이콘 라이브러리 활용**: 일관된 디자인과 개발 편의성을 위해 `react-icons`와 같은 라이브러리 사용을 적극 권장합니다.
  - **커스텀 SVG**: 라이브러리에 없는 특정 아이콘이 필요할 경우, `.svg` 파일을 React 컴포넌트로 변환하여 사용합니다.

---

## 3. Pull Request (PR) 및 코드 리뷰

1. **PR 생성**: 기능 개발 또는 버그 수정이 완료되면 `main` 브랜치로 PR을 생성합니다.
2. **PR 템플릿 작성**:
   - **제목**: 커밋 메시지 컨벤션과 유사하게 작성합니다. (예: `feat(auth): 로그인 기능 구현`)
   - **내용**: 어떤 작업을 했는지, 어떻게 테스트했는지, 스크린샷 등을 포함하여 리뷰어가 이해하기 쉽게 작성합니다.
3. **코드 리뷰**:
   - 모든 PR은 최소 1명 이상의 동료(또는 스스로)에게 리뷰를 받은 후 병합하는 것을 원칙으로 합니다.
   - 리뷰어는 코드의 로직, 스타일, 잠재적 버그 등을 확인하고 개선점을 제안합니다.
   - 리뷰를 요청할 때는 정중하게, 리뷰를 할 때는 건설적인 피드백을 제공합니다.

---

## 4. 코드 재사용 및 유지보수성 향상 전략

프로젝트가 성장함에 따라 발생하는 반복적인 코드 수정을 방지하고, 예측 가능하며 유지보수하기 쉬운 구조를 만들기 위해 다음 전략을 따릅니다. 이는 **"관심사의 분리(Separation of Concerns)"** 원칙에 기반합니다.

### 4.1. 로직 분리: 커스텀 훅 (Custom Hooks)

여러 컴포넌트에서 반복되는 데이터 fetching, 상태 관리 로직은 커스텀 훅으로 분리하여 재사용합니다. 이를 통해 컴포넌트는 UI 표시에만 집중할 수 있습니다.

**예시: `useTransactions` 훅**
```typescript
// src/hooks/useTransactions.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Transaction } from '../types/database';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      const { data, error } = await supabase.from('transactions').select('*');
      if (!error) setTransactions(data);
      setLoading(false);
    };
    fetchTransactions();
  }, []);

  return { transactions, loading };
}
```

### 4.2. UI 분리: 재사용 가능한 컴포넌트

버튼, 입력창, 칩, 카드 등 반복적으로 사용되는 UI 요소는 `props`를 통해 제어되는 범용 컴포넌트로 분리합니다. 이를 통해 디자인의 일관성을 유지하고, 스타일 변경 시 한 곳만 수정하면 됩니다.

**예시: `Chip` 컴포넌트**
```tsx
// src/components/common/Chip.tsx
interface ChipProps {
  label: string;
  color: string;
}

export function Chip({ label, color }: ChipProps) {
  return <span style={{ backgroundColor: color }}>{label}</span>;
}
```

### 4.3. 타입 중앙화: Single Source of Truth

프로젝트 전반에서 사용되는 데이터 타입(예: `Transaction`, `Category`)은 `src/types` 폴더 내의 파일에서 중앙 관리합니다. 이를 통해 데이터 구조의 일관성을 보장하고, API 변경 시 수정 범위를 명확하게 할 수 있습니다.

---

## 5. 보안 가이드라인 (Security)

**⚠️ 매우 중요: 어떠한 경우에도 민감한 정보(API 키, 비밀 키 등)를 Git에 커밋해서는 안 됩니다.**

이 프로젝트는 공개 저장소로 운영되므로, 아래 규칙을 반드시 준수해야 합니다.

- **환경 변수 관리**:
  - 모든 민감한 키는 프로젝트 루트 디렉토리에 **`.env.local`** 파일을 생성하여 관리합니다.
  - 이 파일은 `.gitignore`에 반드시 포함되어 있어 원격 저장소에 절대로 업로드되지 않도록 해야 합니다.

- **환경 변수 파일 예시 (`.env.local`):**
  ```
  VITE_SUPABASE_URL=YOUR_SUPABASE_URL
  VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
  ```

- **협업을 위한 안내**:
  - 다른 개발자가 프로젝트를 쉽게 설정할 수 있도록, 실제 키 값을 제외한 템플릿 파일인 **`.env.example`** 파일을 만들어 커밋하는 것을 권장합니다.

---

이 문서는 살아있는 문서입니다. 프로젝트가 진행됨에 따라 더 좋은 아이디어가 있다면 언제든지 논의를 통해 업데이트할 수 있습니다.