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

### 4.4. 아키텍처 패턴: Container/Presentational Pattern

컴포넌트를 역할에 따라 두 가지로 명확히 구분하여 개발합니다.

- **Container 컴포넌트 (Smart):**
  - **역할:** 데이터 fetching, 상태 관리 등 '어떻게 동작할지'에 대한 로직을 담당합니다.
  - **구현:** 주로 `pages` 폴더에 위치하며, 커스텀 훅(`useTransactions`)을 사용하여 데이터를 가져오고 상태를 관리합니다.
- **Presentational 컴포넌트 (Dumb):**
  - **역할:** 데이터를 `props`로 받아 '어떻게 보일지'에 대한 UI 렌더링만 담당합니다. 자체적으로 상태를 거의 갖지 않습니다.
  - **구현:** 주로 `components` 폴더에 위치하며, 순수하게 UI 표현에만 집중합니다.

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

## 6. 테스트 전략

- **원칙:** 새로운 기능을 추가하거나 기존 코드를 수정할 때는 반드시 관련 테스트 코드를 함께 작성하거나 업데이트합니다.
- **단위 테스트:** 모든 재사용 컴포넌트와 핵심 로직 함수는 단위 테스트를 작성하는 것을 원칙으로 합니다.
- **실행:** Pull Request 생성 전, `npm test` 명령을 통해 모든 테스트가 통과하는지 확인해야 합니다.

---

## 7. 엄격한 코드 구현 원칙 (Strict Code Implementation Principles)

불필요한 코드 변경을 방지하고, 프로젝트의 모든 코드가 예측 가능한 동일한 구조를 갖도록 다음 원칙을 반드시 준수합니다. 기존에 잘 동작하는 코드는 명시적인 기능 추가나 버그 수정 요청이 없는 한, 임의로 구조를 변경하지 않습니다.

### 7.1. 컴포넌트 구조 템플릿

모든 React 컴포넌트는 다음 구조를 따릅니다.

- **import 순서**: `react` -> 외부 라이브러리 -> 내부 컴포넌트/훅 -> 타입 -> 스타일 순으로 그룹화합니다.
- **Props 타입 정의**: 컴포넌트 바로 위에 `interface`로 정의하며, 이름은 `[컴포넌트명]Props`로 명명합니다.
- **컴포넌트 선언**: `export function` 키워드를 사용한 명명 함수로 선언합니다.
- **스타일링**: CSS Modules(`.module.css`) 사용을 원칙으로 하며, `styles` 라는 이름으로 import 합니다.

**예시: `src/components/common/Button.tsx`**
```tsx
import React from 'react';

// 외부 라이브러리 (예: clsx)
import clsx from 'clsx';

// 내부 컴포넌트, 훅 등
import { useSomething } from '@/hooks/useSomething';

// 타입
import type { ButtonVariant } from './Button.types';

// 스타일
import styles from './Button.module.css';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
  isDisabled?: boolean;
}

export function Button({ label, onClick, variant = 'primary', isDisabled = false }: ButtonProps) {
  const buttonClassName = clsx(styles.button, styles[variant], {
    [styles.disabled]: isDisabled,
  });

  return (
    <button className={buttonClassName} onClick={onClick} disabled={isDisabled}>
      {label}
    </button>
  );
}
```

### 7.2. 커스텀 훅 구조 템플릿

모든 커스텀 훅은 상태, 핸들러/함수, 이펙트, 반환 값의 순서와 구조를 통일합니다.

- **상태 (State)**: 훅의 가장 상단에 `useState`를 모아서 선언합니다.
- **메모이제이션 (Memoization)**: `useCallback`, `useMemo`를 사용하여 불필요한 리렌더링을 방지하는 로직을 상태 선언부 다음에 작성합니다.
- **핸들러/함수 (Handlers/Functions)**: 상태를 변경하거나 특정 로직을 수행하는 내부 함수를 선언합니다.
- **이펙트 (Effect)**: `useEffect`를 사용하여 외부 요인(props, API 등)에 반응하는 로직을 작성합니다.
- **반환 (Return)**: 훅의 가장 마지막에 위치하며, 배열 또는 객체 형태로 상태와 핸들러를 명시적으로 반환합니다.

