import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExperimentOutlined,
  GlobalOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Tag,
  message,
} from "antd";
import { useEffect, useState } from "react";
import {
  type ApiAuthType,
  type ApiConnection,
  type DatabaseConnection,
  type DatabaseDriver,
  type ExternalKbApiConfig,
  type ExternalSourceConfig,
} from "./knowledgeBaseData";
import styles from "./KnowledgeBasePage.module.css";

const DATABASE_DRIVER_OPTIONS: { value: DatabaseDriver; label: string; defaultPort: number }[] = [
  { value: "mysql", label: "MySQL", defaultPort: 3306 },
  { value: "postgresql", label: "PostgreSQL", defaultPort: 5432 },
  { value: "sqlserver", label: "SQL Server", defaultPort: 1433 },
  { value: "oracle", label: "Oracle", defaultPort: 1521 },
];

const API_AUTH_OPTIONS: { value: ApiAuthType; label: string }[] = [
  { value: "none", label: "无认证" },
  { value: "apikey", label: "API Key (Header)" },
  { value: "bearer", label: "Bearer Token" },
  { value: "basic", label: "Basic Auth" },
];

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function ConnectionStatusTag({ status }: { status: DatabaseConnection["status"] | ApiConnection["status"] }) {
  if (status === "connected") {
    return (
      <Tag color="success" icon={<CheckCircleOutlined />}>
        已连接
      </Tag>
    );
  }
  if (status === "error") {
    return (
      <Tag color="error" icon={<CloseCircleOutlined />}>
        异常
      </Tag>
    );
  }
  return <Tag>未连接</Tag>;
}

interface ConnectionListProps<T extends { id: string; name: string }> {
  items: T[];
  renderMeta: (item: T) => React.ReactNode;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  emptyText: string;
}

function ConnectionList<T extends { id: string; name: string }>({
  items,
  renderMeta,
  onEdit,
  onDelete,
  emptyText,
}: ConnectionListProps<T>) {
  if (items.length === 0) {
    return <Empty description={emptyText} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }
  return (
    <ul className={styles.connectionList}>
      {items.map((item) => (
        <li key={item.id} className={styles.connectionItem}>
          <div className={styles.connectionMain}>
            <div className={styles.connectionName}>{item.name}</div>
            <div className={styles.connectionMeta}>{renderMeta(item)}</div>
          </div>
          <Space>
            <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(item.id)}>
              编辑
            </Button>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(item.id)}
            >
              删除
            </Button>
          </Space>
        </li>
      ))}
    </ul>
  );
}

interface DatabaseFormValues {
  name: string;
  driver: DatabaseDriver;
  host: string;
  port: number;
  database: string;
  username: string;
  password?: string;
  tables: string;
}

interface DatabaseSourcePanelProps {
  connections: DatabaseConnection[];
  onChange: (next: DatabaseConnection[]) => void;
}

