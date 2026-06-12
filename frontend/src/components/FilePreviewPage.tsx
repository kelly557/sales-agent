import { useMemo, useState } from "react";
import { Button, Empty, Tag } from "antd";
import {
  ArrowLeftOutlined,
  CloudDownloadOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileWordOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import {
  projectFileTypeLabels,
  projects as initialProjects,
  type ProjectFile,
  type ProjectFileType,
  type ProjectItem,
} from "./projectData";
import styles from "./FilePreviewPage.module.css";

interface FilePreviewPageProps {
  projectId: string;
  fileId: string;
  onBack: () => void;
}

interface SlideContent {
  key: string;
  title: string;
  content: string;
}

const fileTypeIcon: Record<ProjectFileType, JSX.Element> = {
  ppt: <FileTextOutlined />,
  word: <FileWordOutlined />,
  excel: <FileExcelOutlined />,
  pdf: <FilePdfOutlined />,
  image: <FileImageOutlined />,
};

const projectFallback: ProjectItem | null = null;

export function FilePreviewPage({ projectId, fileId, onBack }: FilePreviewPageProps) {
  const project = useMemo(
    () => initialProjects.find((item) => item.id === projectId) ?? projectFallback,
    [projectId],
  );
  const file = useMemo(
    () => project?.files.find((item) => item.id === fileId) ?? null,
    [project, fileId],
  );

  if (!project || !file) {
    return (
      <div className={styles.notFound}>
        <Empty description="未找到对应的项目文件" />
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={onBack}>
          返回项目管理
        </Button>
      </div>
    );
  }

  return <FilePreviewBody project={project} file={file} onBack={onBack} />;
}

interface FilePreviewBodyProps {
  project: ProjectItem;
  file: ProjectFile;
  onBack: () => void;
}

function FilePreviewBody({ project, file, onBack }: FilePreviewBodyProps) {
  const slides = useMemo(() => buildSlideContent(file), [file]);
  const [activeSlideKey, setActiveSlideKey] = useState<string | null>(slides[0]?.key ?? null);
  const activeSlide = slides.find((slide) => slide.key === activeSlideKey) ?? slides[0] ?? null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack}>
            返回项目管理
          </Button>
          <div className={styles.titleBlock}>
            <div className={styles.titleRow}>
              <span className={styles.titleIcon}>{fileTypeIcon[file.type]}</span>
              <h1 className={styles.title}>{file.name}</h1>
              <Tag color="blue">{file.version}</Tag>
              <Tag color="default">{projectFileTypeLabels[file.type]}</Tag>
            </div>
            <div className={styles.breadcrumb}>
              <span>{project.name}</span>
              <span className={styles.breadcrumbDivider}>/</span>
              <span>{project.customer}</span>
              <span className={styles.breadcrumbDivider}>/</span>
              <span>文件预览</span>
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button icon={<ShareAltOutlined />}>分享</Button>
          <Button type="primary" icon={<CloudDownloadOutlined />}>
            下载原文件
          </Button>
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.thumbnails}>
          <div className={styles.thumbnailsHeader}>
            <span>页面导航</span>
            <span className={styles.thumbnailsCount}>{slides.length} 页</span>
          </div>
          {file.type === "image" || file.type === "pdf" ? (
            <ul className={styles.thumbList}>
              {slides.map((slide, index) => (
                <li
                  key={slide.key}
                  className={`${styles.thumbItem} ${activeSlideKey === slide.key ? styles.thumbItemActive : ""}`}
                  onClick={() => setActiveSlideKey(slide.key)}
                >
                  <div className={styles.thumbIndex}>{String(index + 1).padStart(2, "0")}</div>
                  <div className={styles.thumbTitle}>{slide.title}</div>
                </li>
              ))}
            </ul>
          ) : (
            <ul className={styles.thumbList}>
              {slides.map((slide, index) => (
                <li
                  key={slide.key}
                  className={`${styles.thumbItem} ${activeSlideKey === slide.key ? styles.thumbItemActive : ""}`}
                  onClick={() => setActiveSlideKey(slide.key)}
                >
                  <div className={styles.thumbPreview} data-type={file.type}>
                    <div className={styles.thumbPreviewTitle}>{slide.title}</div>
                    <div className={styles.thumbPreviewLines}>
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                  <div className={styles.thumbIndex}>{String(index + 1).padStart(2, "0")}</div>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className={styles.canvas}>
          <div className={styles.canvasToolbar}>
            <span className={styles.canvasPager}>
              {activeSlide ? `${activeSlideIndex(activeSlide, slides)} / ${slides.length}` : `0 / ${slides.length}`}
            </span>
            <span className={styles.canvasName}>{activeSlide?.title ?? "（暂无内容）"}</span>
            <div className={styles.canvasActions}>
              <Button
                size="small"
                disabled={!activeSlide || slides.findIndex((s) => s.key === activeSlide.key) === 0}
                onClick={() => gotoSlide(slides, activeSlide, setActiveSlideKey, "prev")}
              >
                上一页
              </Button>
              <Button
                size="small"
                disabled={
                  !activeSlide ||
                  slides.findIndex((s) => s.key === activeSlide.key) >= slides.length - 1
                }
                onClick={() => gotoSlide(slides, activeSlide, setActiveSlideKey, "next")}
              >
                下一页
              </Button>
            </div>
          </div>
          <div className={styles.canvasStage} data-type={file.type}>
            {activeSlide ? (
              <article className={styles.canvasPage}>
                <header className={styles.canvasPageHeader}>
                  <span className={styles.canvasPageBadge}>
                    {fileTypeIcon[file.type]} {projectFileTypeLabels[file.type]}
                  </span>
                  <h2 className={styles.canvasPageTitle}>{activeSlide.title}</h2>
                </header>
                <div className={styles.canvasPageBody}>
                  {renderPageBody(file.type, activeSlide)}
                </div>
                <footer className={styles.canvasPageFooter}>
                  <span>{project.name}</span>
                  <span>{file.version}</span>
                </footer>
              </article>
            ) : (
              <Empty description="该文件暂无可预览内容" />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function activeSlideIndex(slide: SlideContent, slides: SlideContent[]): number {
  return slides.findIndex((s) => s.key === slide.key) + 1;
}

function gotoSlide(
  slides: SlideContent[],
  active: SlideContent | null,
  setKey: (key: string) => void,
  direction: "prev" | "next",
) {
  if (!active) return;
  const idx = slides.findIndex((s) => s.key === active.key);
  const targetIdx = direction === "next" ? idx + 1 : idx - 1;
  if (targetIdx < 0 || targetIdx >= slides.length) return;
  setKey(slides[targetIdx].key);
}

function renderPageBody(type: ProjectFileType, slide: SlideContent) {
  if (type === "image") {
    return <div className={styles.imagePlaceholder}>{slide.content}</div>;
  }
  if (type === "excel") {
    return <ExcelTable slide={slide} />;
  }
  if (type === "word") {
    return <WordDocument slide={slide} />;
  }
  if (type === "pdf") {
    return <PdfDocument slide={slide} />;
  }
  return <PptSlide slide={slide} />;
}

function PptSlide({ slide }: { slide: SlideContent }) {
  const paragraphs = slide.content.split(/\n+/).filter(Boolean);
  return (
    <div className={styles.pptSlide}>
      <div className={styles.pptSlideAccent} />
      <div className={styles.pptSlideBody}>
        <h3>{slide.title}</h3>
        {paragraphs.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function WordDocument({ slide }: { slide: SlideContent }) {
  const paragraphs = slide.content.split(/\n+/).filter(Boolean);
  return (
    <div className={styles.wordDoc}>
      <h3>{slide.title}</h3>
      {paragraphs.map((line, index) => (
        <p key={index}>{line}</p>
      ))}
    </div>
  );
}

function ExcelTable({ slide }: { slide: SlideContent }) {
  const rows = slide.content.split(/\n+/).filter(Boolean);
  return (
    <div className={styles.excelSheet}>
      <header className={styles.excelSheetHeader}>{slide.title}</header>
      <table className={styles.excelTable}>
        <thead>
          <tr>
            <th>项目</th>
            <th>规格</th>
            <th>用量</th>
            <th>单价</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const cells = row.split("|");
            return (
              <tr key={index}>
                {cells.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PdfDocument({ slide }: { slide: SlideContent }) {
  return (
    <div className={styles.pdfDoc}>
      <h3>{slide.title}</h3>
      <p>{slide.content}</p>
    </div>
  );
}

function buildSlideContent(file: ProjectFile): SlideContent[] {
  if (file.type === "ppt") {
    return [
      {
        key: `${file.id}-1`,
        title: "封面",
        content:
          "项目背景与目标\n客户：上海浦东商业管理有限公司\n范围：外墙翻新方案设计与施工交底",
      },
      {
        key: `${file.id}-2`,
        title: "项目摘要",
        content:
          "建筑总面积约 4.2 万平方米，立面以幕墙与铝板为主\n净味内墙体系与节能涂料组合使用\n施工窗口：夜间 22:00-次日 06:00",
      },
      {
        key: `${file.id}-3`,
        title: "推荐材料体系",
        content:
          "外墙：立邦晴雨 2000 弹性涂料 + 抗碱底漆\n内墙：净味全效 + 抗菌面漆\n配套：节点处理腻子、网格布",
      },
      {
        key: `${file.id}-4`,
        title: "施工流程",
        content:
          "基层处理 → 修补找平 → 底漆 → 面漆两道 → 验收\n单栋施工周期 12 天，整体工期 45 天",
      },
      {
        key: `${file.id}-5`,
        title: "复核与交付",
        content:
          "材料到场抽检、施工过程旁站、完工三方验收\n交付物：竣工报告、质保书、维护建议",
      },
    ];
  }

  if (file.type === "word") {
    return [
      {
        key: `${file.id}-1`,
        title: "施工交底初稿",
        content:
          "1. 适用范围\n本交底适用于浦东商业综合体外墙翻新项目夜间施工段。\n\n2. 施工准备\n班前检查、安全交底、材料预摆、施工照明与降噪准备。\n\n3. 关键工艺\n基层修补、底漆滚涂、面漆两道喷涂、施工缝处理。",
      },
      {
        key: `${file.id}-2`,
        title: "风险与应急",
        content:
          "雨期施工：露天作业遇雨立即停工，覆盖未干涂层。\n高空作业：双钩安全带、警戒区 5m、班前体检。\n材料应急：现场备 5% 余量，遇缺货 2 小时内补料。",
      },
    ];
  }

  if (file.type === "excel") {
    return [
      {
        key: `${file.id}-1`,
        title: "材料用量估算",
        content:
          "外墙底漆|20kg/桶|32 桶|560|分两批进场\n面漆 A|25kg/桶|48 桶|720|主色\n面漆 B|25kg/桶|18 桶|310|辅助色\n腻子|25kg/袋|60 袋|180|基层修补",
      },
    ];
  }

  if (file.type === "pdf") {
    return [
      {
        key: `${file.id}-1`,
        title: "检测报告",
        content:
          "检测机构：上海建科检验有限公司\n检测日期：2026-05-12\n结论：基层强度 1.4MPa，含水率 9.2%，平整度偏差 3mm/2m，符合翻新施工要求。",
      },
    ];
  }

  return [
    {
      key: `${file.id}-1`,
      title: "现场照片",
      content: "（图片占位）外立面整体状况、夜间施工照明、基层修补实拍等",
    },
  ];
}
