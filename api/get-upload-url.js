import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { filename, contentType } = req.body;
  if (!filename) {
    return res.status(400).json({ error: 'Missing filename' });
  }

  const region = 'vn-hcm-1';
  const endpoint = 'https://s3.vn-hcm-1.vietnix.cloud';
  
  // Các thông tin này Vercel sẽ tự động lấy từ Environment Variables (Biến môi trường)
  const accessKeyId = process.env.S3_ACCESS_KEY || 'c50868ad876ffd5555Z3'; 
  const secretAccessKey = process.env.S3_SECRET_KEY || 'HsbseY1srG6hj8cgVDvwpVtEPb6HZ3WkDMWbIJHE';
  const bucketName = process.env.S3_BUCKET_NAME || 'benchydrop';

  const s3 = new S3Client({
    region: region,
    endpoint: endpoint,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
    // Rất quan trọng khi dùng S3 không phải của Amazon
    forcePathStyle: true 
  });

  const ext = filename.split('.').pop();
  const key = `uploads/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType || 'application/octet-stream',
      // Bucket policy đã set public-read cho tất cả objects, không cần ACL riêng
    });

    // Cấp URL có thời hạn 1 giờ
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    
    // Đường dẫn tĩnh sau khi tải lên thành công
    const publicUrl = `https://s3.vn-hcm-1.vietnix.cloud/${bucketName}/${key}`;

    res.status(200).json({ uploadUrl, publicUrl });
  } catch (error) {
    console.error("S3 Presign Error:", error);
    res.status(500).json({ error: error.message });
  }
}