export function DatabaseSourcePanel({ connections, onChange }: DatabaseSourcePanelProps) {
  const [form] = Form.useForm<DatabaseFormValues>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingId) {
      const target = connections.find((c) => c.id === editingId);
      if (target) {
        form.setFieldsValue({
          name: target.name,
          driver: target.driver,
          host: target.host,
          port: target.port,
          database: target.database,
          username: target.username,
          tables: target.tables.join(", "),
        });
      }
    } else {
      form.resetFields();
    }
  }, [editingId, connections, form, modalOpen]);

  function openCreate() {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ driver: "mysql", port: 3306 });
    setModalOpen(true);
  }

  function openEdit(id: string) {
    setEditingId(id);
    setModalOpen(true);
  }

  function handleDriverChange(value: DatabaseDriver) {
    const matched = DATABASE_DRIVER_OPTIONS.find((d) => d.value === value);
    if (matched) form.setFieldValue("port", matched.defaultPort);
  }

  async function handleTest() {
    try {
      await form.validateFields();
    } catch {
      return;
    }
    setTesting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setTesting(false);
    const passed = Math.random() > 0.1;
    message[passed ? "success" : "error"](
      passed ? "数据库连接测试通过" : "无法连接数据库,请检查网络与账号",
    );
  }

  async function handleSave() {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 400));
      const tables = values.tables
        .split(/[,，\s]+/)
        .map((t) => t.trim())
        .filter(Boolean);
      const id = editingId ?? makeId("DB");
      const existing = connections.find((c) => c.id === id);
      const next: DatabaseConnection = {
        id,
        name: values.name,
        driver: values.driver,
        host: values.host,
        port: values.port,
        database: values.database,
        username: values.username,
        password: values.password ?? existing?.password,
        tables,
        status: "connected",
        lastTestedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      };
      const nextList = editingId
        ? connections.map((c) => (c.id === id ? next : c))
        : [next, ...connections];
      onChange(nextList);
      setModalOpen(false);
      setEditingId(null);
      form.resetFields();
      message.success(editingId ? "数据库连接已更新" : "数据库连接已创建");
    } catch {
      /* validation already shown by antd Form */
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id: string) {
    Modal.confirm({
      title: "删除该数据库连接?",
      content: "已引用此连接的导入记录会变为不可用,请谨慎。",
      okText: "删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: () => {
        onChange(connections.filter((c) => c.id !== id));
        message.success("已删除");
      },
    });
  }

  return (
    <div className={styles.sourcePanel}>
      <div className={styles.panelHeader}>
        <div>
          <h3 className={styles.panelTitle}>数据库连接</h3>
          <p className={styles.panelDesc}>
            在此处管理所有可被各知识库复用的数据库连接,具体知识库内通过"导入"选择这些连接。
          </p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建连接
        </Button>
      </div>

      <ConnectionList
        items={connections}
        emptyText="尚未配置任何数据库连接"
        onEdit={openEdit}
        onDelete={handleDelete}
        renderMeta={(c) => (
          <>
            <ConnectionStatusTag status={c.status} />
            <code>{c.driver}://{c.host}:{c.port}/{c.database}</code>
            <span>用户: {c.username || "-"}</span>
            <span>表: {c.tables.length > 0 ? c.tables.join(", ") : "(未指定)"}</span>
            {c.lastTestedAt ? <span>最近测试: {c.lastTestedAt}</span> : null}
          </>
        )}
      />

      <Modal
        title={editingId ? "编辑数据库连接" : "新建数据库连接"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText="保存"
        cancelText="取消"
        confirmLoading={saving}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" className={styles.sourceForm}>
          <div className={styles.formRow}>
            <Form.Item label="连接名称" name="name" rules={[{ required: true, message: "请输入连接名称" }]} className={styles.formFlex2}>
              <Input placeholder="例如：CRM 客户主数据" />
            </Form.Item>
            <Form.Item label="数据库类型" name="driver" rules={[{ required: true }]}>
              <Select
                options={DATABASE_DRIVER_OPTIONS.map((d) => ({ value: d.value, label: d.label }))}
                onChange={handleDriverChange}
              />
            </Form.Item>
          </div>
          <div className={styles.formRow}>
            <Form.Item label="主机地址" name="host" rules={[{ required: true, message: "请输入主机地址" }]} className={styles.formFlex2}>
              <Input placeholder="例如：10.0.0.12" />
            </Form.Item>
            <Form.Item label="端口" name="port" rules={[{ required: true }]}>
              <InputNumber min={1} max={65535} style={{ width: "100%" }} />
            </Form.Item>
          </div>
          <div className={styles.formRow}>
            <Form.Item label="数据库名" name="database" rules={[{ required: true, message: "请输入数据库名" }]}>
              <Input placeholder="例如：doctech_cms" />
            </Form.Item>
            <Form.Item label="用户名" name="username" rules={[{ required: true, message: "请输入用户名" }]}>
              <Input placeholder="readonly_user" />
            </Form.Item>
            <Form.Item label="密码" name="password" tooltip="留空表示不修改已保存的密码">
              <Input.Password placeholder="********" />
            </Form.Item>
          </div>
          <Form.Item label="可同步的数据表(逗号分隔)" name="tables" tooltip="导入时按所选表同步,大字段列(LONGTEXT/CLOB)将自动识别为正文">
            <Input placeholder="例如：product_spec, case_study" />
          </Form.Item>
          <Space>
            <Button onClick={handleTest} loading={testing}>
              测试连接
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}

interface ApiFormValues {
  name: string;
  baseUrl: string;
  endpoint: string;
  authType: ApiAuthType;
  authToken?: string;
  fieldMapping: string;
}

interface ApiSourcePanelProps {
  connections: ApiConnection[];
  onChange: (next: ApiConnection[]) => void;
}

export function ApiSourcePanel({ connections, onChange }: ApiSourcePanelProps) {
  const [form] = Form.useForm<ApiFormValues>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingId) {
      const target = connections.find((c) => c.id === editingId);
      if (target) {
        form.setFieldsValue({
          name: target.name,
          baseUrl: target.baseUrl,
          endpoint: target.endpoint,
          authType: target.authType,
          fieldMapping: target.fieldMapping,
        });
      }
    } else {
      form.resetFields();
    }
  }, [editingId, connections, form, modalOpen]);

  function openCreate() {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ authType: "none", fieldMapping: "title -> name, content -> body" });
    setModalOpen(true);
  }

  function openEdit(id: string) {
    setEditingId(id);
    setModalOpen(true);
  }

  async function handleTest() {
    try {
      await form.validateFields();
    } catch {
      return;
    }
    setTesting(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setTesting(false);
    const passed = Math.random() > 0.1;
    message[passed ? "success" : "error"](
      passed ? "API 测试请求成功 (HTTP 200)" : "API 请求失败:鉴权未通过或接口不存在",
    );
  }

  async function handleSave() {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 400));
      const id = editingId ?? makeId("API");
      const existing = connections.find((c) => c.id === id);
      const next: ApiConnection = {
        id,
        name: values.name,
        baseUrl: values.baseUrl,
        endpoint: values.endpoint,
        authType: values.authType,
        authToken: values.authToken ?? existing?.authToken ?? "",
        fieldMapping: values.fieldMapping,
        status: "connected",
        lastTestedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      };
      const nextList = editingId
        ? connections.map((c) => (c.id === id ? next : c))
        : [next, ...connections];
      onChange(nextList);
      setModalOpen(false);
      setEditingId(null);
      form.resetFields();
      message.success(editingId ? "API 连接已更新" : "API 连接已创建");
    } catch {
      /* validation already shown by antd Form */
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id: string) {
    Modal.confirm({
      title: "删除该 API 连接?",
      content: "已引用此连接的导入记录会变为不可用,请谨慎。",
      okText: "删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: () => {
        onChange(connections.filter((c) => c.id !== id));
        message.success("已删除");
      },
    });
  }

  return (
    <div className={styles.sourcePanel}>
      <div className={styles.panelHeader}>
        <div>
          <h3 className={styles.panelTitle}>API 接口</h3>
          <p className={styles.panelDesc}>
            注册可在多个知识库复用的 API 连接,导入时选定 endpoint 拉取内容。
          </p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建连接
        </Button>
      </div>

      <ConnectionList
        items={connections}
        emptyText="尚未配置任何 API 连接"
        onEdit={openEdit}
        onDelete={handleDelete}
        renderMeta={(c) => (
          <>
            <ConnectionStatusTag status={c.status} />
            <code>{c.baseUrl}{c.endpoint}</code>
            <span>认证: {API_AUTH_OPTIONS.find((a) => a.value === c.authType)?.label}</span>
            {c.lastTestedAt ? <span>最近测试: {c.lastTestedAt}</span> : null}
          </>
        )}
      />

      <Modal
        title={editingId ? "编辑 API 连接" : "新建 API 连接"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText="保存"
        cancelText="取消"
        confirmLoading={saving}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" className={styles.sourceForm}>
          <div className={styles.formRow}>
            <Form.Item label="连接名称" name="name" rules={[{ required: true, message: "请输入连接名称" }]} className={styles.formFlex2}>
              <Input placeholder="例如：内部 Wiki 知识接口" />
            </Form.Item>
            <Form.Item label="认证方式" name="authType" rules={[{ required: true }]}>
              <Select options={API_AUTH_OPTIONS} />
            </Form.Item>
          </div>
          <div className={styles.formRow}>
            <Form.Item label="Base URL" name="baseUrl" rules={[{ required: true, message: "请输入 Base URL" }]} className={styles.formFlex2}>
              <Input placeholder="https://api.example.com" />
            </Form.Item>
            <Form.Item label="Endpoint" name="endpoint" rules={[{ required: true, message: "请输入接口路径" }]}>
              <Input placeholder="/v1/knowledge/list" />
            </Form.Item>
          </div>
          <Form.Item label="认证凭据" name="authToken" tooltip="留空表示不修改已保存的凭据">
            <Input.Password placeholder="API Key / Token" />
          </Form.Item>
          <Form.Item label="字段映射" name="fieldMapping" tooltip="使用 source -> target 格式">
            <Input.TextArea rows={3} placeholder="title -> name, content -> body" />
          </Form.Item>
          <Space>
            <Button onClick={handleTest} loading={testing}>
              测试连接
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}

interface ExternalKbApiFormValues {
  name: string;
  baseUrl: string;
  apiKey?: string;
  retrievalPath: string;
}

interface ExternalKbBindingFormValues {
  apiId: string;
  knowledgeId: string;
  topK: number;
  scoreThreshold?: number;
  description?: string;
}

export interface ExternalSourcePanelProps {
  config: ExternalSourceConfig;
  onChange: (next: ExternalSourceConfig) => void;
}

export function ExternalSourcePanel({
  config,
  onChange,
}: ExternalSourcePanelProps) {
  const { modal } = App.useApp();
  const [apiForm] = Form.useForm<ExternalKbApiFormValues>();
  const [bindingForm] = Form.useForm<ExternalKbBindingFormValues>();
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [editingApiId, setEditingApiId] = useState<string | null>(null);
  const [bindingModalOpen, setBindingModalOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [savingApi, setSavingApi] = useState(false);
  const [savingBinding, setSavingBinding] = useState(false);

  const apis = config.apis;
  const bindings = config.bindings;

  useEffect(() => {
    if (editingApiId) {
      const target = apis.find((a) => a.id === editingApiId);
      if (target) {
        apiForm.setFieldsValue({
          name: target.name,
          baseUrl: target.baseUrl,
          retrievalPath: target.retrievalPath,
        });
      }
    } else {
      apiForm.resetFields();
    }
  }, [editingApiId, apis, apiForm, apiModalOpen]);

  function openCreateApi() {
    setEditingApiId(null);
    apiForm.resetFields();
    apiForm.setFieldsValue({ retrievalPath: "/retrieval" });
    setApiModalOpen(true);
  }

  function openEditApi(id: string) {
    setEditingApiId(id);
    setApiModalOpen(true);
  }

  async function handleTestApi() {
    try {
      await apiForm.validateFields();
    } catch {
      return;
    }
    setTesting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setTesting(false);
    const passed = Math.random() > 0.15;
    message[passed ? "success" : "error"](
      passed ? "检索 API 握手成功" : "无法访问该 API,请检查地址与 API Key",
    );
  }

  async function handleSaveApi() {
    try {
      const values = await apiForm.validateFields();
      setSavingApi(true);
      await new Promise((resolve) => setTimeout(resolve, 400));
      const id = editingApiId ?? makeId("EAPI");
      const existing = apis.find((a) => a.id === id);
      const nextApi: ExternalKbApiConfig = {
        id,
        name: values.name,
        baseUrl: values.baseUrl,
        apiKey: values.apiKey ?? existing?.apiKey ?? "",
        retrievalPath: values.retrievalPath || "/retrieval",
      };
      const nextApis = editingApiId
        ? apis.map((a) => (a.id === id ? nextApi : a))
        : [nextApi, ...apis];
      onChange({ apis: nextApis, bindings });
      setApiModalOpen(false);
      setEditingApiId(null);
      apiForm.resetFields();
      message.success(editingApiId ? "外部知识库 API 已更新" : "外部知识库 API 已注册");
    } catch {
      /* validation already shown by antd Form */
    } finally {
      setSavingApi(false);
    }
  }

  function handleDeleteApi(id: string) {
    modal.confirm({
      title: "删除该外部知识库 API?",
      content: "关联的知识库绑定将一并失效。",
      okText: "删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: () => {
        const nextApis = apis.filter((a) => a.id !== id);
        const nextBindings = bindings.filter((b) => b.apiId !== id);
        onChange({ apis: nextApis, bindings: nextBindings });
        if (editingApiId === id) setEditingApiId(null);
      },
    });
  }

  async function handleSaveBinding() {
    try {
      const values = await bindingForm.validateFields();
      if (apis.length === 0) {
        message.warning("请先注册外部知识库 API");
        return;
      }
      setSavingBinding(true);
      await new Promise((resolve) => setTimeout(resolve, 400));
      const newBinding = {
        id: makeId("EB"),
        apiId: values.apiId,
        knowledgeId: values.knowledgeId,
        topK: values.topK,
        scoreThreshold:
          values.scoreThreshold === undefined || values.scoreThreshold === null
            ? null
            : values.scoreThreshold,
        description: values.description,
      };
      onChange({ apis, bindings: [newBinding, ...bindings] });
      setBindingModalOpen(false);
      bindingForm.resetFields();
      message.success("已创建外部知识库绑定");
    } catch {
      /* validation already shown by antd Form */
    } finally {
      setSavingBinding(false);
    }
  }

  function handleDeleteBinding(id: string) {
    modal.confirm({
      title: "删除该外部知识库绑定?",
      okText: "删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: () => {
        onChange({ apis, bindings: bindings.filter((b) => b.id !== id) });
      },
    });
  }

  return (
    <div className={styles.sourcePanel}>
      <div className={styles.panelHeader}>
        <div>
          <h3 className={styles.panelTitle}>
            外部知识库(对接客户知识中台)
          </h3>
          <p className={styles.panelDesc}>
            对接客户自建知识中台,只调用其检索 API,不会迁移内容。
          </p>
        </div>
      </div>

      <section className={styles.subSection}>
        <div className={styles.subHeader}>
          <h4 className={styles.subTitle}>Step 1 · 客户知识中台检索 API</h4>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={openCreateApi}
          >
            注册 API
          </Button>
        </div>
        <p className={styles.subDesc}>
          客户侧需实现 <code>POST</code> 检索端点,按约定的请求/响应格式返回命中段落。
        </p>
        {apis.length === 0 ? (
          <Empty description="尚未注册任何外部知识库 API" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <ul className={styles.connectionList}>
            {apis.map((api) => (
              <li key={api.id} className={styles.connectionItem}>
                <div className={styles.connectionMain}>
                  <div className={styles.connectionName}>
                    <GlobalOutlined /> {api.name}
                  </div>
                  <div className={styles.connectionMeta}>
                    <code>{api.baseUrl}</code>
                    <span className={styles.apiPath}>{api.retrievalPath}</span>
                  </div>
                </div>
                <Space>
                  <Button size="small" onClick={() => openEditApi(api.id)}>
                    编辑
                  </Button>
                  <Button size="small" danger onClick={() => handleDeleteApi(api.id)}>
                    删除
                  </Button>
                </Space>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.subSection}>
        <div className={styles.subHeader}>
          <h4 className={styles.subTitle}>Step 2 · 外部知识库绑定</h4>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            disabled={apis.length === 0}
            onClick={() => setBindingModalOpen(true)}
          >
            创建绑定
          </Button>
        </div>
        <p className={styles.subDesc}>
          绑定客户中台侧的具体知识源,问答时携带 <code>knowledge_id</code> 调用该 API 检索。
        </p>
        {bindings.length === 0 ? (
          <Empty description="尚未创建任何外部知识库绑定" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <ul className={styles.connectionList}>
            {bindings.map((b) => {
              const api = apis.find((a) => a.id === b.apiId);
              return (
                <li key={b.id} className={styles.connectionItem}>
                  <div className={styles.connectionMain}>
                    <div className={styles.connectionName}>
                      <ExperimentOutlined /> {b.description || b.knowledgeId}
                    </div>
                    <div className={styles.connectionMeta}>
                      <Tag>API: {api?.name ?? "已删除"}</Tag>
                      <Tag color="blue">knowledge_id: {b.knowledgeId}</Tag>
                      <Tag>Top K: {b.topK}</Tag>
                      {b.scoreThreshold !== null ? (
                        <Tag color="purple">阈值: {b.scoreThreshold}</Tag>
                      ) : null}
                    </div>
                  </div>
                  <Button size="small" danger onClick={() => handleDeleteBinding(b.id)}>
                    删除
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Modal
        title={editingApiId ? "编辑外部知识库 API" : "注册外部知识库 API"}
        open={apiModalOpen}
        onCancel={() => setApiModalOpen(false)}
        onOk={handleSaveApi}
        okText="保存"
        cancelText="取消"
        confirmLoading={savingApi}
        destroyOnClose
        width={640}
      >
        <Form form={apiForm} layout="vertical" className={styles.sourceForm}>
          <div className={styles.formRow}>
            <Form.Item label="API 连接名称" name="name" rules={[{ required: true, message: "请输入连接名称" }]} className={styles.formFlex2}>
              <Input placeholder="例如：客户A 知识中台" />
            </Form.Item>
            <Form.Item label="检索路径" name="retrievalPath" tooltip="默认 /retrieval,客户中台实现该端点即可">
              <Input placeholder="/retrieval" />
            </Form.Item>
          </div>
          <div className={styles.formRow}>
            <Form.Item label="Base URL" name="baseUrl" rules={[{ required: true, message: "请输入 Base URL" }]} className={styles.formFlex2}>
              <Input placeholder="https://kb-customer.example.com" />
            </Form.Item>
            <Form.Item label="API Key" name="apiKey" tooltip="留空表示不修改已保存的 Key">
              <Input.Password placeholder="********" />
            </Form.Item>
          </div>
          <Space>
            <Button onClick={handleTestApi} loading={testing}>
              测试连接
            </Button>
          </Space>
        </Form>
      </Modal>

      <Modal
        title="创建外部知识库绑定"
        open={bindingModalOpen}
        onCancel={() => setBindingModalOpen(false)}
        onOk={handleSaveBinding}
        okText="创建"
        cancelText="取消"
        confirmLoading={savingBinding}
        destroyOnClose
        width={640}
      >
        <Form
          form={bindingForm}
          layout="vertical"
          className={styles.sourceForm}
          initialValues={{ topK: 3, scoreThreshold: 0.5 }}
        >
          <div className={styles.formRow}>
            <Form.Item label="选择 API" name="apiId" rules={[{ required: true, message: "请选择 API" }]} className={styles.formFlex2}>
              <Select
                placeholder="选择已注册的 API"
                options={apis.map((a) => ({ value: a.id, label: a.name }))}
              />
            </Form.Item>
            <Form.Item label="客户知识源 ID (knowledge_id)" name="knowledgeId" rules={[{ required: true, message: "请输入知识源 ID" }]}>
              <Input placeholder="例如：kb-prod-001" />
            </Form.Item>
          </div>
          <div className={styles.formRow}>
            <Form.Item label="Top K" name="topK" tooltip="每次检索返回的最大分段数" rules={[{ required: true }]}>
              <InputNumber min={1} max={20} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="分数阈值(可选)" name="scoreThreshold" tooltip="留空表示不设阈值">
              <InputNumber min={0} max={1} step={0.05} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="描述(可选)" name="description">
              <Input placeholder="业务侧说明" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

interface DatabaseSourceSummaryProps {
  count: number;
  icon: React.ReactNode;
}

export function SourceTabEmpty({ description }: { description: string }) {
  return <Empty description={description} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
}

export function DatabaseSourceSummary({ count, icon }: DatabaseSourceSummaryProps) {
  return (
    <Tag icon={icon ?? <DatabaseOutlined />}>
      {count} 个连接
    </Tag>
  );
}
