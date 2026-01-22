# 공유 가계부 알림 시스템 구축 가이드

이 문서는 Finpalette 프로젝트의 '공유 가계부 알림 시스템' 구축을 위한 상세 가이드입니다. 현재 클라이언트(PWA) 설정과 서버 코드 작성은 완료되었으며, **서버(Edge Function) 배포 및 연결 작업**이 남아있습니다.

---

## 1. 현재 진행 상황 (Status)

- **[완료] 클라이언트 (PWA):**
  - `vite.config.ts`: 커스텀 서비스 워커(`sw.js`) 설정 완료.
  - `src/sw.js`: 푸시 알림 수신 및 클릭 이벤트 처리 로직 구현 완료.
  - `src/hooks/usePushNotification.ts`: 알림 권한 요청 및 구독 관리 훅 구현 완료.
  - `src/pages/ProfilePage.tsx`: 알림 설정 UI 추가 완료.
  - `.env.local`: `VITE_VAPID_PUBLIC_KEY` 설정 완료.

- **[완료] 데이터베이스 (Supabase):**
  - `push_subscriptions` 테이블 생성 쿼리 작성 완료 (`supabase_schema.sql` 참조).
  - **[주의]** 실제 DB에 테이블 생성 및 RLS 정책 적용이 필요할 수 있음 (SQL Editor에서 확인 필요).

- **[완료] 서버 (Edge Function):**
  - `supabase/functions/notify-transaction-change/index.ts`: 알림 발송 로직 구현 완료.
  - `supabase/functions/notify-transaction-change/deno.json`: 설정 파일 생성 완료.

- **[대기] 배포 및 설정:**
  - Supabase CLI 설치 및 프로젝트 연결.
  - Edge Function 배포.
  - Database Webhook 설정.

---

## 2. 사전 준비 사항 (Prerequisites)

작업을 재개하기 전에 다음 정보들이 준비되어 있는지 확인하세요.

1.  **VAPID Public Key:** `.env.local` 파일에 `VITE_VAPID_PUBLIC_KEY`로 저장되어 있어야 함. (Firebase Console -> Project settings -> Cloud Messaging -> Web Push certificates)
2.  **FCM Server Key:** Firebase Console -> Project settings -> Cloud Messaging -> **Cloud Messaging API (Legacy)** 섹션의 **Server key**.
    - _참고: Legacy API가 비활성화되어 있다면 활성화해야 함._
3.  **Supabase Project ID:** Supabase 대시보드 URL에서 확인 가능 (`https://app.supabase.com/project/[PROJECT_ID]`).
4.  **Supabase Anon Key:** Supabase 대시보드 -> Project Settings -> API -> `anon` public key.

---

## 3. 작업 재개 가이드 (Step-by-Step)

### Step 1: Supabase CLI 설치 (Windows 기준)

Supabase Edge Function을 배포하려면 CLI 도구가 필요합니다. `scoop`을 사용하여 설치하는 것을 권장합니다.

1.  **PowerShell 실행 (일반 권한 가능)**
2.  **Scoop 설치:**
    ```powershell
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
    irm get.scoop.sh | iex
    ```
3.  **Supabase CLI 설치:**
    ```powershell
    scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
    scoop install supabase
    ```
4.  **설치 확인:**
    ```powershell
    supabase --version
    ```

### Step 2: Supabase 로그인 및 프로젝트 연결

1.  **로그인:**
    ```powershell
    supabase login
    ```

    - 브라우저가 열리면 Supabase 계정으로 로그인하고 토큰을 생성합니다.
2.  **프로젝트 연결:**
    - 프로젝트 루트 폴더(`C:/Users/sykim/IdeaProjects/finpalette`)에서 실행:
    ```powershell
    supabase link --project-ref [YOUR_PROJECT_ID]
    ```

    - `[YOUR_PROJECT_ID]`를 실제 프로젝트 ID로 교체하세요.
    - DB 비밀번호를 물어볼 수 있습니다.

### Step 3: 환경 변수 설정 (Secrets)

Edge Function이 사용할 민감한 정보를 Supabase 서버에 저장합니다.

```powershell
# 1. Supabase URL 및 Anon Key (이미 설정되어 있을 수 있음)
supabase secrets set SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
supabase secrets set SUPABASE_ANON_KEY=[YOUR_ANON_KEY]

# 2. FCM Server Key (필수)
supabase secrets set FCM_SERVER_KEY=[YOUR_FCM_SERVER_KEY]
```

### Step 4: Edge Function 배포

작성된 `notify-transaction-change` 함수를 배포합니다.

```powershell
supabase functions deploy notify-transaction-change --no-verify-jwt
```

- `--no-verify-jwt`: DB Webhook에서 호출할 때 인증 헤더 검증을 생략하기 위해 사용합니다.

### Step 5: Database Webhook 설정

데이터베이스 변경 시 Edge Function이 실행되도록 트리거를 설정합니다.

1.  **Supabase 대시보드** 접속 -> 해당 프로젝트 선택.
2.  왼쪽 메뉴에서 **Database** -> **Webhooks** 선택.
3.  **Create a new webhook** 클릭.
4.  설정 값 입력:
    - **Name:** `notify_on_transaction_change`
    - **Table:** `transactions`
    - **Events:** `INSERT`, `UPDATE` 체크.
    - **HTTP Method:** `POST`
    - **URL:** 배포된 Edge Function URL 입력.
      - 예: `https://[PROJECT_ID].supabase.co/functions/v1/notify-transaction-change`
      - URL은 `supabase functions list` 명령어로 확인 가능.
    - **HTTP Headers:**
      - `Content-Type`: `application/json`
      - `Authorization`: `Bearer [YOUR_ANON_KEY]` (필요 시 추가, `--no-verify-jwt` 옵션 사용 시 불필요할 수 있음)

---

## 4. 테스트 및 검증

1.  **알림 권한 허용:**
    - 앱(PWA) 실행 -> 마이페이지 -> '알림 설정' 켜기.
    - 브라우저 알림 권한 허용.
2.  **거래 내역 추가:**
    - 다른 기기(또는 시크릿 탭)에서 동일한 팔레트에 접속.
    - 새로운 거래 내역 추가.
3.  **알림 수신 확인:**
    - 알림 설정을 켠 기기에서 푸시 알림이 도착하는지 확인.
4.  **로그 확인:**
    - 문제 발생 시 터미널에서 로그 확인:
    ```powershell
    supabase functions logs notify-transaction-change
    ```
