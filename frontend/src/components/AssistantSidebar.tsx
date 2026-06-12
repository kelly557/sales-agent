import { DeleteOutlined, EditOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { App as AntApp, Dropdown, Input, Tag } from "antd";
import { useState } from "react";
import type { AssistantConversation } from "./AssistantPage";
import { mockAssistantConversations } from "./mockAssistantConversations";
import styles from "./AssistantPage.module.css";

interface AssistantSidebarProps {
  conversations: AssistantConversation[];
  activeConversationId: string | null;
  onStartNewConversation: () => void;
  onOpenConversation: (conversationId: string) => void;
  onRenameConversation: (conversationId: string, nextTitle: string) => void;
  onDeleteConversation: (conversationId: string) => void;
}

export function AssistantSidebar({
  conversations,
  activeConversationId,
  onStartNewConversation,
  onOpenConversation,
  onRenameConversation,
  onDeleteConversation,
}: AssistantSidebarProps) {
  const displayConversations = conversations.length > 0 ? conversations : mockAssistantConversations;
  const sortedConversations = [...displayConversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <aside className={styles.conversationSidebar} aria-label="历史对话">
      <button
        className={styles.sidebarNewButton}
        type="button"
        onClick={onStartNewConversation}
      >
        <PlusOutlined />
        <span>新对话</span>
      </button>

      <div className={styles.sidebarHeader}>
        <span>历史对话</span>
        <Tag color="default">{sortedConversations.length}</Tag>
      </div>

      {sortedConversations.length === 0 ? (
        <div className={styles.sidebarEmpty}>还没有对话，发送第一条消息后会自动保存。</div>
      ) : (
        <ul className={styles.sidebarList}>
          {sortedConversations.map((conversation) => (
            <ConversationRow
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              isMock={conversations.length === 0}
              onOpen={() => onOpenConversation(conversation.id)}
              onRename={(nextTitle) => onRenameConversation(conversation.id, nextTitle)}
              onDelete={() => onDeleteConversation(conversation.id)}
            />
          ))}
        </ul>
      )}
    </aside>
  );
}

interface ConversationRowProps {
  conversation: AssistantConversation;
  isActive: boolean;
  isMock: boolean;
  onOpen: () => void;
  onRename: (nextTitle: string) => void;
  onDelete: () => void;
}

function ConversationRow({ conversation, isActive, isMock, onOpen, onRename, onDelete }: ConversationRowProps) {
  const { modal: modalApi } = AntApp.useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(conversation.title);

  function commitRename() {
    onRename(draftTitle);
    setIsEditing(false);
  }

  function handleDelete() {
    if (isMock) {
      modalApi.info({
        title: "示例数据不可删除",
        content: "请先发送一条消息生成真实对话后再试。",
      });
      return;
    }
    modalApi.confirm({
      title: `删除对话「${conversation.title}」？`,
      content: "删除后无法恢复，但已生成的对话内容将一并清理。",
      okText: "删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: () => onDelete(),
    });
  }

  function handleMenuClick(key: string) {
    if (key === "rename") {
      setDraftTitle(conversation.title);
      setIsEditing(true);
      return;
    }
    if (key === "delete") {
      handleDelete();
    }
  }

  return (
    <li
      className={`${styles.conversationRow} ${isActive ? styles.conversationRowActive : ""}`}
      data-active={isActive ? "true" : undefined}
    >
      {isEditing ? (
        <Input
          autoFocus
          size="small"
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          onPressEnter={commitRename}
          onBlur={commitRename}
          maxLength={32}
        />
      ) : (
        <button
          className={styles.conversationButton}
          type="button"
          onClick={onOpen}
          title={conversation.title}
        >
          {conversation.title}
        </button>
      )}

      <Dropdown
        trigger={["click"]}
        menu={{
          items: [
            { key: "rename", label: "重命名", icon: <EditOutlined />, disabled: isMock },
            {
              key: "delete",
              label: "删除",
              icon: <DeleteOutlined />,
              danger: true,
              disabled: isMock,
            },
          ],
          onClick: ({ key }) => handleMenuClick(key),
        }}
      >
        <button
          className={styles.conversationMenu}
          type="button"
          aria-label="更多操作"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreOutlined />
        </button>
      </Dropdown>
    </li>
  );
}
