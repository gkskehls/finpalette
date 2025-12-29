import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';
import type { Transaction } from '../types/transaction';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../config/constants';

// 로컬 스토리지의 거래 내역 타입 (서버 ID가 없음)
type LocalTransaction = Omit<Transaction, 'id'> & { id: null };

/**
 * 팔레트에 기본 카테고리들을 생성합니다. (멱등성 보장)
 * @param paletteId - 카테고리를 추가할 팔레트의 ID
 */
async function ensureDefaultCategories(paletteId: string): Promise<void> {
  const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
  const categoriesToInsert = allCategories.map((category) => ({
    code: category.code,
    name: category.name,
    color: category.color,
    icon: category.icon,
    palette_id: paletteId,
  }));

  // onConflict 대신 upsert 사용
  const { error } = await supabase
    .from('categories')
    .upsert(categoriesToInsert, { onConflict: 'palette_id, code' });

  if (error) {
    // 이미 존재하는 경우 무시하거나 에러 로깅
    console.warn('Warning ensuring default categories: ' + error.message);
  } else {
    console.log('Default categories are ensured for the palette.');
  }
}

/**
 * 사용자를 위한 개인 팔레트를 찾거나 생성하고, 멤버와 카테고리를 보장합니다.
 * @param user - 현재 로그인된 Supabase 사용자 객체
 * @returns 팔레트의 ID
 */
async function getOrCreatePersonalPalette(user: User): Promise<string> {
  // 1. 기존 팔레트 확인 (내가 소유한 팔레트 중 첫 번째)
  // single() 대신 limit(1)을 사용하여 데이터가 없을 때 에러가 아닌 빈 배열을 받도록 함
  const { data: existingPalettes, error: fetchError } = await supabase
    .from('palettes')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1);

  if (fetchError) {
    console.error('Error fetching existing palette:', fetchError);
  }

  if (existingPalettes && existingPalettes.length > 0) {
    const paletteId = existingPalettes[0].id;
    console.log(`Existing palette found: ${paletteId}`);

    // 기존 팔레트라면 카테고리가 없을 수 있으므로 보장
    await ensureDefaultCategories(paletteId);
    return paletteId;
  }

  // 2. 팔레트가 없으면 RPC를 통해 안전하게 생성 (멤버, 카테고리 자동 생성됨)
  console.log('No existing palette found. Creating new one via RPC...');
  const { data: newPaletteId, error: rpcError } = await supabase.rpc(
    'create_palette',
    {
      name: '나의 가계부',
      theme_color: '#6366F1',
    }
  );

  if (rpcError) {
    throw new Error(
      'Error creating personal palette via RPC: ' + rpcError.message
    );
  }

  if (!newPaletteId) {
    throw new Error('Failed to create palette: No ID returned');
  }

  console.log(`New palette created via RPC: ${newPaletteId}`);
  return newPaletteId;
}

/**
 * 로컬 스토리지의 게스트 데이터를 Supabase로 마이그레이션합니다.
 * @param user - 현재 로그인된 Supabase 사용자 객체
 */
export async function migrateGuestData(user: User): Promise<boolean> {
  console.log('Starting data migration for user:', user.id);

  const localData = localStorage.getItem('transactions');

  // 로컬 데이터가 없더라도 팔레트는 하나 있어야 하므로 생성 시도
  if (!localData) {
    console.log('No local data to migrate. Ensuring palette exists.');
    try {
      await getOrCreatePersonalPalette(user);
    } catch (e) {
      console.error('Failed to ensure palette exists:', e);
    }
    return false;
  }

  try {
    const localTransactions: LocalTransaction[] = JSON.parse(localData);
    if (localTransactions.length === 0) {
      console.log('Local transactions are empty. Ensuring palette exists.');
      localStorage.removeItem('transactions');
      try {
        await getOrCreatePersonalPalette(user);
      } catch (e) {
        console.error('Failed to ensure palette exists:', e);
      }
      return false;
    }

    const paletteId = await getOrCreatePersonalPalette(user);

    const transactionsToInsert = localTransactions.map((tx) => ({
      palette_id: paletteId,
      user_id: user.id,
      date: tx.date,
      type: tx.type,
      amount: tx.amount,
      category_code: tx.category_code,
      description: tx.description,
    }));

    const { error } = await supabase
      .from('transactions')
      .insert(transactionsToInsert);

    if (error) {
      throw new Error('Error inserting migrated data: ' + error.message);
    }

    localStorage.removeItem('transactions');
    console.log(
      `Successfully migrated ${transactionsToInsert.length} transactions.`
    );
    return true;
  } catch (error) {
    console.error('Data migration failed:', error);
    return false;
  }
}
