import { DownOutlined } from "@ant-design/icons";
import type { MouseEvent } from "react";
import type { ActivePage } from "./WorkspaceSidebar";
import {
  adminActivePages,
  adminSectionToActivePage,
  adminSubLinks,
} from "./adminSections";
import styles from "./DocumentWorkspace.module.css";

interface AdminCenterGroupProps {
  isOpen: boolean;
  activePage: ActivePage;
  onToggle: () => void;
  onOpen: (page: ActivePage) => (event: MouseEvent<HTMLAnchorElement>) => void;
}

export function AdminCenterGroup({ isOpen, activePage, onToggle, onOpen }: AdminCenterGroupProps) {
  const isActive = adminActivePages.includes(activePage);
  return (
    <div className={styles.navGroup}>
      <button
        className={`${styles.navGroupTitle} ${isActive ? styles.navItemActive : ""}`}
        type="button"
        onClick={onToggle}
      >
        <span>管理中心</span>
        <DownOutlined className={isOpen ? styles.chevronOpen : undefined} />
      </button>
      {isOpen ? (
        <div className={styles.recentList}>
          {adminSubLinks.map((link) => {
            const isDisabled = Boolean(link.badge);
            const targetPage = adminSectionToActivePage[link.section] as ActivePage;
            const className = [
              activePage === targetPage && !isDisabled ? styles.navItemActive : undefined,
              isDisabled ? styles.navItemDisabled : undefined,
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <a
                key={link.section}
                href={isDisabled ? undefined : `#${targetPage}`}
                aria-disabled={isDisabled || undefined}
                className={className}
                onClick={isDisabled ? undefined : onOpen(targetPage)}
              >
                <span className={styles.navItemLabel}>{link.label}</span>
                {link.badge ? <span className={styles.navItemBadge}>{link.badge}</span> : null}
              </a>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