**예시: `src/hooks/useToggle.ts`**
```ts
import { useState, useCallback } from 'react';

export function useToggle(initialState = false): [boolean, () => void] {
  const [isOn, setIsOn] = useState(initialState);

  const toggle = useCallback(() => {
    setIsOn(prev => !prev);
  }, []);

  return [isOn, toggle];
}
```

### 7.3. 스타일링 방식 통일

- **CSS Modules 원칙**: 전역 CSS 오염을 방지하고 컴포넌트 단위 스타일링을 위해 `.module.css` 파일 사용을 기본으로 합니다.
- **클래스 네이밍**: CSS 클래스명은 `kebab-case`를 사용하고, JavaScript에서 접근할 때는 `camelCase` (e.g., `styles.buttonContainer`)를 사용합니다.
- **전역 스타일**: 앱 전체에 적용되어야 하는 최소한의 스타일(폰트, 리셋 CSS 등)은 `src/styles/global.css`에서 관리합니다.

### 7.4. 페이지 구현 실전 가이드 (Page Implementation Guide)

새로운 페이지를 만들거나 기존 페이지를 리팩토링할 때는 다음의 **관심사 분리(Separation of Concerns)** 절차를 따릅니다. 이는 `DashboardPage` 리팩토링 과정에서 수립된 모범 사례입니다.

**목표:** `pages` 폴더의 컴포넌트는 각 페이지의 레이아웃과 데이터 흐름만 담당하는 **'컨테이너'** 역할을 하고, UI의 실제 표현은 `components` 폴더의 **'프레젠테이셔널'** 컴포넌트에게 위임합니다.

**절차:**

1.  **관심사 식별**: 페이지를 구성하는 UI 조각과 데이터, 타입을 식별합니다.
    -   **UI 조각**: 재사용 가능한 공통 컴포넌트(예: Header, Button)와 특정 페이지에서만 쓰이는 컴포넌트(예: SummaryCard)로 나뉩니다.
    -   **데이터**: 페이지에 표시될 데이터(예: `mockTransactions`)와 그 데이터의 형태를 정의하는 타입(예: `Transaction`)으로 나뉩니다.

2.  **타입 분리 및 정의 (`/src/types`)**:
    -   페이지에서 사용할 데이터 타입을 `src/types` 폴더에 명확하게 정의합니다.
    -   예시: `src/types/transaction.ts` 파일에 `Transaction`, `Category` 등을 정의합니다.

3.  **(임시) 데이터 분리 (`/src/data`)**:
    -   API 연동 전, 프로토타이핑에 사용할 목업(mock) 데이터를 `src/data` 폴더에 분리합니다.
    -   예시: `src/data/mockData.ts` 파일에 `mockTransactions`, `mockCategories` 등을 정의합니다.

4.  **프레젠테이셔널 컴포넌트 생성 (`/src/components`)**:
    -   식별된 UI 조각들을 `props`를 통해 데이터를 받아 화면에 그리는 역할만 하는 '멍청한(Dumb)' 컴포넌트로 만듭니다.
    -   **공통 컴포넌트**: 여러 페이지에서 사용될 수 있는 범용 컴포넌트는 `src/components/common/` 에 생성합니다. (예: `Header.tsx`, `BottomNav.tsx`)
    -   **페이지 전용 컴포넌트**: 특정 페이지에서만 사용되는 컴포넌트는 `src/components/[페이지명]/` 에 생성합니다. (예: `src/components/dashboard/SummaryCard.tsx`)

5.  **컨테이너 컴포넌트 조립 (`/src/pages`)**:
    -   `src/pages` 폴더의 페이지 컴포넌트에서는 분리된 데이터와 프레젠테이셔널 컴포넌트들을 가져와 조립합니다.
    -   이 컴포넌트는 '어떻게 보일지'가 아닌, '무엇을 보여줄지'에만 집중합니다.
    -   데이터 fetching, 상태 관리 로직은 주로 이 컨테이너 컴포넌트 또는 이 컴포넌트가 사용하는 커스텀 훅에 위치하게 됩니다.

**`DashboardPage` 리팩토링 후 최종 구조:**

