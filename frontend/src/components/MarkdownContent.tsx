import type { ReactNode } from "react";
import styles from "./MarkdownContent.module.css";

export function MarkdownContent({ content }: { content: string }) {
  const blocks = parseMarkdownBlocks(content);
  return <div className={styles.markdown}>{blocks}</div>;
}

function parseMarkdownBlocks(content: string) {
  const lines = content.split(/\r?\n/);
  const state = createMarkdownState();
  for (const line of lines) {
    processMarkdownLine(state, line);
  }
  flushAllMarkdown(state);
  return state.blocks;
}

interface MarkdownState {
  blocks: ReactNode[];
  paragraph: string[];
  listItems: string[];
  codeLines: string[];
  isCodeBlock: boolean;
  key: number;
}

function createMarkdownState(): MarkdownState {
  return { blocks: [], paragraph: [], listItems: [], codeLines: [], isCodeBlock: false, key: 0 };
}

function processMarkdownLine(state: MarkdownState, line: string) {
  if (line.trim().startsWith("```")) {
    toggleCodeBlock(state);
    return;
  }
  if (state.isCodeBlock) {
    state.codeLines.push(line);
    return;
  }
  if (!line.trim()) {
    flushParagraph(state);
    flushList(state);
    return;
  }
  const heading = line.match(/^(#{1,4})\s+(.+)$/);
  if (heading) {
    flushParagraph(state);
    flushList(state);
    pushHeading(state, heading);
    return;
  }
  const listItem = line.match(/^\s*[-*]\s+(.+)$/);
  const numberedItem = line.match(/^\s*\d+\.\s+(.+)$/);
  if (listItem || numberedItem) {
    flushParagraph(state);
    state.listItems.push((listItem?.[1] ?? numberedItem?.[1] ?? "").trim());
    return;
  }
  flushList(state);
  state.paragraph.push(line.trim());
}

function toggleCodeBlock(state: MarkdownState) {
  if (state.isCodeBlock) {
    flushCode(state);
    state.isCodeBlock = false;
  } else {
    flushParagraph(state);
    flushList(state);
    state.isCodeBlock = true;
  }
}

function pushHeading(state: MarkdownState, heading: RegExpMatchArray) {
  const level = Math.min(heading[1].length, 4);
  const TagName = `h${level}` as "h1" | "h2" | "h3" | "h4";
  state.blocks.push(<TagName key={`h-${state.key++}`}>{renderInlineMarkdown(heading[2])}</TagName>);
}

function flushAllMarkdown(state: MarkdownState) {
  flushParagraph(state);
  flushList(state);
  if (state.isCodeBlock) flushCode(state);
}

function flushParagraph(state: MarkdownState) {
  if (state.paragraph.length === 0) return;
  state.blocks.push(
    <p key={`p-${state.key++}`}>{renderInlineMarkdown(state.paragraph.join(" "))}</p>,
  );
  state.paragraph = [];
}

function flushList(state: MarkdownState) {
  if (state.listItems.length === 0) return;
  state.blocks.push(
    <ul key={`ul-${state.key++}`}>
      {state.listItems.map((item, index) => (
        <li key={`${item}-${index}`}>{renderInlineMarkdown(item)}</li>
      ))}
    </ul>,
  );
  state.listItems = [];
}

function flushCode(state: MarkdownState) {
  state.blocks.push(
    <pre key={`code-${state.key++}`}>
      <code>{state.codeLines.join("\n")}</code>
    </pre>,
  );
  state.codeLines = [];
}

function renderInlineMarkdown(content: string) {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let cursor = 0;
  for (const match of content.matchAll(pattern)) {
    if (match.index > cursor) {
      nodes.push(content.slice(cursor, match.index));
    }
    const value = match[0];
    if (value.startsWith("**")) {
      nodes.push(<strong key={`${value}-${match.index}`}>{value.slice(2, -2)}</strong>);
    } else {
      nodes.push(<code key={`${value}-${match.index}`}>{value.slice(1, -1)}</code>);
    }
    cursor = match.index + value.length;
  }
  if (cursor < content.length) {
    nodes.push(content.slice(cursor));
  }
  return nodes;
}
