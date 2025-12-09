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