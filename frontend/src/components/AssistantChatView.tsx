import { AudioOutlined, PaperClipOutlined, RobotOutlined, SendOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Input } from "antd";
import { MarkdownContent } from "./MarkdownContent";
import type { ChatMessage } from "./AssistantPage";
import styles from "./AssistantChat.module.css";

interface AssistantChatViewProps {
  title: string;
  messages: ChatMessage[];
  latestError: ChatMessage | undefined;
  composerSlot: React.ReactNode;
}

export function AssistantChatView({ title, messages, latestError, composerSlot }: AssistantChatViewProps) {
  return (
    <section className={styles.chatPage} aria-label="AI 对话页面">
      <div className={styles.chatHeader}>
        <h2>{title}</h2>
      </div>

      <div className={styles.messageList}>
        {messages.map((item) => (
          <article className={item.role === "user" ? styles.userMessage : styles.assistantMessage} key={item.id}>
            <div className={styles.messageAvatar}>{item.role === "user" ? <UserOutlined /> : <RobotOutlined />}</div>
            <div className={styles.messageBubble}>
              <div className={styles.messageAuthor}>{item.role === "user" ? "你" : "qwen3.6-plus"}</div>
              {item.status === "error" ? (
                <Alert type="error" showIcon message={item.content} />
              ) : item.content ? (
                <MarkdownContent content={item.content} />
              ) : (
                <span className={styles.cursorText}>正在生成...</span>
              )}
              {item.status === "streaming" && item.content ? <span className={styles.streamCursor} /> : null}
            </div>
          </article>
        ))}
      </div>

      {latestError ? <Alert type="error" showIcon message={latestError.content} /> : null}

      {composerSlot}
    </section>
  );
}

interface AssistantComposerProps {
  prompt: string;
  isSubmitting: boolean;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  className?: string;
}

export function AssistantComposer({ prompt, isSubmitting, onPromptChange, onSubmit, className }: AssistantComposerProps) {
  const composerClass = className ? `${styles.composer} ${className}` : styles.composer;
  return (
    <div className={composerClass}>
      <div className={styles.composerTools} aria-label="对话输入操作">
        <Button type="text" icon={<PaperClipOutlined />} aria-label="上传文件" />
        <Button type="text" icon={<AudioOutlined />} aria-label="语音输入" />
      </div>
      <Input.TextArea
        autoSize={{ minRows: 3, maxRows: 6 }}
        placeholder="输入客户需求、项目线索或销售材料任务，例如：基于客户现场情况生成净化解决方案 PPT"
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        onPressEnter={(event) => {
          if (event.shiftKey) return;
          event.preventDefault();
          onSubmit();
        }}
      />
      <Button type="primary" icon={<SendOutlined />} loading={isSubmitting} onClick={onSubmit}>
        发送
      </Button>
    </div>
  );
}
