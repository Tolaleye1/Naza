// scripts/upload-gallery-pictures.ts
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: { [key: string]: string } = {};
envContent.split('\n').forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const BUCKET = 'gallery';

async function uploadFolder(
  folderPath: string,
  pinType: 'captured_in_time' | null
) {
  if (!fs.existsSync(folderPath)) {
    console.warn(`Folder not found: ${folderPath}`);
    return;
  }

  const files = fs.readdirSync(folderPath);

  for (const filename of files) {
    const filePath = path.join(folderPath, filename);
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) continue;

    const ext = filename.split('.').pop()?.toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'webp'];
    const videoExts = ['mp4', 'mov', 'webm'];
    const isImage = imageExts.includes(ext ?? '');
    const isVideo = videoExts.includes(ext ?? '');
    if (!isImage && !isVideo) continue;

    const mediaType = isImage ? 'photo' : 'video';
    const contentType = isImage
      ? `image/${ext === 'jpg' ? 'jpeg' : ext}`
      : `video/${ext === 'mov' ? 'quicktime' : ext}`;

    const storagePath = `gallery/${Date.now()}-${filename}`;
    const fileBuffer = fs.readFileSync(filePath);

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error(`Failed to upload ${filename}:`, uploadError.message);
      continue;
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    // Insert into gallery_items
    const { error: insertError } = await supabase
      .from('gallery_items')
      .insert({
        storage_path: storagePath,
        url: urlData.publicUrl,
        media_type: mediaType,
        caption: filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
        pin_type: pinType,
      });

    if (insertError) {
      console.error(`Failed to insert ${filename}:`, insertError.message);
    } else {
      console.log(`Uploaded: ${filename} (pin: ${pinType ?? 'none'})`);
    }
  }
}

async function main() {
  const mainPicsPath = path.join(process.cwd(), 'public', 'naza-pictures', 'Main-Pictures');
  const galleryPicsPath = path.join(process.cwd(), 'public', 'naza-pictures', 'GalleryPage-pictures');

  console.log('Uploading Main-Pictures (pin: captured_in_time)...');
  await uploadFolder(mainPicsPath, 'captured_in_time');

  console.log('Uploading GalleryPage-pictures (pin: none)...');
  await uploadFolder(galleryPicsPath, null);

  console.log('Done.');
}

main().catch(console.error);
