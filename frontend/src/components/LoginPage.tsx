import { useEffect, useState } from "react";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import styles from "./LoginPage.module.css";
import {
  AUTH_SESSION_TTL_DAYS,
  getExpectedCredentials,
  readAuthSession,
  writeAuthSession,
} from "./authSession";

export type LoginPageProps = {
  onAuthenticated: (username: string) => void;
};

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const session = readAuthSession();
    if (session) {
      onAuthenticated(session.username);
    }
  }, [onAuthenticated]);

  const handleFinish = (values: { username: string; password: string }) => {
    setSubmitting(true);
    const { username: expectedUser, password: expectedPassword } =
      getExpectedCredentials();
    const ok =
      values.username === expectedUser && values.password === expectedPassword;
    if (!ok) {
      setSubmitting(false);
      message.error("账号或密码错误");
      return;
    }
    writeAuthSession(values.username);
    message.success(`欢迎回来，${values.username}`);
    setSubmitting(false);
    onAuthenticated(values.username);
  };

  return (
    <div className={styles.page}>
      <Card className={styles.card} bordered={false}>
        <div className={styles.brand}>
          <Typography.Title level={3} className={styles.brandTitle}>
            销售助手
          </Typography.Title>
          <Typography.Text type="secondary" className={styles.brandSubtitle}>
            工业销售助手 · 请登录以继续
          </Typography.Text>
        </div>

        <div className={styles.divider} aria-hidden />

        <Form
          layout="vertical"
          size="large"
          initialValues={{ username: "" }}
          onFinish={handleFinish}
          autoComplete="off"
        >
          <Form.Item
            label="账号"
            name="username"
            rules={[{ required: true, message: "请输入账号" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入账号"
              autoComplete="username"
              allowClear
            />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={submitting}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <Typography.Paragraph type="secondary" className={styles.hint}>
          登录成功后将保持 {AUTH_SESSION_TTL_DAYS} 天免登录，到期自动失效。
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