```
// src/pages/DashboardPage.tsx

// 1. 공통/대시보드 컴포넌트 import
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';
import { SummaryCard } from '../components/dashboard/SummaryCard';
// ...

// 2. 데이터 import
import { mockSummary, mockCategories, mockTransactions } from '../data/mockData';

// 3. 스타일 import
import './DashboardPage.css';

// 4. 페이지 컴포넌트 (컨테이너)
export function DashboardPage() {
  return (
    <div className="dashboard-container">
      {/* 5. 컴포넌트 조립 및 데이터 전달 */}
      <Header title="Finpalette" />
      <main className="dashboard-main">
        <SummaryCard {...mockSummary} />
        <CategorySection categories={mockCategories} />
        <TransactionSection transactionGroups={mockTransactions} />
      </main>
      {/* ... */}
    </div>
  );
}
```

### 7.5. 작업 원칙 합의

1.  **명시적 요청 기반 수정**: 기능 개발, 버그 수정 등 명확한 목표가 제시된 경우에만 코드를 수정합니다. 임의로 기존 코드의 구조를 변경하지 않습니다.
2.  **합의된 패턴 준수**: 새로운 코드를 작성할 때는 반드시 상기된 템플릿과 패턴을 100% 준수합니다.
3.  **리팩토링 사전 동의**: 기존 코드의 구조 변경이 불가피하다고 판단될 경우, 변경 이유와 대안을 먼저 설명하고 동의를 얻은 후에만 작업을 진행합니다.

---

이 문서는 살아있는 문서입니다. 프로젝트가 진행됨에 따라 더 좋은 아이디어가 있다면 언제든지 논의를 통해 업데이트할 수 있습니다.
---

## 8. 에러 처리 전략 (Error Handling Strategy)

사용자 경험을 저해하지 않고, 개발자가 문제를 빠르게 파악하고 해결할 수 있도록 일관된 에러 처리 전략을 적용합니다.

### 8.1. 에러의 종류

- **UI 에러**: 사용자의 입력 오류, 유효성 검사 실패 등 예측 가능한 클라이언트 측 에러.
- **API 에러**: 서버와의 통신 실패, 서버 측 로직 에러, 인증 실패 등 네트워크 요청과 관련된 에러.
- **전역 에러**: 애플리케이션 로딩 실패, 렌더링 중 발생하는 심각한 에러 등 예상치 못한 에러.

### 8.2. 처리 원칙

1.  **사용자에게 친화적인 피드백 제공**:
    -   에러가 발생했음을 명확히 알리되, 기술적인 에러 코드를 그대로 노출하지 않습니다.
    -   "입력하신 정보가 올바르지 않습니다.", "데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요." 와 같이 이해하기 쉬운 메시지를 사용합니다.
    -   필요 시, 사용자가 다음에 취할 수 있는 행동(예: '다시 시도' 버튼)을 안내합니다.

2.  **개발자를 위한 명확한 로깅**:
    -   사용자에게는 간단한 메시지를 보여주더라도, 개발 환경의 콘솔에는 에러의 원인을 파악할 수 있는 상세한 정보(에러 객체, 발생 위치 등)를 반드시 출력합니다.
    -   프로덕션 환경에서는 Sentry, LogRocket과 같은 에러 모니터링 도구를 연동하여 에러를 수집하고 분석합니다.

### 8.3. 구현 패턴

-   **UI 에러 처리**:
    -   폼(Form) 유효성 검사 에러는 각 입력 필드 하단에 메시지를 표시합니다.
    -   `react-hook-form`과 같은 라이브러리를 활용하여 선언적으로 유효성 검사를 관리하는 것을 권장합니다.

-   **API 에러 처리 (in Custom Hooks)**:
    -   데이터 fetching 로직을 담고 있는 커스텀 훅(`useTransactions` 등)은 `data`, `loading` 상태와 더불어 `error` 상태를 함께 반환해야 합니다.
    -   `try...catch` 구문을 사용하여 API 요청 실패를 감지하고, `error` 상태에 에러 객체를 저장합니다.

    **예시: `useTransactions` 훅 개선**
    ```typescript
    // src/hooks/useTransactions.ts
    import { useEffect, useState } from 'react';
    import { supabase } from '../lib/supabaseClient';
    import type { Transaction } from '../types/database';

    export function useTransactions() {
      const [transactions, setTransactions] = useState<Transaction[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<Error | null>(null); // 에러 상태 추가

      useEffect(() => {
        const fetchTransactions = async () => {
          try {
            setLoading(true);
            setError(null); // 요청 시작 시 에러 초기화
            const { data, error: dbError } = await supabase.from('transactions').select('*');
            
            if (dbError) {
              throw dbError; // Supabase 에러를 throw
            }

            setTransactions(data || []);
          } catch (err) {
            console.error('Failed to fetch transactions:', err); // 개발자용 로깅
            setError(err as Error); // 에러 상태 업데이트
          } finally {
            setLoading(false);
          }
        };
        fetchTransactions();
      }, []);

      return { transactions, loading, error }; // error 반환
    }
    ```

