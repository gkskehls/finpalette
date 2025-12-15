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
  - `src/config`: 상수, 설정 파일

### React & TypeScript

- **컴포넌트**: 함수형 컴포넌트와 훅(Hook) 사용을 원칙으로 합니다.
- **타입 정의**:
  - 컴포넌트의 `props` 타입은 항상 정의합니다.
  - API 응답 데이터 등 객체 형태가 명확한 경우 `interface`를 우선적으로 사용합니다.
  - 간단한 타입 조합이나 유틸리티 타입은 `type`을 사용합니다.
- **상태 관리**:
  - **서버 상태**: `TanStack Query(React Query)`를 사용하여 API 데이터를 관리합니다.
  - **클라이언트 상태**: 간단한 UI 상태는 `useState`를 사용하고, 여러 컴포넌트에서 공유해야 하는 전역 상태는 `Context API` 또는 `Zustand` 같은 라이브러리를 사용합니다.

### 아이콘 사용 정책

- **SVG 우선 사용**: 프로젝트 내 모든 아이콘은 이미지 파일(png, jpg 등) 대신 SVG(Scalable Vector Graphics) 사용을 원칙으로 합니다.
- **라이브러리**: 일관된 디자인과 개발 편의성을 위해 `lucide-react`를 기본 라이브러리로 사용합니다.
- **타입-안전한 사용**:
  1.  **`IconName` 타입 정의**: `src/types/icon.ts` 파일에 사용할 아이콘의 이름을 유니언(`Union`) 타입으로 정의합니다.
      ```typescript
      // src/types/icon.ts
      export type IconName = 'Utensils' | 'Bus' | 'ShoppingBag';
      ```
  2.  **타입 적용**: 아이콘 이름을 받는 `props`나 데이터 모델(예: `Category`)의 `icon` 속성은 `string` 대신 `IconName` 타입을 사용합니다.
  3.  **컴포넌트 매핑**: 아이콘을 동적으로 렌더링하는 컴포넌트에서는, `IconName`을 키로, `lucide-react`의 아이콘 컴포넌트를 값으로 갖는 객체를 만들어 사용합니다. 이는 타입 단언(`as`)을 피하고 코드의 안정성을 높입니다.

      ```tsx
      // src/components/common/Icon.tsx
      import { Utensils, Bus, ShoppingBag } from 'lucide-react';
      import type { IconName } from '../../types/icon';

      const icons: Record<IconName, React.ElementType> = {
        Utensils,
        Bus,
        ShoppingBag,
      };

      export function Icon({ name }: { name: IconName }) {
        const IconComponent = icons[name];
        return <IconComponent />;
      }
      ```

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

여러 컴포넌트에서 반복되는 데이터 fetching, 상태 관리 로직은 커스텀 훅으로 분리하여 재사용합니다. 이를 통해 컴포넌트는 UI 표시에만 집중할 수 있습니다. (자세한 내용은 `9. API 연동 가이드라인` 참고)

### 4.2. UI 분리: 재사용 가능한 컴포넌트

버튼, 입력창, 칩, 카드 등 반복적으로 사용되는 UI 요소는 `props`를 통해 제어되는 범용 컴포넌트로 분리합니다. 이를 통해 디자인의 일관성을 유지하고, 스타일 변경 시 한 곳만 수정하면 됩니다.

### 4.3. 타입 및 상수 중앙화 (Single Source of Truth)

#### 4.3.1. 타입 중앙화

프로젝트 전반에서 사용되는 데이터 타입은 `src/types` 폴더 내의 파일에서 중앙 관리합니다.

- **데이터 모델 타입**: DB 스키마와 직접적으로 관련된 타입은 도메인별로 파일을 분리합니다.
  - `src/types/transaction.ts`
  - `src/types/category.ts`
- **UI 전용 타입**: DB 스키마와는 다르지만, UI 표현을 위해 가공된 데이터의 타입은 별도로 분리합니다.
  - `src/types/ui.ts` (예: `TransactionItem`, `SummaryData`)
