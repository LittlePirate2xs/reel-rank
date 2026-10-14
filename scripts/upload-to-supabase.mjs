import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read args or environment
const args = process.argv.slice(2);
let supabaseUrl = process.env.SUPABASE_URL || 'http://100.95.3.72:8000';
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
let bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'videos';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' && args[i + 1]) supabaseUrl = args[++i];
  if (args[i] === '--key' && args[i + 1]) supabaseKey = args[++i];
  if (args[i] === '--bucket' && args[i + 1]) bucketName = args[++i];
}

console.log('='.repeat(60));
console.log('Reel & Rank -> Supabase Media Uploader');
console.log(`Supabase URL:    ${supabaseUrl}`);
console.log(`Storage Bucket:  ${bucketName}`);
console.log(`Auth Key Status: ${supabaseKey ? `Provided (${supabaseKey.slice(0, 12)}...)` : 'MISSING'}`);
console.log('='.repeat(60));

if (!supabaseKey) {
  console.error('\n[Error] No Supabase API key provided.');
  console.log('Usage:');
  console.log('  node scripts/upload-to-supabase.mjs --key <your-service-key> [--url <url>] [--bucket <bucket>]');
  console.log('Or set SUPABASE_SERVICE_ROLE_KEY in .env.local\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const videosToUpload = [
  {
    localPath: path.join(rootDir, 'public', 'media', 'films', 'film-01.mp4'),
    destPath: 'films/film-01.mp4',
    alt: 'Flavors Chase Me Beach Grill',
  },
  {
    localPath: path.join(rootDir, 'public', 'media', 'films', 'film-02.mp4'),
    destPath: 'films/film-02.mp4',
    alt: 'Flavors Chase Me Beach',
  },
  {
    localPath: path.join(rootDir, 'public', 'media', 'motion', 'motion-01.mp4'),
    destPath: 'motion/motion-01.mp4',
    alt: 'Autumn Cover Motion',
  },
  {
    localPath: path.join(rootDir, 'public', 'media', 'motion', 'motion-02.mp4'),
    destPath: 'motion/motion-02.mp4',
    alt: 'Fall Spice Reel 9x16',
  },
  {
    localPath: path.join(rootDir, 'public', 'media', 'motion', 'motion-03.mp4'),
    destPath: 'motion/motion-03.mp4',
    alt: 'Facebook Cover Autumn Motion',
  },
];

async function main() {
  // 1. Ensure bucket exists or create it
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.warn('[Warning] Could not list buckets:', listError.message);
    } else {
      const exists = buckets?.some(b => b.name === bucketName || b.id === bucketName);
      if (!exists) {
        console.log(`[Info] Bucket "${bucketName}" not found. Creating public bucket...`);
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 104857600, // 100MB
        });
        if (createError) {
          console.warn(`[Warning] Could not create bucket "${bucketName}":`, createError.message);
        } else {
          console.log(`[Success] Bucket "${bucketName}" created.`);
        }
      } else {
        console.log(`[Info] Bucket "${bucketName}" exists.`);
      }
    }
  } catch (err) {
    console.warn('[Warning] Bucket inspection error:', err.message);
  }

  // 2. Upload each video file
  console.log('\nStarting video uploads...');
  const uploadedUrls = [];

  for (const item of videosToUpload) {
    if (!fs.existsSync(item.localPath)) {
      console.warn(`[Skip] File not found: ${item.localPath}`);
      continue;
    }

    const fileStats = fs.statSync(item.localPath);
    const sizeMb = (fileStats.size / (1024 * 1024)).toFixed(2);
    console.log(`\nUploading ${item.destPath} (${sizeMb} MB)...`);

    const fileBuffer = fs.readFileSync(item.localPath);
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(item.destPath, fileBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (error) {
      console.error(`[Error] Failed to upload ${item.destPath}:`, error.message);
    } else {
      const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(item.destPath);
      console.log(`[Success] Uploaded: ${publicData.publicUrl}`);
      uploadedUrls.push({
        id: item.destPath,
        url: publicData.publicUrl,
        sizeMb,
      });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Upload summary: ${uploadedUrls.length}/${videosToUpload.length} videos uploaded successfully.`);
  console.log('='.repeat(60));
}

main().catch(err => {
  console.error('[Fatal Error]:', err);
  process.exit(1);
});
