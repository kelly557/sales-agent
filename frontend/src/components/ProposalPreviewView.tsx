import { Button, Input, Tag } from "antd";
import {
  CaretLeftOutlined,
  CaretRightOutlined,
  CloseOutlined,
  CloudDownloadOutlined,
  EditOutlined,
  FileTextOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import styles from "./ProposalPage.module.css";

export interface ProposalPreviewItem {
  name: string;
  type: string;
  version?: string;
  content?: string;
}

interface ProposalPreviewViewProps {
  item: ProposalPreviewItem;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function ProposalPreviewView({ item, isOpen, onToggle, onClose }: ProposalPreviewViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(item.content ?? "");
  const [saved, setSaved] = useState(item.content ?? "");

  function commit() {
    setSaved(draft);
    setIsEditing(false);
  }

  function cancel() {
    setDraft(saved);
    setIsEditing(false);
  }

  return (
    <aside
      className={`${styles.previewDrawer} ${isOpen ? styles.previewDrawerOpen : styles.previewDrawerCollapsed}`}
      aria-label="文档预览"
      aria-expanded={isOpen}
    >
      <header className={styles.previewHeader}>
        <div className={styles.previewHeaderTop}>
          <Button
            type="text"
            size="small"
            className={styles.previewToggle}
            icon={isOpen ? <CaretRightOutlined /> : <CaretLeftOutlined />}
            onClick={onToggle}
            aria-label={isOpen ? "折叠预览" : "展开预览"}
          />
          {isOpen ? (
            <Button
              type="text"
              size="small"
              className={styles.previewClose}
              icon={<CloseOutlined />}
              onClick={onClose}
              aria-label="关闭预览"
            />
          ) : null}
        </div>
        {isOpen ? (
          <>
            <div className={styles.previewTitleBlock}>
              <div className={styles.previewTitleRow}>
                <FileTextOutlined className={styles.previewTitleIcon} />
                <h2 className={styles.previewTitle}>{item.name}</h2>
              </div>
              <div className={styles.previewMetaRow}>
                <Tag color="blue" className={styles.previewVersionTag}>
                  {item.version ?? "V1.0"}
                </Tag>
                <span className={styles.previewMeta}>最新版本</span>
              </div>
            </div>
            <div className={styles.previewHeaderActions}>
              <Button size="small" icon={<CloudDownloadOutlined />}>
                下载
              </Button>
              <Button size="small" icon={<ShareAltOutlined />}>
                分享
              </Button>
              {isEditing ? (
                <>
                  <Button size="small" onClick={cancel}>
                    取消
                  </Button>
                  <Button size="small" type="primary" onClick={commit}>
                    保存
                  </Button>
                </>
              ) : (
                <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                  编辑
                </Button>
              )}
            </div>
          </>
        ) : null}
      </header>

      {isOpen ? (
        <div className={styles.previewBody}>
          <div className={styles.previewCanvas} data-editing={isEditing ? "true" : undefined}>
            {isEditing ? (
              <Input.TextArea
                className={styles.previewEditor}
                autoSize={{ minRows: 18, maxRows: 32 }}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
            ) : (
              <pre className={styles.previewContent}>{saved || "（暂无内容）"}</pre>
            )}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
