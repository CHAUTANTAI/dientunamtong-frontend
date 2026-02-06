import { Form, Input, Button, message } from "antd";
import { Profile } from "@/types/profile";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/store/api/profileApi";
import { getErrorMessage } from "@/utils/api-interceptor";

const AdminProfilePage = () => {
  const [form] = Form.useForm();
  const [updateProfile] = useUpdateProfileMutation();
  const { data, isLoading } = useGetProfileQuery();

  const onFinish = async (values: Profile) => {
    try {
      await updateProfile(values);
      message.success("Profile updated successfully");
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Profile</h1>
      <Form form={form} onFinish={onFinish}>
        <Form.Item
          name="company_name"
          label="Company Name"
          rules={[{ required: true }]}
        >
          <Input value={data?.company_name} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AdminProfilePage;
