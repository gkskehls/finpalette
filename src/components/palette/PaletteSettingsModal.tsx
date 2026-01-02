import { useState, useRef, useEffect } from 'react';
import {
  X,
  UserPlus,
  Copy,
  Check,
  Users,
  MoreVertical,
  LogOut,
  Trash2,
  Shield,
  User,
  Settings,
} from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './PaletteSettingsModal.module.css';
import { useCreateInvitationMutation } from '../../hooks/queries/useCreateInvitationMutation';
import { usePaletteMembersQuery } from '../../hooks/queries/usePaletteMembersQuery';
import {
  useDeletePaletteMutation,
  useRemoveMemberMutation,
  useUpdateMemberRoleMutation,
  useUpdatePaletteMutation,
} from '../../hooks/queries/usePaletteManagementMutation';
import { useAuth } from '../../hooks/useAuth';
import type { Palette, PaletteMember } from '../../types/palette';

const THEME_COLORS = [
  '#6366F1', // Indigo (Default)
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#64748B', // Slate
  '#14B8A6', // Teal
  '#F97316', // Orange
];

// --- MemberItem 컴포넌트 ---
const MemberItem = ({
  member,
  currentUserId,
  isCurrentUserOwner,
  paletteId,
}: {
  member: PaletteMember;
  currentUserId: string | undefined;
  isCurrentUserOwner: boolean;
  paletteId: string;
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const removeMemberMutation = useRemoveMemberMutation();
  const updateRoleMutation = useUpdateMemberRoleMutation();

  const isMe = member.user_id === currentUserId;
  const isOwner = member.role === 'owner';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRemove = () => {
    const message = isMe
      ? '정말 이 팔레트에서 나가시겠습니까?'
      : '정말 이 멤버를 추방하시겠습니까?';

    if (window.confirm(message)) {
      const promise = removeMemberMutation.mutateAsync({
        paletteId,
        userId: member.user_id,
      });

      toast.promise(promise, {
        loading: '처리 중...',
        success: isMe ? '팔레트에서 나갔습니다.' : '멤버를 추방했습니다.',
        error: '요청 처리에 실패했습니다.',
      });
    }
    setIsDropdownOpen(false);
  };

  const handleRoleChange = (newRole: 'admin' | 'editor' | 'viewer') => {
    const promise = updateRoleMutation.mutateAsync({
      paletteId,
      userId: member.user_id,
      role: newRole,
    });

    toast.promise(promise, {
      loading: '권한 변경 중...',
      success: '권한이 변경되었습니다.',
      error: '권한 변경에 실패했습니다.',
    });
    setIsDropdownOpen(false);
  };

  const getAvatarUrl = () => {
    if (member.avatar_url) return member.avatar_url;
    const nameParam =
      member.full_name || member.email || member.user_id.substring(0, 2);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nameParam)}&background=random&color=fff`;
  };

  const getDisplayName = () =>
    member.full_name || member.email || '알 수 없는 멤버';

  const showMenu = (isCurrentUserOwner && !isMe) || (isMe && !isOwner);

  return (
    <li className={styles.memberItem}>
      <img
        src={getAvatarUrl()}
        alt={getDisplayName()}
        className={styles.avatar}
      />
      <div className={styles.memberInfo}>
        <span className={styles.memberName}>
          {getDisplayName()}
          {isMe && <span className={styles.myBadge}>나</span>}
        </span>
        <span className={styles.memberRole}>{member.role}</span>
      </div>

      {showMenu && (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            className={styles.moreButton}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <MoreVertical size={18} />
          </button>

          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
              {isCurrentUserOwner && !isMe && (
                <>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => handleRoleChange('admin')}
                  >
                    <Shield size={16} /> 관리자로 변경
                  </button>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => handleRoleChange('editor')}
                  >
                    <User size={16} /> 작성자로 변경
                  </button>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => handleRoleChange('viewer')}
                  >
                    <User size={16} /> 뷰어로 변경
                  </button>
                  <div
                    style={{
                      height: '1px',
                      backgroundColor: 'var(--border-color)',
                      margin: '4px 0',
                    }}
                  />
                </>
              )}
              <button
                className={`${styles.dropdownItem} ${styles.danger}`}
                onClick={handleRemove}
              >
                <LogOut size={16} /> {isMe ? '나가기' : '추방하기'}
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
};

// --- MemberList 컴포넌트 ---
const MemberList = ({ paletteId }: { paletteId: string }) => {
  const { user } = useAuth();
  const { data: members, isLoading, error } = usePaletteMembersQuery(paletteId);

  if (isLoading) return <div>멤버 목록을 불러오는 중...</div>;
  if (error) return <div>오류: {error.message}</div>;

  const currentUserRole = members?.find((m) => m.user_id === user?.id)?.role;
  const isCurrentUserOwner = currentUserRole === 'owner';

  return (
    <ul className={styles.memberList}>
      {members?.map((member) => (
        <MemberItem
          key={member.id}
          member={member}
          currentUserId={user?.id}
          isCurrentUserOwner={isCurrentUserOwner}
          paletteId={paletteId}
        />
      ))}
    </ul>
  );
};

interface PaletteSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: Palette;
}

export function PaletteSettingsModal({
  isOpen,
  onClose,
  palette,
}: PaletteSettingsModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'members' | 'settings'>('members');
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // 설정 탭 상태
  const [paletteName, setPaletteName] = useState(palette.name);
  const [themeColor, setThemeColor] = useState(palette.theme_color);

  const createInvitationMutation = useCreateInvitationMutation();
  const deletePaletteMutation = useDeletePaletteMutation();
  const updatePaletteMutation = useUpdatePaletteMutation();

  if (!isOpen) return null;

  const isOwner = palette.owner_id === user?.id;
  const hasChanges =
    paletteName !== palette.name || themeColor !== palette.theme_color;

  const handleCreateInvite = () => {
    const promise = createInvitationMutation.mutateAsync(palette.id);

    toast.promise(promise, {
      loading: '초대 링크를 생성하는 중...',
      success: (data) => {
        const link = `${window.location.origin}/invite?code=${data.code}`;
        setInviteLink(link);
        return '초대 링크가 생성되었습니다!';
      },
      error: '초대 링크 생성에 실패했습니다.',
    });
  };

  const handleCopyLink = async () => {
    if (inviteLink) {
      try {
        await navigator.clipboard.writeText(inviteLink);
        setIsCopied(true);
        toast.success('링크가 복사되었습니다!');
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
        toast.error('복사에 실패했습니다.');
      }
    }
  };

  const handleUpdatePalette = () => {
    if (!hasChanges) return;

    const promise = updatePaletteMutation.mutateAsync({
      paletteId: palette.id,
      name: paletteName,
      themeColor: themeColor,
    });

    toast.promise(promise, {
      loading: '설정을 저장하는 중...',
      success: '팔레트 설정이 저장되었습니다.',
      error: '설정 저장에 실패했습니다.',
    });
  };

  const handleDeletePalette = () => {
    const inputName = window.prompt(
      `정말 '${palette.name}' 팔레트를 삭제하시겠습니까?\n삭제하려면 팔레트 이름을 똑같이 입력하세요.`
    );

    if (inputName === palette.name) {
      const promise = deletePaletteMutation.mutateAsync(palette.id);

      toast
        .promise(promise, {
          loading: '팔레트를 삭제하는 중...',
          success: '팔레트가 삭제되었습니다.',
          error: '팔레트 삭제에 실패했습니다.',
        })
        .then(() => {
          onClose();
          window.location.reload();
        });
    } else if (inputName !== null) {
      toast.error('팔레트 이름이 일치하지 않습니다.');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>팔레트 설정</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* 탭 메뉴 */}
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tabButton} ${activeTab === 'members' ? styles.active : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <Users size={16} />
            <span>멤버</span>
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={16} />
            <span>설정</span>
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        <div className={styles.tabContent}>
          {activeTab === 'members' && (
            <>
              {/* 초대 영역 */}
              <div className={styles.inviteBox}>
                <p className={styles.inviteDescription}>
                  초대 링크를 공유하여 가족이나 친구를 초대하세요.
                  <br />
                  (링크는 24시간 동안 유효합니다)
                </p>

                {!inviteLink ? (
                  <button
                    className={styles.inviteButton}
                    onClick={handleCreateInvite}
                    disabled={createInvitationMutation.isPending}
                  >
                    <UserPlus size={18} />
                    {createInvitationMutation.isPending
                      ? '링크 생성 중...'
                      : '초대 링크 만들기'}
                  </button>
                ) : (
                  <div className={styles.linkArea}>
                    <input
                      type="text"
                      readOnly
                      value={inviteLink}
                      className={styles.linkInput}
                    />
                    <button
                      className={styles.copyButton}
                      onClick={handleCopyLink}
                    >
                      {isCopied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                )}
              </div>

              {/* 멤버 리스트 */}
              <MemberList paletteId={palette.id} />
            </>
          )}

          {activeTab === 'settings' && (
            <div className={styles.settingsForm}>
              {/* 팔레트 이름 수정 */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>팔레트 이름</label>
                <input
                  type="text"
                  value={paletteName}
                  onChange={(e) => setPaletteName(e.target.value)}
                  className={styles.input}
                  disabled={!isOwner}
                />
              </div>

              {/* 테마 색상 변경 */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>테마 색상</label>
                <div className={styles.colorGrid}>
                  {THEME_COLORS.map((color) => (
                    <div
                      key={color}
                      className={`${styles.colorOption} ${
                        themeColor === color ? styles.selected : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => isOwner && setThemeColor(color)}
                    />
                  ))}
                </div>
              </div>

              {/* 저장 버튼 */}
              {isOwner && (
                <button
                  className={styles.saveButton}
                  onClick={handleUpdatePalette}
                  disabled={!hasChanges || updatePaletteMutation.isPending}
                >
                  {updatePaletteMutation.isPending
                    ? '저장 중...'
                    : '변경사항 저장'}
                </button>
              )}

              {/* 위험 구역 */}
              <div className={styles.dangerZone}>
                <span className={styles.dangerTitle}>위험 구역</span>
                {isOwner ? (
                  <button
                    className={styles.deletePaletteButton}
                    onClick={handleDeletePalette}
                  >
                    <Trash2 size={18} />
                    팔레트 삭제하기
                  </button>
                ) : (
                  // 멤버용 나가기 버튼은 MemberList에서 처리하므로 여기서는 안내 문구만 표시하거나 생략 가능
                  // 하지만 명시적으로 보여주는 것이 좋음
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    팔레트 나가기는 멤버 탭에서 본인 이름 옆 메뉴를
                    이용해주세요.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
