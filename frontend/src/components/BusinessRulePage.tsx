import {
  AppstoreOutlined,
  AuditOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EllipsisOutlined,
  FileTextOutlined,
  PlusOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Segmented,
  Select,
  Switch,
  Tag,
  App as AntApp,
} from "antd";
import type { MenuProps } from "antd";
import { useMemo, useState } from "react";
import {
  auditSeverityLabels,
  auditTriggerStageOptions,
  buildFieldKey,
  businessRules as initialRules,
  commercialPaintRenewalFields,
  createEmptyField,
  defaultCommercialAuditChecks,
  ruleKindLabels,
  ruleSceneLabels,
  ruleStatusLabels,
  type AuditCheckItem,
  type AuditRuleConfig,
  type BusinessRule,
  type RuleFormField,
  type RuleKind,
  type RuleStatus,
} from "./ruleData";
import styles from "./BusinessRulePage.module.css";

const statusColors: Record<RuleStatus, string> = {
  active: "success",
  reviewing: "warning",
  draft: "default",
};

const kindColors: Record<RuleKind, string> = {
  form: "blue",
  audit: "purple",
};

const severityColors: Record<AuditCheckItem["severity"], string> = {
  high: "red",
  medium: "orange",
  low: "default",
};

type ViewMode = "card" | "list";

