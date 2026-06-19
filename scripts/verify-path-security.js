import path from 'path';
import process from 'process';

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
const BACKUP_DIR = path.join(process.cwd(), "backups");

function validateStoragePath(relativePath) {
    // Normalize and resolve path
    const normalizedRelativePath = relativePath.replace(/\\/g, '/');
    const resolvedPath = path.resolve(UPLOAD_ROOT, normalizedRelativePath);
    const relative = path.relative(UPLOAD_ROOT, resolvedPath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
        throw new Error("Invalid path: path traversal detected");
    }
    return resolvedPath;
}

function validateBackupFilename(filename) {
    const safeFilename = path.basename(filename);
    const backupDir = path.resolve(BACKUP_DIR);
    const filePath = path.join(backupDir, safeFilename);

    if (safeFilename !== filename || !filePath.startsWith(backupDir)) {
        throw new Error("Invalid filename");
    }
    return filePath;
}

const storageTestCases = [
    { input: "file.txt", expected: "pass" },
    { input: "subdir/file.txt", expected: "pass" },
    { input: "../etc/passwd", expected: "fail" },
    { input: "/etc/passwd", expected: "fail" },
    { input: "subdir/../../etc/passwd", expected: "fail" },
    { input: "..\\windows\\system32", expected: "fail" },
    { input: "subdir\\..\\..\\etc\\passwd", expected: "fail" },
    { input: "../uploads_secret/config.json", expected: "fail" }, // Prefix bypass check
];

const backupTestCases = [
    { input: "backup-2023-01-01.zip", expected: "pass" },
    { input: "../backup-2023-01-01.zip", expected: "fail" },
    { input: "subdir/backup-2023-01-01.zip", expected: "fail" },
    { input: "/etc/passwd", expected: "fail" },
    { input: "backup-..-test.zip", expected: "pass" },
    { input: "backup-..\test.zip", expected: "pass" }, // In latest version it might pass path.basename if it's treated as filename
];

console.log("--- Testing Storage Path Validation ---");
storageTestCases.forEach(tc => {
    try {
        const result = validateStoragePath(tc.input);
        console.log(`Input: ${tc.input.padEnd(30)} | Result: PASS | Expected: ${tc.expected}`);
    } catch (e) {
        console.log(`Input: ${tc.input.padEnd(30)} | Result: FAIL (${e.message}) | Expected: ${tc.expected}`);
    }
});

console.log("\n--- Testing Backup Filename Validation ---");
backupTestCases.forEach(tc => {
    try {
        const result = validateBackupFilename(tc.input);
        console.log(`Input: ${tc.input.padEnd(30)} | Result: PASS | Expected: ${tc.expected}`);
    } catch (e) {
        console.log(`Input: ${tc.input.padEnd(30)} | Result: FAIL (${e.message}) | Expected: ${tc.expected}`);
    }
});
