# FinPalette 프로젝트 파일 구조

이 문서는 FinPalette 프로젝트의 전체 파일 및 폴더 구조와 각 항목에 대한 설명을 제공합니다.

---

## 📂 루트 디렉토리

프로젝트의 최상위 레벨에 위치한 파일 및 폴더입니다.

- **📄 .firebaserc**: Firebase 프로젝트 설정을 위한 파일입니다. 어떤 Firebase 프로젝트를 사용할지 지정합니다.
- **📄 .gitignore**: Git 버전 관리에서 제외할 파일 및 폴더를 지정하는 파일입니다.
- **📄 .prettierrc**: 코드 포맷터인 Prettier의 설정을 담고 있는 파일입니다. 일관된 코드 스타일을 유지하는 데 사용됩니다.
- **📄 agents.md**: 프로젝트의 코딩 스타일, Git 컨벤션 등 개발 가이드라인을 정의한 문서입니다.
- **📄 APP_SPECIFICATION.md**: 애플리케이션의 상세 기능 명세와 요구사항을 정리한 문서입니다.
- **📄 eslint.config.js**: ESLint 설정을 위한 파일입니다. 코드의 잠재적인 오류나 스타일 문제를 검사합니다.
- **📄 firebase.json**: Firebase 호스팅, 데이터베이스 규칙 등 Firebase 서비스에 대한 상세 설정을 정의하는 파일입니다.
- **📄 index.html**: 웹 애플리케이션의 진입점이 되는 메인 HTML 파일입니다.
- **📄 memo.txt**: 프로젝트 관련 간단한 메모를 위한 텍스트 파일입니다.
- **📄 package.json**: 프로젝트의 이름, 버전, 의존성 라이브러리 목록, 실행 스크립트 등을 정의하는 Node.js 프로젝트의 핵심 파일입니다.
- **📄 package-lock.json**: `package.json`을 바탕으로 설치된 의존성 라이브러리들의 정확한 버전과 의존성 트리를 기록하는 파일입니다.
- **📄 PROJECT_PLAN.md**: 프로젝트의 목표, 기술 스택, 개발 로드맵 등을 기록한 문서입니다.
- **📄 README.md**: 프로젝트에 대한 전반적인 소개, 설치 방법, 사용법 등을 안내하는 파일입니다.
- **📄 tsconfig.json**: TypeScript 컴파일러의 전역 설정을 담고 있는 파일입니다.
- **📄 tsconfig.app.json**: 애플리케이션 코드에 대한 TypeScript 설정을 담고 있습니다.
- **📄 tsconfig.node.json**: Node.js 환경(예: 빌드 스크립트)에 대한 TypeScript 설정을 담고 있습니다.
- **📄 vite.config.ts**: Vite 빌드 도구의 설정을 위한 파일입니다. 개발 서버, 빌드 프로세스 등을 설정합니다.

---

### 📁 .github/

GitHub 리포지토리와 관련된 설정 파일들을 담는 폴더입니다.