export function BusinessRulePage() {
  const { message } = AntApp.useApp();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<RuleStatus | "all">("all");
  const [kindFilter, setKindFilter] = useState<RuleKind | "all">("all");
  const [view, setView] = useState<ViewMode>("card");
  const [ruleList, setRuleList] = useState<BusinessRule[]>(initialRules);
  const [editingRule, setEditingRule] = useState<BusinessRule | null>(null);
  const [draftKind, setDraftKind] = useState<RuleKind>("form");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredRules = useMemo(() => {
    return ruleList
      .filter((rule) => matchesKeyword(rule, keyword))
      .filter((rule) => status === "all" || rule.status === status)
      .filter((rule) => kindFilter === "all" || rule.kind === kindFilter)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [ruleList, keyword, status, kindFilter]);

  function openCreate(kind: RuleKind) {
    setEditingRule(null);
    setDraftKind(kind);
    setIsFormOpen(true);
  }

  function openEdit(rule: BusinessRule) {
    setEditingRule(rule);
    setDraftKind(rule.kind);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingRule(null);
    setDraftKind("form");
  }

  function handleDelete(ruleId: string) {
    setRuleList((list) => list.filter((rule) => rule.id !== ruleId));
    if (editingRule?.id === ruleId) {
      setEditingRule(null);
    }
    message.success("已删除规则");
  }

  function handleSaveForm(payload: FormRuleDraft | AuditRuleDraft) {
    const today = new Date().toISOString().slice(0, 10);
    if (editingRule) {
      setRuleList((list) =>
        list.map((rule) => mergeRule(rule, payload, today)),
      );
      message.success(`已更新规则：${payload.name || editingRule.name}`);
    } else {
      const id = `RULE-${Date.now().toString().slice(-4)}`;
      setRuleList((list) => [createRule(id, payload, today), ...list]);
      message.success(`已创建规则：${payload.name || "新建规则"}`);
    }
    closeForm();
  }

  function handleSaveAudit(payload: AuditRuleDraft) {
    const today = new Date().toISOString().slice(0, 10);
    if (editingRule) {
      setRuleList((list) =>
        list.map((rule) => mergeRule(rule, payload, today)),
      );
      message.success(`已更新规则：${payload.name || editingRule.name}`);
    } else {
      const id = `RULE-${Date.now().toString().slice(-4)}`;
      setRuleList((list) => [createRule(id, payload, today), ...list]);
      message.success(`已创建规则：${payload.name || "新建审核规则"}`);
    }
    closeForm();
  }

  return (
    <section className={styles.page} aria-label="业务规则">
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <NewRuleDropdown onSelect={openCreate} />
          <Input.Search
            allowClear
            placeholder="搜索规则名称、摘要"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className={styles.search}
          />
          <Select
            value={kindFilter}
            className={styles.kindFilter}
            options={[
              { value: "all", label: "全部类型" },
              ...(Object.keys(ruleKindLabels) as RuleKind[]).map((value) => ({
                value,
                label: ruleKindLabels[value],
              })),
            ]}
            onChange={setKindFilter}
          />
          <Select
            value={status}
            className={styles.statusFilter}
            options={[
              { value: "all", label: "全部状态" },
              ...Object.entries(ruleStatusLabels).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
            onChange={setStatus}
          />
        </div>
        <Segmented
          value={view}
          onChange={(value) => setView(value as ViewMode)}
          options={[
            { value: "card", label: <AppstoreOutlined aria-label="卡片视图" /> },
            { value: "list", label: <UnorderedListOutlined aria-label="列表视图" /> },
          ]}
        />
      </div>

      {filteredRules.length === 0 ? (
        <Empty description="没有匹配的规则" className={styles.empty}>
          <Button onClick={() => setKeyword("")}>清空搜索</Button>
        </Empty>
      ) : view === "card" ? (
        <div className={styles.cardGrid}>
          {filteredRules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onEdit={() => openEdit(rule)}
              onDelete={() => handleDelete(rule.id)}
            />
          ))}
        </div>
      ) : (
        <RuleTable
          rules={filteredRules}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      <RuleEditor
        open={isFormOpen}
        rule={editingRule}
        draftKind={draftKind}
        onCancel={closeForm}
        onSaveForm={handleSaveForm}
        onSaveAudit={handleSaveAudit}
      />
    </section>
  );
}

interface NewRuleDropdownProps {
  onSelect: (kind: RuleKind) => void;
}

function NewRuleDropdown({ onSelect }: NewRuleDropdownProps) {
  const items: MenuProps["items"] = [
    {
      key: "form",
      label: (
        <span className={styles.newRuleItem}>
          <FileTextOutlined />
          <span>
            <strong>新建表单规则</strong>
            <small>需求表单 / 模板字段</small>
          </span>
        </span>
      ),
    },
    {
      key: "audit",
      label: (
        <span className={styles.newRuleItem}>
          <AuditOutlined />
          <span>
            <strong>新建审核规则</strong>
            <small>触发阶段 / 校验项 / 审核人</small>
          </span>
        </span>
      ),
    },
  ];

  return (
    <Dropdown
      menu={{
        items,
        onClick: ({ key }) => onSelect(key as RuleKind),
      }}
      trigger={["click"]}
      placement="bottomLeft"
    >
      <Button type="primary" icon={<PlusOutlined />}>
        新建规则 <DownOutlined />
      </Button>
    </Dropdown>
  );
}

interface RuleCardProps {
  rule: BusinessRule;
  onEdit: () => void;
  onDelete: () => void;
}

function RuleCard({ rule, onEdit, onDelete }: RuleCardProps) {
  return (
    <article
      className={styles.card}
      onClick={onEdit}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onEdit();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <header className={styles.cardHeader}>
        <div className={styles.cardTags}>
          <Tag color={kindColors[rule.kind]}>{ruleKindLabels[rule.kind]}</Tag>
          <Tag>{ruleSceneLabels[rule.scene]}</Tag>
          <Tag color={statusColors[rule.status]}>{ruleStatusLabels[rule.status]}</Tag>
        </div>
        <RuleActions onEdit={onEdit} onDelete={onDelete} />
      </header>
      <h3 className={styles.cardTitle}>{rule.name}</h3>
      <div className={styles.cardMeta}>
        <span className={styles.cardMetaText}>
          {rule.owner} · {rule.linkedProjectCount} 个关联项目
        </span>
        <span className={styles.cardMetaTime}>{rule.updatedAt}</span>
      </div>
      <p className={styles.cardSummary}>{rule.summary}</p>
      <footer className={styles.cardFooter}>
        {rule.kind === "form" ? (
          <>
            <FileTextOutlined className={styles.cardFooterIcon} />
            <span className={styles.cardFooterText}>
              {rule.config.fields.length} 个字段
            </span>
          </>
        ) : (
          <>
            <AuditOutlined className={styles.cardFooterIcon} />
            <span className={styles.cardFooterText}>
              {rule.config.checks.filter((check) => check.enabled).length} /{" "}
              {rule.config.checks.length} 项 · {rule.config.triggerStage}
            </span>
          </>
        )}
      </footer>
    </article>
  );
}

interface RuleTableProps {
  rules: BusinessRule[];
  onEdit: (rule: BusinessRule) => void;
  onDelete: (ruleId: string) => void;
}

function RuleTable({ rules, onEdit, onDelete }: RuleTableProps) {
  return (
    <div className={styles.table}>
      <div className={styles.tableHeader}>
        <span>规则名称</span>
        <span>类型</span>
        <span>场景</span>
        <span>状态</span>
        <span>负责人</span>
        <span>更新时间</span>
        <span aria-label="操作" />
      </div>
      {rules.map((rule) => (
        <div
          key={rule.id}
          className={styles.tableRow}
          onClick={() => onEdit(rule)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onEdit(rule);
            }
          }}
        >
          <span className={styles.tableName}>
            <span className={styles.tableNameText}>{rule.name}</span>
            <span className={styles.tableId}>{rule.id}</span>
          </span>
          <span>
            <Tag color={kindColors[rule.kind]}>{ruleKindLabels[rule.kind]}</Tag>
          </span>
          <span>{ruleSceneLabels[rule.scene]}</span>
          <span>
            <Tag color={statusColors[rule.status]}>{ruleStatusLabels[rule.status]}</Tag>
          </span>
          <span>{rule.owner}</span>
          <span>{rule.updatedAt}</span>
          <span onClick={(event) => event.stopPropagation()}>
            <RuleActions
              onEdit={() => onEdit(rule)}
              onDelete={() => onDelete(rule.id)}
              compact
            />
          </span>
        </div>
      ))}
    </div>
  );
}

interface RuleActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  compact?: boolean;
}

