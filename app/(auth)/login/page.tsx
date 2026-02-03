/**
 * Login Page
 * Simple admin login page using unified API response format
 */

"use client";

import { Form, Card, Typography } from "antd";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/store/api/authApi";
import { getErrorMessage } from "@/utils/api-interceptor";
import {
  FormInput,
  FormPassword,
  FormSubmitButton,
} from "@/components/common/form";
import { validateUsername, validatePassword } from "@/utils/validators";
import { ROUTES } from "@/constants/routes";
import type { LoginRequest } from "@/types/auth";
import styles from "./page.module.css";
import { useAuth } from "@/hooks/useAuth";

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const [loginMutation, { isLoading }] = useLoginMutation();
  const { login } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginRequest>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      const response = await loginMutation(data).unwrap();

      // Response is already validated by api-interceptor
      // If we reach here, HTTP status was 200 and custom status was 200
      const { user, token, success } = response.data;
      if (success && token && user) {
        login(user, token);
        router.push(ROUTES.DASHBOARD);
      } else {
        setError("root", {
          message: response.message || "Login failed",
        });
      }
    } catch (error: unknown) {
      // Error handling with unified format
      const message = getErrorMessage(error);
      setError("root", { message });
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <Title level={2}>Admin Login</Title>
          <Text type="secondary">
            Enter your credentials to access the admin panel
          </Text>
        </div>

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          {/* Root error */}
          {errors.root && (
            <Form.Item>
              <Typography.Text type="danger" style={{ fontSize: "14px" }}>
                {errors.root.message}
              </Typography.Text>
            </Form.Item>
          )}

          {/* Username Field */}
          <FormInput
            name="username"
            control={control}
            label="Username"
            placeholder="Enter your username"
            rules={{
              validate: (value) => validateUsername(value) || true,
            }}
          />

          {/* Password Field */}
          <FormPassword
            name="password"
            control={control}
            label="Password"
            placeholder="Enter your password"
            rules={{
              validate: (value) => validatePassword(value) || true,
            }}
          />

          {/* Submit Button */}
          <FormSubmitButton isLoading={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </FormSubmitButton>
        </Form>

        {/* Demo credentials hint */}
        <div className={styles.hint}>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Demo: username <code>admin</code>, password <code>admin123</code>
          </Text>
        </div>
      </Card>
    </div>
  );
}
