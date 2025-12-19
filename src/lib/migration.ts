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

  // onConflict: 중복된 (palette_id, code) 쌍이 있으면 무시하고 넘어감
  const { error } = await supabase
    .from('categories')
    .insert(categoriesToInsert, { onConflict: 'palette_id, code' });

  if (error && error.code !== '23505') {
    // 23505는 unique_violation
    throw new Error('Error ensuring default categories: ' + error.message);
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
  // 1. 기존 팔레트 확인
  const { data: existingPalette } = await supabase
    .from('palettes')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  let paletteId: string;

  if (existingPalette) {
    paletteId = existingPalette.id;
    console.log(`Existing palette found: ${paletteId}`);
  } else {
    // 2. 팔레트가 없으면 새로 생성
    const { data: newPalette, error: insertError } = await supabase
      .from('palettes')
      .insert({ name: 'My Palette', owner_id: user.id })
      .select('id')
      .single();

    if (insertError)
      throw new Error(
        'Error creating personal palette: ' + insertError.message
      );
    if (!newPalette) throw new Error('Failed to create or retrieve palette.');

    paletteId = newPalette.id;
    console.log(`New palette created: ${paletteId}`);
  }

  // 3. 팔레트 멤버로 자신을 추가 (중복 시 무시)
  const { error: memberInsertError } = await supabase
    .from('palette_members')
    .insert(
      { palette_id: paletteId, user_id: user.id, role: 'owner' },
      { onConflict: 'palette_id, user_id' }
    );

  if (memberInsertError && memberInsertError.code !== '23505') {
    throw new Error(
      'Error ensuring user is a palette member: ' + memberInsertError.message
    );
  } else {
    console.log('User membership in palette is ensured.');
  }

  // 4. 기본 카테고리가 존재하는지 확인 및 생성
  await ensureDefaultCategories(paletteId);

  return paletteId;
}

/**
 * 로컬 스토리지의 게스트 데이터를 Supabase로 마이그레이션합니다.
 * @param user - 현재 로그인된 Supabase 사용자 객체
 */
export async function migrateGuestData(user: User): Promise<boolean> {
  console.log('Starting data migration for user:', user.id);

  const localData = localStorage.getItem('transactions');
  if (!localData) {
    console.log('No local data to migrate. Skipping.');
    return false;
  }

  try {
    const localTransactions: LocalTransaction[] = JSON.parse(localData);
    if (localTransactions.length === 0) {
      console.log('Local transactions are empty. Skipping.');
      localStorage.removeItem('transactions');
      return false;
    }

    const paletteId = await getOrCreatePersonalPalette(user);

    const transactionsToInsert = localTransactions.map((tx) => ({
      palette_id: paletteId,
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
