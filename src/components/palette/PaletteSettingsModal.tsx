import React, { useState } from 'react';
import { X, UserPlus, Copy, Check } from 'lucide-react';
import styles from './PaletteSettingsModal.module.css';
import { useCreateInvitationMutation } from '../../hooks/queries/useCreateInvitationMutation';
import type { Palette } from '../../types/palette';

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

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>기본 정보</h3>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: palette.theme_color,
              }}
            />
            <span style={{ fontWeight: 600, fontSize: '1rem' }}>
              {palette.name}
            </span>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>멤버 초대</h3>
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
                <button className={styles.copyButton} onClick={handleCopyLink}>
                  {isCopied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
