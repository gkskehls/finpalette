export interface Transaction {
  localId: string; // 클라이언트 전용 임시 ID (React key 용)
  id: string | null; // 서버 DB ID (동기화 상태 확인용)
  date: string; // "YYYY-MM-DD"
  type: string; // 거래 타입 코드 (예: 'inc', 'exp')
  amount: number;
  category_code: string; // 카테고리 코드 (Category.code 참조)
  description: string;
  palette_id: string; // 이 거래내역이 속한 팔레트의 ID
  user_id: string; // 작성자의 ID
  private_memo?: string; // 나만 볼 수 있는 시크릿 메모
}