function RuleActions({ onEdit, onDelete, compact = false }: RuleActionsProps) {
  const items: MenuProps["items"] = [
    {
      key: "edit",
      label: (
        <span className={styles.editLabel} onClick={onEdit}>
          <EditOutlined /> 编辑
        </span>
      ),
    },
    {
      key: "delete",
      label: (
        <Popconfirm
          title="确认删除该规则？"
          description="删除后无法恢复"
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={(event) => {
            event?.stopPropagation();
            onDelete();
          }}
          onCancel={(event) => event?.stopPropagation()}
        >
          <span className={styles.deleteLabel}>
            <DeleteOutlined /> 删除
          </span>
        </Popconfirm>
      ),
    },
  ];
  return (
    <Dropdown
      menu={{ items }}
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button
        type="text"
        size={compact ? "small" : "middle"}
        icon={<EllipsisOutlined />}
        onClick={(event) => event.stopPropagation()}
        aria-label="更多操作"
      />
    </Dropdown>
  );
}

interface FormRuleDraft {
  kind: "form";
  name: string;
  scene: BusinessRule["scene"];
  status: RuleStatus;
  owner: string;
  summary: string;
  linkedProjectCount: number;
  fields: RuleFormField[];
  values: Record<string, string>;
}

interface AuditRuleDraft {
  kind: "audit";
  name: string;
  scene: BusinessRule["scene"];
  status: RuleStatus;
  owner: string;
  summary: string;
  linkedProjectCount: number;
  config: AuditRuleConfig;
}

function createRule(id: string, payload: FormRuleDraft | AuditRuleDraft, updatedAt: string): BusinessRule {
  const base = {
    id,
    name: payload.name || (payload.kind === "form" ? "新建表单规则" : "新建审核规则"),
    scene: payload.scene,
    status: payload.status,
    owner: payload.owner || "当前用户",
    updatedAt,
    summary: payload.summary || defaultSummary(payload.kind),
    linkedProjectCount: payload.linkedProjectCount,
  };
  if (payload.kind === "form") {
    return { ...base, kind: "form", config: { fields: payload.fields, values: payload.values } };
  }
  return { ...base, kind: "audit", config: payload.config };
}

function mergeRule(
  rule: BusinessRule,
  payload: FormRuleDraft | AuditRuleDraft,
  updatedAt: string,
): BusinessRule {
  const base = {
    name: payload.name || rule.name,
    scene: payload.scene,
    status: payload.status,
    owner: payload.owner || rule.owner,
    updatedAt,
    summary: payload.summary || rule.summary,
    linkedProjectCount: payload.linkedProjectCount,
  };
  if (rule.kind === "form" && payload.kind === "form") {
    return {
      ...rule,
      ...base,
      config: { fields: payload.fields, values: payload.values },
    };
  }
  if (rule.kind === "audit" && payload.kind === "audit") {
    return {
      ...rule,
      ...base,
      config: payload.config,
    };
  }
  return rule;
}

function defaultSummary(kind: RuleKind): string {
  return kind === "form"
    ? "基于商业楼涂料换新需求表单模板创建。"
    : "面向方案生成关键节点的合规性审核规则。";
}

