import { useState } from 'react';
import { X, UserPlus, Copy, Check, Users } from 'lucide-react';
import styles from './PaletteSettingsModal.module.css';
import { useCreateInvitationMutation } from '../../hooks/queries/useCreateInvitationMutation';
import { usePaletteMembersQuery } from '../../hooks/queries/usePaletteMembersQuery';
import { useAuth } from '../../hooks/useAuth';
import type { Palette } from '../../types/palette';

// MemberList 컴포넌트 (파일 하단에 정의)
const MemberList = ({ paletteId }: { paletteId: string }) => {
  const { user } = useAuth();
  const { data: members, isLoading, error } = usePaletteMembersQuery(paletteId);

  if (isLoading) return <div>멤버 목록을 불러오는 중...</div>;
  if (error) return <div>오류: {error.message}</div>;

  return (
    <ul className={styles.memberList}>
      {members?.map((member) => (
        <li key={member.id} className={styles.memberItem}>
          <img
            src={
              member.avatar_url ||
              `https://ui-avatars.com/api/?name=${member.email}&background=random`
            }
            alt={member.full_name || member.email || 'avatar'}
            className={styles.avatar}
          />
          <div className={styles.memberInfo}>
            <span className={styles.memberName}>
              {member.full_name || member.email}
              {member.user_id === user?.id && (
                <span className={styles.myBadge}>나</span>
              )}
            </span>
            <span className={styles.memberRole}>{member.role}</span>
          </div>
          {/* TODO: 멤버 관리 메뉴 (더보기 버튼) */}
        </li>
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
  const [activeTab, setActiveTab] = useState<'invite' | 'members'>('invite');
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const createInvitationMutation = useCreateInvitationMutation();

  if (!isOpen) return null;

  const handleCreateInvite = () => {
    createInvitationMutation.mutate(palette.id, {
      onSuccess: (data) => {
        const link = `${window.location.origin}/invite?code=${data.code}`;
        setInviteLink(link);
      },
    });
  };

  const handleCopyLink = async () => {
    if (inviteLink) {
      try {
        await navigator.clipboard.writeText(inviteLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
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
            className={`${styles.tabButton} ${activeTab === 'invite' ? styles.active : ''}`}
            onClick={() => setActiveTab('invite')}
          >
            <UserPlus size={16} />
            <span>초대</span>
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'members' ? styles.active : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <Users size={16} />
            <span>멤버 관리</span>
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        <div className={styles.tabContent}>
          {activeTab === 'invite' && (
            <div className={styles.inviteBox}>
              <p className={styles.inviteDescription}>
                초대 링크를 공유하여 가족이나 친구를 이 팔레트에 초대하세요.
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
          )}

          {activeTab === 'members' && <MemberList paletteId={palette.id} />}
        </div>
      </div>
    </div>
  );
}