-   **전역 에러 처리 (Error Boundary)**:
    -   React의 **Error Boundary** 컴포넌트를 사용하여, 특정 컴포넌트 트리에서 발생하는 렌더링 에러가 전체 애플리케이션을 중단시키는 것을 방지합니다.
    -   `src/components/common/ErrorBoundary.tsx` 와 같은 공통 컴포넌트를 생성하고, 최상위 레이아웃(`App.tsx` 또는 라우터 설정)에 적용하여 예상치 못한 에러 발생 시 대체 UI를 보여줍니다.
---

## 9. API 연동 가이드라인 (API Integration Guide)

일관되고 효율적인 데이터 통신을 위해 다음 API 연동 가이드라인을 준수합니다. 이 가이드라인은 데이터 fetching, 캐싱, 상태 관리를 표준화하여 코드의 예측 가능성을 높이고 보일러플레이트를 줄이는 것을 목표로 합니다.

### 9.1. 데이터 Fetching 라이브러리

- **`TanStack Query (React Query)` 사용 의무화**: 모든 서버 상태(Server State) 관리는 `TanStack Query`를 사용합니다. `useState`와 `useEffect`를 직접 조합하여 API를 호출하는 방식은 특별한 사유가 없는 한 지양합니다.

- **사용 이유**:
  - **캐싱(Caching)**: 동일한 데이터 요청에 대해 캐시된 데이터를 반환하여 불필요한 API 호출을 줄입니다.
  - **자동 리페칭(Refetching)**: 포커스가 돌아오거나 네트워크가 재연결될 때 자동으로 데이터를 갱신하여 최신 상태를 유지합니다.
  - **서버 상태와 클라이언트 상태의 분리**: 데이터 fetching 관련 로직(로딩, 에러, 성공 상태)을 컴포넌트로부터 분리하여 UI 코드의 복잡도를 낮춥니다.
  - **Devtools**: 강력한 개발자 도구를 통해 API 요청 상태와 캐시된 데이터를 시각적으로 확인할 수 있습니다.

### 9.2. Query Hooks 구현

- **`useQuery`**: 데이터를 조회(GET)하는 경우 사용합니다.
- **`useMutation`**: 데이터를 생성(POST), 수정(PUT/PATCH), 삭제(DELETE)하는 경우 사용합니다.
- **Query Key 관리**:
  - 쿼리 키는 API의 엔드포인트와 파라미터를 명확히 나타내는 배열로 작성합니다.
  - 예시: `['transactions']`, `['transactions', { year: 2024, month: 7 }]`, `['transaction', 'tx-id-123']`

- **구현 위치**:
  - API 관련 훅은 `src/hooks/queries` 폴더 내에 도메인별로 파일을 분리하여 관리합니다.
  - 예시: `src/hooks/queries/useTransactionsQuery.ts`, `src/hooks/queries/useCategoriesQuery.ts`

**예시: `useTransactionsQuery` 훅**
```typescript
// src/hooks/queries/useTransactionsQuery.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import type { Transaction } from '@/types/database';

// 1. API 호출 함수 분리
const fetchTransactions = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// 2. 커스텀 훅으로 래핑
export function useTransactionsQuery() {
  return useQuery<Transaction[], Error>({
    queryKey: ['transactions'], // 쿼리 키
    queryFn: fetchTransactions, // API 호출 함수
  });
}
```

### 9.3. Mutation Hooks 구현

- **`onSuccess` 콜백 활용**: 데이터 변경 성공 후, 관련된 쿼리를 무효화(invalidate)하여 자동으로 데이터를 다시 불러오도록 설정합니다. 이를 통해 UI가 항상 최신 상태를 반영하게 합니다.