interface RuleEditorProps {
  open: boolean;
  rule: BusinessRule | null;
  draftKind: RuleKind;
  onCancel: () => void;
  onSaveForm: (payload: FormRuleDraft) => void;
  onSaveAudit: (payload: AuditRuleDraft) => void;
}

function RuleEditor({
  open,
  rule,
  draftKind,
  onCancel,
  onSaveForm,
  onSaveAudit,
}: RuleEditorProps) {

  return (
    <Modal
      open={open}
      title={rule ? "编辑规则" : "新建规则"}
      width="min(960px, calc(100vw - 48px))"
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      {draftKind === "form" ? (
        <FormRuleEditor
          rule={rule && rule.kind === "form" ? rule : null}
          onCancel={onCancel}
          onSubmit={onSaveForm}
        />
      ) : (
        <AuditRuleEditor
          rule={rule && rule.kind === "audit" ? rule : null}
          onCancel={onCancel}
          onSubmit={onSaveAudit}
        />
      )}
    </Modal>
  );
}

interface FormRuleEditorProps {
  rule: Extract<BusinessRule, { kind: "form" }> | null;
  onCancel: () => void;
  onSubmit: (payload: FormRuleDraft) => void;
}

function FormRuleEditor({ rule, onCancel, onSubmit }: FormRuleEditorProps) {
  const [name, setName] = useState<string>(rule?.name ?? "");
  const [fields, setFields] = useState<RuleFormField[]>(
    rule?.config.fields ?? commercialPaintRenewalFields,
  );
  const [values, setValues] = useState<Record<string, string>>(
    rule?.config.values ?? {},
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [nameError, setNameError] = useState<string | undefined>(undefined);

  const takenKeys = useMemo(() => new Set(fields.map((field) => field.key)), [fields]);

  function handleAddField() {
    setFields((list) => [...list, createEmptyField(takenKeys)]);
  }

  function handleUpdateField(key: string, patch: Partial<RuleFormField>) {
    setFields((list) =>
      list.map((field) => {
        if (field.key !== key) return field;
        const next = { ...field, ...patch };
        if (patch.label !== undefined) {
          const desiredKey = buildFieldKey(patch.label, takenKeys);
          if (desiredKey !== field.key && !takenKeys.has(desiredKey)) {
            next.key = desiredKey;
          }
        }
        return next;
      }),
    );
  }

  function handleRemoveField(key: string) {
    setFields((list) => list.filter((field) => field.key !== key));
    setValues((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
    setErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function handleValueChange(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required && !(values[field.key] ?? "").trim()) {
        nextErrors[field.key] = `请输入${field.label}`;
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("请输入规则名称");
      return;
    }
    if (!validate()) {
      return;
    }
    onSubmit({
      kind: "form",
      name: trimmedName,
      scene: "commercial-exterior",
      status: rule?.status ?? "draft",
      owner: rule?.owner ?? "当前用户",
      summary: rule?.summary ?? defaultSummary("form"),
      linkedProjectCount: rule?.linkedProjectCount ?? 0,
      fields,
      values,
    });
  }

  function handleReset() {
    setFields(commercialPaintRenewalFields);
    setValues({});
    setErrors({});
    setName(rule?.name ?? "");
    setNameError(undefined);
  }

  return (
    <>
      <div className={styles.formNameRow}>
        <span className={styles.formNameLabel}>规则名称</span>
        <Input
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (nameError) setNameError(undefined);
          }}
          placeholder="请输入规则名称"
          status={nameError ? "error" : undefined}
        />
        {nameError ? <span className={styles.formNameError}>{nameError}</span> : null}
      </div>

      <div className={styles.fieldEditorToolbar}>
        <span className={styles.fieldEditorHint}>
          共 {fields.length} 个字段,可调整必填或新增 /删除字段
        </span>
        <Button size="small" icon={<PlusOutlined />} onClick={handleAddField}>
          新增字段
        </Button>
      </div>

      <div className={styles.fieldEditorList}>
        {fields.map((field) => (
          <FormFieldRow
            key={field.key}
            field={field}
            value={values[field.key] ?? ""}
            error={errors[field.key]}
            onChange={(value) => handleValueChange(field.key, value)}
            onUpdate={(patch) => handleUpdateField(field.key, patch)}
            onRemove={() => handleRemoveField(field.key)}
            canRemove={fields.length > 1}
          />
        ))}
      </div>

      <div className={styles.formFooter}>
        <Button onClick={handleReset}>恢复示例</Button>
        <div className={styles.formFooterRight}>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleSave}>
            保存规则
          </Button>
        </div>
      </div>
    </>
  );
}

