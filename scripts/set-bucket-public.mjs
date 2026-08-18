import { S3Client, PutBucketPolicyCommand, PutObjectAclCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: 'vn-hcm-1',
  endpoint: 'https://s3.vn-hcm-1.vietnix.cloud',
  credentials: {
    accessKeyId: 'c50868ad876ffd5555Z3',
    secretAccessKey: 'HsbseY1srG6hj8cgVDvwpVtEPb6HZ3WkDMWbIJHE',
  },
  forcePathStyle: true
});

const bucketName = 'benchydrop';

// 1. Set bucket policy to allow public read on ALL objects
const bucketPolicy = {
  Version: "2012-10-17",
  Statement: [
    {
      Sid: "PublicReadGetObject",
      Effect: "Allow",
      Principal: "*",
      Action: "s3:GetObject",
      Resource: `arn:aws:s3:::${bucketName}/*`
    }
  ]
};

console.log("Setting bucket policy to public-read...");
try {
  await s3.send(new PutBucketPolicyCommand({
    Bucket: bucketName,
    Policy: JSON.stringify(bucketPolicy)
  }));
  console.log("✅ Bucket policy set successfully!");
} catch (e) {
  console.error("❌ Bucket policy failed:", e.message);
}

// 2. Also fix all existing objects to be public-read
console.log("\nFixing existing uploaded objects...");
try {
  const list = await s3.send(new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: 'uploads/'
  }));
  
  const objects = list.Contents || [];
  console.log(`Found ${objects.length} objects in uploads/`);
  
  for (const obj of objects) {
    try {
      await s3.send(new PutObjectAclCommand({
        Bucket: bucketName,
        Key: obj.Key,
        ACL: 'public-read'
      }));
      console.log(`  ✅ ${obj.Key}`);
    } catch (e) {
      console.log(`  ⚠️ ${obj.Key}: ${e.message}`);
    }
  }
  console.log("Done!");
} catch (e) {
  console.error("❌ List objects failed:", e.message);
}
