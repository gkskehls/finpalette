import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';
import type { Transaction } from '../types/transaction';

// 로컬 스토리지의 거래 내역 타입 (서버 ID가 없음)
type LocalTransaction = Omit<Transaction, 'id'> & { id: null };

/**
 * 사용자를 위한 개인 팔레트를 찾거나, 없으면 새로 생성합니다.
 * @param user - 현재 로그인된 Supabase 사용자 객체
 * @returns 팔레트의 ID
 */
async function getOrCreatePersonalPalette(user: User): Promise<string> {
  // 1. 사용자가 소유한 개인 팔레트가 있는지 확인합니다.
  const { data: existingPalettes, error: selectError } = await supabase
    .from('palettes')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1);

  if (selectError) {
    throw new Error('Error fetching user palette: ' + selectError.message);
  }

  // 2. 이미 팔레트가 있으면 해당 ID를 반환합니다.
  if (existingPalettes && existingPalettes.length > 0) {
    return existingPalettes[0].id;
  }

  // 3. 팔레트가 없으면 새로 생성합니다.
  const { data: newPalette, error: insertError } = await supabase
    .from('palettes')
    .insert({
      name: 'My Palette', // 기본 팔레트 이름
      owner_id: user.id,
    })
    .select('id')
    .single();

  if (insertError) {
    throw new Error('Error creating personal palette: ' + insertError.message);
  }
  if (!newPalette) {
    throw new Error('Failed to create or retrieve palette.');
  }

  // 4. 새로 생성된 팔레트의 멤버로 자신을 추가합니다.
  const { error: memberInsertError } = await supabase
    .from('palette_members')
    .insert({
      palette_id: newPalette.id,
      user_id: user.id,
      role: 'owner',
    });

  if (memberInsertError) {
    throw new Error(
      'Error adding user to palette members: ' + memberInsertError.message
    );
  }

  return newPalette.id;
}

/**
 * 로컬 스토리지의 게스트 데이터를 Supabase로 마이그레이션합니다.
 * @param user - 현재 로그인된 Supabase 사용자 객체
 */
export async function migrateGuestData(user: User): Promise<boolean> {
  console.log('Starting data migration for user:', user.id);

  // 1. 로컬 스토리지에서 'transactions' 데이터를 가져옵니다.
  const localData = localStorage.getItem('transactions');
  if (!localData) {
    console.log('No local data to migrate. Skipping.');
    return false; // 마이그레이션 할 데이터 없음
  }

  try {
    const localTransactions: LocalTransaction[] = JSON.parse(localData);
    if (localTransactions.length === 0) {
      console.log('Local transactions are empty. Skipping.');
      localStorage.removeItem('transactions'); // 비어있는 데이터는 삭제
      return false;
    }

    // 2. 사용자의 개인 팔레트 ID를 확보합니다.
    const paletteId = await getOrCreatePersonalPalette(user);

    // 3. 로컬 데이터를 Supabase 형식에 맞게 변환합니다.
    const transactionsToInsert = localTransactions.map((tx) => ({
      palette_id: paletteId,
      date: tx.date,
      type: tx.type,
      amount: tx.amount,
      category_code: tx.category_code,
      description: tx.description,
    }));

    // 4. 변환된 데이터를 Supabase 'transactions' 테이블에 삽입합니다.
    const { error } = await supabase
      .from('transactions')
      .insert(transactionsToInsert);

    if (error) {
      throw new Error('Error inserting migrated data: ' + error.message);
    }

    // 5. 마이그레이션 성공 시 로컬 데이터를 삭제합니다.
    localStorage.removeItem('transactions');
    console.log(
      `Successfully migrated ${transactionsToInsert.length} transactions.`
    );
    return true; // 마이그레이션 성공
  } catch (error) {
    console.error('Data migration failed:', error);
    // 실패 시 로컬 데이터는 유지하여 다음 로그인 시 재시도할 수 있도록 합니다.
    return false; // 마이그레이션 실패
  }
}