interface FormFieldRowProps {
  field: RuleFormField;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onUpdate: (patch: Partial<RuleFormField>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function FormFieldRow({
  field,
  value,
  error,
  onChange,
  onUpdate,
  onRemove,
  canRemove,
}: FormFieldRowProps) {
  const isLongText = field.fullWidth === true && field.label.length > 4;
  return (
    <div className={styles.formFieldRow}>
      <div className={styles.formFieldRowHeader}>
        <Input
          value={field.label}
          onChange={(event) => onUpdate({ label: event.target.value })}
          placeholder="字段名称"
          className={styles.formFieldLabel}
        />
        <span className={styles.formFieldRequired}>
          <Switch
            size="small"
            checked={field.required}
            onChange={(checked) => onUpdate({ required: checked })}
            checkedChildren="必填"
            unCheckedChildren="选填"
          />
        </span>
        <Button
          type="text"
          icon={<DeleteOutlined />}
          onClick={onRemove}
          disabled={!canRemove}
          aria-label="删除字段"
        />
      </div>
      {isLongText ? (
        <Input.TextArea
          rows={3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder ?? `请输入${field.label}`}
        />
      ) : (
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder ?? `请输入${field.label}`}
        />
      )}
      {error ? <span className={styles.formFieldError}>{error}</span> : null}
    </div>
  );
}

interface AuditRuleEditorProps {
  rule: Extract<BusinessRule, { kind: "audit" }> | null;
  onCancel: () => void;
  onSubmit: (payload: AuditRuleDraft) => void;
}

function AuditRuleEditor({ rule, onCancel, onSubmit }: AuditRuleEditorProps) {
  const isEditing = rule !== null;
  const initialName = rule?.name ?? "";
  const initialSummary = rule?.summary ?? defaultSummary("audit");
  const initialStatus = rule?.status ?? "draft";
  const initialTrigger = rule?.config.triggerStage ?? auditTriggerStageOptions[0].value;
  const initialReviewers = rule?.config.reviewers ?? [];
  const initialChecks = rule?.config.checks ?? defaultCommercialAuditChecks;
  const initialAutoPass = rule?.config.autoPassWhenClean ?? false;

  const [name, setName] = useState(initialName);
  const [summary, setSummary] = useState(initialSummary);
  const [status, setStatus] = useState<RuleStatus>(initialStatus);
  const [triggerStage, setTriggerStage] = useState(initialTrigger);
  const [reviewerInput, setReviewerInput] = useState("");
  const [reviewers, setReviewers] = useState<string[]>(initialReviewers);
  const [checks, setChecks] = useState<AuditCheckItem[]>(initialChecks);
  const [autoPass, setAutoPass] = useState(initialAutoPass);

  function handleAddReviewer() {
    const value = reviewerInput.trim();
    if (!value) return;
    if (reviewers.includes(value)) {
      setReviewerInput("");
      return;
    }
    setReviewers((list) => [...list, value]);
    setReviewerInput("");
  }

  function handleRemoveReviewer(target: string) {
    setReviewers((list) => list.filter((item) => item !== target));
  }

  function handleAddCheck() {
    const id = `check-${Date.now().toString(36)}`;
    setChecks((list) => [
      ...list,
      {
        id,
        name: `校验项 ${list.length + 1}`,
        description: "",
        severity: "medium",
        enabled: true,
      },
    ]);
  }

  function handleUpdateCheck(id: string, patch: Partial<AuditCheckItem>) {
    setChecks((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function handleRemoveCheck(id: string) {
    setChecks((list) => list.filter((item) => item.id !== id));
  }

  function handleSubmit() {
    const trimmedName = name.trim();
    const finalName = trimmedName || (isEditing ? rule!.name : "新建审核规则");
    onSubmit({
      kind: "audit",
      name: finalName,
      scene: "commercial-exterior",
      status,
      owner: rule?.owner ?? "当前用户",
      summary: summary.trim() || defaultSummary("audit"),
      linkedProjectCount: rule?.linkedProjectCount ?? 0,
      config: {
        triggerStage,
        reviewers,
        checks,
        autoPassWhenClean: autoPass,
      },
    });
  }

  return (
    <>
      <div className={styles.formGrid}>
        <Form.Item label="规则名称" className={styles.fullWidth} required>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="如:商业楼涂装方案审核规则"
          />
        </Form.Item>
        <Form.Item label="状态" required>
          <Select
            value={status}
            options={(Object.keys(ruleStatusLabels) as RuleStatus[]).map((value) => ({
              value,
              label: ruleStatusLabels[value],
            }))}
            onChange={setStatus}
          />
        </Form.Item>
        <Form.Item label="触发阶段" required>
          <Select
            value={triggerStage}
            options={auditTriggerStageOptions}
            onChange={setTriggerStage}
          />
        </Form.Item>
        <Form.Item label="说明" className={styles.fullWidth}>
          <Input.TextArea
            rows={2}
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="简要描述本审核规则的应用场景和目标。"
          />
        </Form.Item>

        <Form.Item label="审核人" className={styles.fullWidth}>
          <div className={styles.reviewerEditor}>
            <Input
              value={reviewerInput}
              onChange={(event) => setReviewerInput(event.target.value)}
              onPressEnter={handleAddReviewer}
              placeholder="输入角色名称后回车,如:产品负责人"
            />
            <Button onClick={handleAddReviewer}>添加</Button>
          </div>
          {reviewers.length > 0 ? (
            <div className={styles.tagList}>
              {reviewers.map((reviewer) => (
                <Tag
                  key={reviewer}
                  closable
                  onClose={(event) => {
                    event.preventDefault();
                    handleRemoveReviewer(reviewer);
                  }}
                >
                  {reviewer}
                </Tag>
              ))}
            </div>
          ) : (
            <span className={styles.emptyHint}>尚未设置审核人</span>
          )}
        </Form.Item>

        <Form.Item label="校验项" className={styles.fullWidth}>
          <div className={styles.checkEditor}>
            {checks.map((check) => (
              <div key={check.id} className={styles.checkRow}>
                <div className={styles.checkRowHeader}>
                  <Input
                    value={check.name}
                    onChange={(event) =>
                      handleUpdateCheck(check.id, { name: event.target.value })
                    }
                    placeholder="校验项名称"
                    className={styles.checkName}
                  />
                  <Select
                    value={check.severity}
                    onChange={(value) =>
                      handleUpdateCheck(check.id, { severity: value })
                    }
                    options={(Object.keys(auditSeverityLabels) as AuditCheckItem["severity"][]).map(
                      (value) => ({ value, label: `${auditSeverityLabels[value]}优先级` }),
                    )}
                    className={styles.checkSeverity}
                  />
                  <Switch
                    checked={check.enabled}
                    onChange={(checked) =>
                      handleUpdateCheck(check.id, { enabled: checked })
                    }
                    checkedChildren="启用"
                    unCheckedChildren="关闭"
                  />
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveCheck(check.id)}
                    aria-label="删除校验项"
                  />
                </div>
                <Input.TextArea
                  rows={2}
                  value={check.description}
                  onChange={(event) =>
                    handleUpdateCheck(check.id, { description: event.target.value })
                  }
                  placeholder="描述本校验项的判定标准或参考资料。"
                />
                <div className={styles.checkMeta}>
                  <Tag color={severityColors[check.severity]}>
                    {auditSeverityLabels[check.severity]}优先级
                  </Tag>
                </div>
              </div>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddCheck}
              block
            >
              新增校验项
            </Button>
          </div>
        </Form.Item>

        <Form.Item label="全部通过时自动放行" className={styles.fullWidth}>
          <Switch
            checked={autoPass}
            onChange={setAutoPass}
            checkedChildren="是"
            unCheckedChildren="否"
          />
          <span className={styles.fieldHint}>
            启用后,若所有启用的校验项均通过,系统将自动放行并通知审核人。
          </span>
        </Form.Item>
      </div>

      <div className={styles.formFooter}>
        <Button onClick={onCancel}>取消</Button>
        <div className={styles.formFooterRight}>
          <Button type="primary" onClick={handleSubmit}>
            保存规则
          </Button>
        </div>
      </div>
    </>
  );
}

function matchesKeyword(rule: BusinessRule, keyword: string) {
  const source = `${rule.name} ${rule.summary} ${ruleSceneLabels[rule.scene]} ${rule.owner}`;
  return source.toLowerCase().includes(keyword.trim().toLowerCase());
}