**예시: `useAddTransactionMutation` 훅**
```typescript
// src/hooks/queries/useTransactionsMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import type { NewTransaction } from '@/types/database';

const addTransaction = async (newTransaction: NewTransaction) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert(newTransaction)
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export function useAddTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addTransaction,
    onSuccess: () => {
      // 'transactions' 쿼리를 무효화하여 useTransactionsQuery가 다시 실행되도록 함
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      console.error('Failed to add transaction:', error);
      // TODO: 사용자에게 에러 토스트 메시지 표시
    },
  });
}
```

### 9.4. API 타입 관리

- **Supabase 타입 자동 생성 활용**: `supabase gen types typescript` 명령어를 사용하여 데이터베이스 스키마로부터 타입을 자동으로 생성하고, 이를 `src/types/supabase.ts` 파일에 저장하여 관리합니다.
- **중앙화된 타입 사용**: API 요청 및 응답 데이터 타입은 자동 생성된 타입을 기반으로 `src/types` 폴더에서 조합하거나 확장하여 사용합니다. 이를 통해 백엔드와 프론트엔드 간의 데이터 구조 불일치 문제를 방지합니다.
---

## 10. 성능 최적화 가이드라인 (Performance Optimization Guide)

쾌적한 사용자 경험을 제공하기 위해 애플리케이션의 성능을 지속적으로 관리하고 최적화합니다.

### 10.1. 렌더링 최적화

불필요한 리렌더링은 React 애플리케이션 성능 저하의 주요 원인입니다. `React DevTools Profiler`를 사용하여 렌더링 병목을 먼저 확인하고, 필요한 경우에만 최적화를 적용합니다.

- **`React.memo`**:
  - **사용 시점**: 컴포넌트가 동일한 `props`로 자주 리렌더링될 때 사용합니다. 특히, 리스트의 아이템 컴포넌트처럼 반복적으로 렌더링되는 컴포넌트에 유용합니다.
  - **주의**: `props`가 자주 변경되거나 복잡한 객체를 포함하는 경우, `props` 비교 비용이 더 클 수 있으므로 무분별한 사용을 지양합니다.

- **`useCallback`**:
  - **사용 시점**: 자식 컴포넌트에 함수를 `prop`으로 전달할 때, 부모 컴포넌트의 리렌더링으로 인해 자식 컴포넌트의 불필요한 리렌더링이 발생하는 것을 방지하기 위해 사용합니다. (주로 `React.memo`와 함께 사용됩니다.)
  - **주의**: 의존성 배열(`[]`)을 올바르게 설정해야 하며, 잘못 사용하면 오히려 버그의 원인이 될 수 있습니다.

- **`useMemo`**:
  - **사용 시점**: 렌더링 과정에서 수행되는 복잡하고 비용이 큰 연산의 결과를 메모이제이션(memoization)하여, 의존성이 변경될 때만 다시 계산하도록 합니다.
  - **예시**: 큰 배열을 필터링하거나 정렬하는 연산에 적용할 수 있습니다.

### 10.2. 번들 사이즈 관리

- **Code Splitting (코드 분할)**:
  - **`React.lazy`**와 **`Suspense`**를 사용하여 라우트(페이지) 단위로 코드를 분할합니다. 이를 통해 사용자가 현재 필요로 하는 코드만 초기에 로드하여 초기 로딩 속도(TTV, Time To View)를 개선합니다.
  - **구현**: React Router와 같은 라우팅 라이브러리에서 동적 `import()`와 함께 사용합니다.

  ```tsx
  // 예시: src/App.tsx
  import React, { Suspense, lazy } from 'react';
  import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

  const DashboardPage = lazy(() => import('./pages/DashboardPage'));
  const LoginPage = lazy(() => import('./pages/LoginPage'));

  function App() {
    return (
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </Suspense>
      </Router>
    );
  }
  ```

- **라이브러리 분석**:
  - `vite-plugin-visualizer`와 같은 번들 분석 도구를 사용하여, 프로덕션 번들에 포함된 라이브러리의 크기를 주기적으로 확인합니다.
  - 불필요하게 크기가 큰 라이브러리는 더 가벼운 대안(예: `moment.js` 대신 `day.js`)을 찾거나, 필요한 기능만 가져와서(tree-shaking) 사용하도록 개선합니다.

### 10.3. 이미지 최적화