- **📁 workflows/**: GitHub Actions 워크플로우 파일을 저장하는 폴더입니다.
  - **📄 ci.yml**: Continuous Integration (CI) 파이프라인을 정의하는 워크플로우 파일입니다. 코드 푸시 시 자동으로 빌드 및 테스트를 수행합니다.

### 📁 .husky/

Git hooks를 관리하기 위한 폴더입니다. 특정 Git 이벤트(예: commit, push) 발생 시 특정 스크립트를 실행할 수 있습니다.

- **📄 pre-commit**: 커밋 메시지를 작성하기 전에 실행되는 스크립트입니다. 주로 코드 린팅이나 테스트를 수행합니다.

### 📁 public/

빌드 과정에서 특별한 처리 없이 그대로 복사되는 정적 파일들을 담는 폴더입니다.

- **📄 vite.svg**: Vite 로고 SVG 이미지 파일입니다.

### 📁 src/

애플리케이션의 핵심 소스 코드가 위치하는 메인 폴더입니다.

- **📄 App.css**: `App` 컴포넌트에 적용되는 CSS 스타일 파일입니다.
- **📄 App.tsx**: 애플리케이션의 최상위 루트 컴포넌트입니다. 모든 페이지와 컴포넌트가 이 컴포넌트를 통해 렌더링됩니다.
- **📄 index.css**: 전역적으로 적용되는 공통 CSS 스타일 파일입니다.
- **📄 main.tsx**: React 애플리케이션의 진입점(entry point)입니다. `App` 컴포넌트를 HTML의 루트 요소에 렌더링하는 역할을 합니다.

#### 📁 assets/

이미지, 폰트 등 애플리케이션에서 사용하는 정적 자원 파일을 저장하는 폴더입니다.

- **📄 react.svg**: React 로고 SVG 이미지 파일입니다.

#### 📁 components/

재사용 가능한 UI 컴포넌트들을 모아두는 폴더입니다.

- **📁 common/**: 여러 페이지에서 공통적으로 사용되는 범용 컴포넌트 폴더입니다.
  - **📄 BottomNav.tsx**: 하단 네비게이션 바 컴포넌트입니다.
  - **📄 BottomNav.module.css**: `BottomNav` 컴포넌트의 전용 CSS 모듈 파일입니다.
  - **📄 FloatingActionButton.tsx**: 화면 위에 떠 있는 플로팅 액션 버튼 컴포넌트입니다.
  - **📄 FloatingActionButton.module.css**: `FloatingActionButton` 컴포넌트의 전용 CSS 모듈 파일입니다.
  - **📄 Header.tsx**: 페이지 상단의 헤더 컴포넌트입니다.
  - **📄 Header.module.css**: `Header` 컴포넌트의 전용 CSS 모듈 파일입니다.
  - **📄 Icon.tsx**: 아이콘을 표시하기 위한 컴포넌트입니다.

- **📁 dashboard/**: 대시보드 페이지에서만 사용되는 컴포넌트 폴더입니다.
  - **📄 CategorySection.tsx**: 카테고리별 지출 내역을 보여주는 섹션 컴포넌트입니다.
  - **📄 CategorySection.module.css**: `CategorySection` 컴포넌트의 전용 CSS 모듈 파일입니다.
  - **📄 SummaryCard.tsx**: 수입, 지출 등 요약 정보를 보여주는 카드 컴포넌트입니다.
  - **📄 SummaryCard.module.css**: `SummaryCard` 컴포넌트의 전용 CSS 모듈 파일입니다.
  - **📄 TransactionSection.tsx**: 최근 거래 내역을 보여주는 섹션 컴포넌트입니다.
  - **📄 TransactionSection.module.css**: `TransactionSection` 컴포넌트의 전용 CSS 모듈 파일입니다.

- **📁 transaction/**: 거래(수입/지출)와 관련된 컴포넌트 폴더입니다.
  - **📄 TransactionFormModal.tsx**: 거래 내역을 추가하거나 수정하는 폼이 담긴 모달 컴포넌트입니다.
  - **📄 TransactionFormModal.module.css**: `TransactionFormModal` 컴포넌트의 전용 CSS 모듈 파일입니다.

#### 📁 config/

애플리케이션의 설정 관련 코드를 담는 폴더입니다.

- **📄 constants.ts**: 카테고리, 거래 유형 등 앱 전반에서 사용되는 상수 값을 정의하는 파일입니다.

#### 📁 data/

애플리케이션에서 사용하는 데이터 관련 파일을 담는 폴더입니다.

- **📄 mockData.ts**: 개발 단계에서 사용될 가짜(mock) 데이터를 정의하는 파일입니다.

#### 📁 hooks/

재사용 가능한 커스텀 React 훅을 모아두는 폴더입니다.

- **📄 useAuth.ts**: 인증 관련 로직을 처리하는 커스텀 훅입니다.
- **📁 queries/**: 데이터 페칭 및 상태 관리를 위한 React Query 관련 훅을 담는 폴더입니다.
  - **📄 useTransactionsQuery.ts**: 거래 내역을 조회하는(fetch) 커스텀 훅입니다.
  - **📄 useTransactionsMutation.ts**: 거래 내역을 생성, 수정, 삭제하는 커스텀 훅입니다.

#### 📁 pages/

애플리케이션의 각 페이지를 구성하는 컴포넌트를 담는 폴더입니다.

- **📄 DashboardPage.css**: `DashboardPage` 컴포넌트에 적용되는 CSS 스타일 파일입니다.
- **📄 DashboardPage.tsx**: 대시보드 페이지의 메인 컴포넌트입니다.
- **📄 ProfilePage.tsx**: 마이페이지의 메인 컴포넌트입니다.
- **📄 ProfilePage.module.css**: `ProfilePage` 컴포넌트의 전용 CSS 모듈 파일입니다.
- **📄 StatsPage.tsx**: 통계 페이지의 메인 컴포넌트입니다.
- **📄 TransactionListPage.module.css**: `TransactionListPage` 컴포넌트의 전용 CSS 모듈 파일입니다.
- **📄 TransactionListPage.tsx**: 전체 거래 내역을 조회, 수정, 삭제하는 페이지의 메인 컴포넌트입니다.

#### 📁 types/

TypeScript에서 사용되는 타입 정의들을 모아두는 폴더입니다.

- **📄 category.ts**: 카테고리 관련 타입(interface, type)을 정의하는 파일입니다.
- **📄 icon.ts**: 아이콘 관련 타입을 정의하는 파일입니다.
- **📄 transaction.ts**: 거래 내역 관련 타입을 정의하는 파일입니다.
- **📄 ui.ts**: UI 요소와 관련된 공통 타입을 정의하는 파일입니다.

#### 📁 utils/

애플리케이션 전반에서 사용되는 유틸리티 함수들을 모아두는 폴더입니다.

- **📄 storage.ts**: 로컬 스토리지 관련 유틸리티 함수들을 정의하는 파일입니다.
