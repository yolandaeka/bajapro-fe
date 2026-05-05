"use client";
import { Card, Descriptions, Tag, Input, Radio, Button, Form, message, Space } from 'antd';
import { useRouter } from 'next/navigation';
import { useReport } from '../hooks/useReport';
import { reportApi } from '../api/reportApi';

export default function UserAnswerForm({ userId, subLessonId }: { userId: string, subLessonId: string }) {
  const router = useRouter();
  const { data, loading } = useReport(undefined, userId, subLessonId);
  const [form] = Form.useForm();

  const onSave = async (values: any) => {
    try {
      // Catatan: subLessonId di sini diasumsikan sebagai progressId berdasarkan struktur sebelumnya
      await reportApi.updateGrade(subLessonId, values);
      message.success("Penilaian berhasil disimpan!");
      router.back();
    } catch (e) { 
      message.error("Gagal menyimpan penilaian!"); 
    }
  };

  if (loading) return <div className="p-6">Memuat data...</div>;

  const errorCount = data?.logs?.filter((l: any) => l.status === 'error').length || 0;
  const successCount = data?.logs?.filter((l: any) => l.status === 'success').length || 0;

  return (
    <Card title="Detail Jawaban & Form Grading" className="shadow-sm">
      <Descriptions bordered column={{ xs: 1, sm: 2 }} className="mb-6">
        <Descriptions.Item label="Jawaban Essay" span={2}>
          <div className="bg-gray-50 p-3 rounded border">
            {data?.essay?.answer || "Belum ada jawaban essay."}
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="Statistik Eksekusi Code" span={2}>
          <Space>
            <Tag color="green" className="text-sm px-2 py-1">Berhasil: {successCount} Kali</Tag>
            <Tag color="red" className="text-sm px-2 py-1">Error: {errorCount} Kali</Tag>
          </Space>
        </Descriptions.Item>
      </Descriptions>

      <Form form={form} layout="vertical" onFinish={onSave}>
        {/* Opsional jika kamu butuh input skor essay secara manual */}
        {/* <Form.Item name="essay_score" label="Input Skor Essay" rules={[{required: true}]}>
          <Input type="number" placeholder="0 - 100" style={{ width: 200 }} />
        </Form.Item> */}
        
        <Form.Item name="status" label="Keputusan Penilaian" rules={[{required: true, message: 'Pilih status'}]}>
          <Radio.Group>
            <Radio value="approved">Approve</Radio>
            <Radio value="rejected">Reject</Radio>
          </Radio.Group>
        </Form.Item>
        
        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.status !== curr.status}>
          {({ getFieldValue }) => (
             <Form.Item 
               name="notes" 
               label="Catatan Guru"
               rules={[{ required: getFieldValue('status') === 'rejected', message: 'Catatan wajib diisi jika ditolak' }]}
             >
               <Input.TextArea rows={4} placeholder="Berikan feedback untuk murid..." />
             </Form.Item>
          )}
        </Form.Item>

        <Space className="mt-4">
          <Button onClick={() => router.back()}>Kembali</Button>
          <Button type="primary" htmlType="submit">Simpan Penilaian</Button>
        </Space>
      </Form>
    </Card>
  );
}