- **WebP 포맷 사용**: 가능한 경우, 이미지 포맷은 `jpg`나 `png` 대신 압축률이 더 좋은 `WebP`를 우선적으로 사용합니다.
- **이미지 리사이징**: 실제 화면에 표시되는 크기보다 과도하게 큰 원본 이미지를 사용하지 않습니다. 서버에서 리사이징하거나, 빌드 시점에 이미지 크기를 최적화하는 도구를 사용합니다.
- **Lazy Loading (지연 로딩)**: 사용자가 스크롤하여 뷰포트에 들어오기 전까지는 이미지를 로드하지 않도록 지연 로딩을 적용합니다. 이는 초기 페이지 로딩 성능을 크게 향상시킵니다.
---

## 11. 코드 일관성 및 표준 강제

가이드라인 준수를 개인의 노력에만 의존하지 않고, 자동화된 도구를 통해 코드의 일관성과 표준을 강제합니다.

### 11.1. 커밋 전 자동 검사 (Pre-commit Hook)

- **목표**: 포맷팅이 깨지거나 린트(lint) 오류가 있는 코드가 원격 저장소에 커밋되는 것을 원천적으로 방지합니다.
- **도구**:
  - **`husky`**: Git hooks를 쉽게 관리할 수 있게 해주는 도구입니다.
  - **`lint-staged`**: Git에 `staged`된 파일에 대해서만 린트 및 포맷팅을 실행하여 검사 속도를 향상시키는 도구입니다.
- **설정**:
  1. `husky`와 `lint-staged`를 개발 의존성으로 설치합니다.
  2. `husky`를 활성화하여 `.husky` 디렉토리를 생성합니다.
  3. `pre-commit` 훅 스크립트를 설정하여, 커밋 시 `lint-staged`가 실행되도록 합니다.
  4. `package.json`에 `lint-staged` 설정을 추가하여, 특정 확장자 파일에 대해 `ESLint`와 `Prettier`가 순차적으로 실행되고 자동으로 수정되도록 구성합니다.

  **`package.json` 내 `lint-staged` 설정 예시:**
  ```json
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
  ```
- **동작 흐름**:
  1. 개발자가 `git commit` 명령을 실행합니다.
  2. `husky`가 `pre-commit` 훅을 트리거합니다.
  3. `lint-staged`가 스테이징된 파일 목록을 가져옵니다.
  4. 해당 파일들에 대해 `ESLint`와 `Prettier`를 실행하여 코드 스타일을 교정하고 포맷팅합니다.
  5. 오류가 없으면 커밋이 완료되고, 오류가 있으면 커밋이 중단됩니다.

### 11.2. 지속적 통합 (Continuous Integration, CI)

- **목표**: Pull Request가 `main` 브랜치에 병합되기 전, 모든 코드가 린트, 타입 체크, 테스트, 빌드 등의 검증 절차를 통과했는지 자동으로 확인합니다.
- **도구**: **GitHub Actions**
- **설정**:
  - 프로젝트 루트에 `.github/workflows/ci.yml` 파일을 생성합니다.
  - 워크플로우는 `main` 브랜치에 Pull Request가 생성되거나 업데이트될 때 실행되도록 트리거를 설정합니다.
- **주요 검증 단계 (Jobs)**:
  1. **`lint-and-format`**: 프로젝트 전체 코드에 대해 `ESLint`와 `Prettier` 검사를 실행하여 코드 스타일 준수 여부를 확인합니다.
  2. **`type-check`**: `tsc --noEmit` 명령을 실행하여 TypeScript 컴파일 오류 및 타입 에러가 없는지 확인합니다.
  3. **`test`**: `npm test` 명령을 실행하여 모든 단위/통합 테스트가 통과하는지 확인합니다.
  4. **`build`**: `npm run build` 명령을 실행하여 프로젝트가 성공적으로 빌드되는지 확인합니다.
- **동작 흐름**:
  1. 개발자가 `main` 브랜치로 Pull Request를 생성합니다.
  2. GitHub Actions가 `ci.yml` 워크플로우를 자동으로 실행합니다.
  3. 모든 검증 단계가 성공적으로 통과해야만 Pull Request를 병합할 수 있도록 브랜치 보호 규칙(Branch Protection Rule)을 설정합니다.
  4. 만약 어느 한 단계라도 실패하면, 해당 PR은 병합이 차단되며 개발자는 문제를 수정해야 합니다.