- **공용 유틸리티 타입**: 여러 곳에서 사용되는 특정 타입(예: 아이콘 이름)은 별도 파일로 관리합니다.
  - `src/types/icon.ts` (예: `IconName`)

**핵심 데이터 타입 구조 (`src/types/transaction.ts`):**

```typescript
export interface Transaction {
  localId: string; // 클라이언트 전용 임시 ID (React key 용)
  id: string | null; // 서버 DB ID (동기화 상태 확인용)
  date: string; // "YYYY-MM-DD"
  type: string; // 거래 타입 코드 (예: 'inc', 'exp')
  amount: number;
  category_code: string; // 카테고리 코드 (Category.code 참조)
  description: string;
}
```

#### 4.3.2. 상수 중앙화

데이터베이스에 저장되는 코드 값(예: 'inc')과 화면에 표시될 텍스트(예: "수입")의 매핑 정보는 `src/config/constants.json` 파일에서 중앙 관리합니다. 코드에 매직 넘버나 문자열을 직접 사용하지 않도록 합니다.

---

## 9. API 연동 가이드라인 (API Integration Guide)

일관되고 효율적인 데이터 통신을 위해 다음 API 연동 가이드라인을 준수합니다.

### 9.1. 데이터 Fetching 라이브러리

- **`TanStack Query (React Query)` 사용 의무화**: 모든 서버 상태(Server State) 관리는 `TanStack Query`를 사용합니다. `useState`와 `useEffect`를 직접 조합하여 API를 호출하는 방식은 특별한 사유가 없는 한 지양합니다.

### 9.2. Query Hooks 구현

- **`useQuery`**: 데이터를 조회(GET)하는 경우 사용합니다.
- **`useMutation`**: 데이터를 생성(POST), 수정(PUT/PATCH), 삭제(DELETE)하는 경우 사용합니다.
- **구현 위치**: API 관련 훅은 `src/hooks/queries` 폴더 내에 도메인별로 파일을 분리하여 관리합니다. (예: `useTransactionsQuery.ts`)

**예시: 로컬 스토리지 기반 `useTransactionsQuery` 훅**

```typescript
// src/hooks/queries/useTransactionsQuery.ts
import { useQuery } from '@tanstack/react-query';
import type { Transaction } from '../../types/transaction';

// 1. API 호출 함수 (로컬 스토리지 버전)
const getTransactions = async (): Promise<Transaction[]> => {
  const storedData = localStorage.getItem('transactions');
  return storedData ? JSON.parse(storedData) : [];
};

// 2. 커스텀 훅으로 래핑
export function useTransactionsQuery() {
  return useQuery<Transaction[], Error>({
    queryKey: ['transactions'], // 쿼리 키
    queryFn: getTransactions, // API 호출 함수
  });
}
```

### 9.3. Mutation Hooks 구현

- **`onSuccess` 콜백 활용**: 데이터 변경 성공 후, 관련된 쿼리를 무효화(`invalidateQueries`)하여 자동으로 데이터를 다시 불러오도록 설정합니다.

**예시: 로컬 스토리지 기반 `useAddTransactionMutation` 훅**

```typescript
// src/hooks/queries/useTransactionsMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import type { Transaction } from '../../types/transaction';

type NewTransactionData = Omit<Transaction, 'localId' | 'id'>;

const addTransaction = async (
  newTransactionData: NewTransactionData
): Promise<Transaction> => {
  const storedData = localStorage.getItem('transactions');
  const currentTransactions = storedData ? JSON.parse(storedData) : [];

  const newTransaction: Transaction = {
    ...newTransactionData,
    localId: uuidv4(),
    id: null, // 서버 동기화 전 상태
  };

  const updatedTransactions = [...currentTransactions, newTransaction];
  localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  return newTransaction;
};

export function useAddTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation<Transaction, Error, NewTransactionData>({
    mutationFn: addTransaction,
    onSuccess: () => {
      // 'transactions' 쿼리를 무효화하여 useTransactionsQuery가 다시 실행되도록 함
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
```

... (이하 내용은 기존과 동일)
