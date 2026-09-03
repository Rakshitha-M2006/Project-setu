/**
 * PROJECT SETU — Storage Abstraction & Document Upload Security Test Suite
 */

import { localStorageService } from "../services/storage/localStorageService";
import { StorageProvider } from "@prisma/client";

async function runStorageTests() {
  console.log("==================================================================");
  console.log("🚀 TESTING STORAGE ABSTRACTION & SECURE DOCUMENT UPLOADS");
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  // ----------------------------------------------------------------------------
  // Test 1: Secure File Upload with Sanitized Key & Metadata
  // ----------------------------------------------------------------------------
  console.log("--- Test Case 1: Secure PDF & Image Storage ---");
  const samplePdfBuffer = Buffer.from("%PDF-1.4 Mock Public Grievance Document Content");
  const sampleImgBuffer = Buffer.from("RIFF Mock Image Payload");

  const pdfResult = await localStorageService.uploadFile(
    samplePdfBuffer,
    "citizen_aadhar_scan.pdf",
    "application/pdf",
    "grievance_attachments"
  );

  const imgResult = await localStorageService.uploadFile(
    sampleImgBuffer,
    "site_repair_photo.jpg",
    "image/jpeg",
    "resolution_evidence"
  );

  console.log("  PDF Upload Result:", {
    fileKey: pdfResult.fileKey,
    fileName: pdfResult.fileName,
    size: pdfResult.fileSizeBytes,
    provider: pdfResult.storageProvider,
  });

  console.log("  Image Upload Result:", {
    fileKey: imgResult.fileKey,
    fileName: imgResult.fileName,
    size: imgResult.fileSizeBytes,
    provider: imgResult.storageProvider,
  });

  if (
    pdfResult.fileKey.startsWith("grievance_attachments/") &&
    pdfResult.fileName.endsWith(".pdf") &&
    pdfResult.fileSizeBytes === samplePdfBuffer.length &&
    pdfResult.storageProvider === StorageProvider.LOCAL &&
    imgResult.fileName.endsWith(".jpg")
  ) {
    console.log("✔ Test 1 Passed: Files stored safely with randomized filenames and validated extensions\n");
    passed++;
  } else {
    console.error("✖ Test 1 Failed: Upload result structure invalid", pdfResult);
    failed++;
  }

  // ----------------------------------------------------------------------------
  // Test 2: Directory Traversal Defense Verification
  // ----------------------------------------------------------------------------
  console.log("--- Test Case 2: Path Traversal Attack Prevention ---");
  const maliciousKey = "../../../etc/passwd";
  let traversalBlocked = false;

  try {
    await localStorageService.getFileStream(maliciousKey);
  } catch (err: any) {
    console.log(`  Intercepted Malicious Traversal Key: '${maliciousKey}' -> Error: ${err.message}`);
    traversalBlocked = true;
  }

  if (traversalBlocked) {
    console.log("✔ Test 2 Passed: Directory traversal attack successfully blocked\n");
    passed++;
  } else {
    console.error("✖ Test 2 Failed: Traversal was not blocked!");
    failed++;
  }

  // ----------------------------------------------------------------------------
  // Test 3: Stream Retrieval and Integrity Check
  // ----------------------------------------------------------------------------
  console.log("--- Test Case 3: File Streaming & Integrity Check ---");
  const streamResult = await localStorageService.getFileStream(pdfResult.fileKey);

  console.log("  Stream Metadata:", {
    mimeType: streamResult.mimeType,
    fileName: streamResult.fileName,
    fileSizeBytes: streamResult.fileSizeBytes,
  });

  // Consume stream data
  const chunks: Buffer[] = [];
  await new Promise((resolve, reject) => {
    streamResult.stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    streamResult.stream.on("end", resolve);
    streamResult.stream.on("error", reject);
  });

  const streamedBuffer = Buffer.concat(chunks);

  if (
    streamResult.mimeType === "application/pdf" &&
    streamResult.fileSizeBytes === samplePdfBuffer.length &&
    streamedBuffer.equals(samplePdfBuffer)
  ) {
    console.log("✔ Test 3 Passed: File stream retrieved with exact byte-level integrity\n");
    passed++;
  } else {
    console.error("✖ Test 3 Failed: Stream metadata mismatch", streamResult);
    failed++;
  }

  // ----------------------------------------------------------------------------
  // Test 4: Storage Cleanup / File Deletion
  // ----------------------------------------------------------------------------
  console.log("--- Test Case 4: File Deletion & Purge ---");
  const deleted = await localStorageService.deleteFile(pdfResult.fileKey);
  await localStorageService.deleteFile(imgResult.fileKey);

  if (deleted) {
    console.log("✔ Test 4 Passed: File purged from storage repository\n");
    passed++;
  } else {
    console.error("✖ Test 4 Failed: Could not delete file");
    failed++;
  }

  console.log("==================================================================");
  console.log(`✨ RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runStorageTests();
