const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

let supabase = null;

if (!config.supabase.url || !config.supabase.key) {
  console.error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_KEY environment variables.');
  console.error('Image uploads will be disabled until Supabase is configured.');
} else {
  supabase = createClient(config.supabase.url, config.supabase.key);
}

// Function to upload image to Supabase storage
async function uploadImageToSupabase(base64Data, fileName) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_KEY environment variables.');
  }
  
  try {
    // Convert base64 to buffer
    const base64String = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64String, 'base64');
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = base64Data.match(/data:image\/([a-z]+);base64/)?.[1] || 'png';
    const uniqueFileName = `${timestamp}_${fileName}.${fileExtension}`;
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('tenderconnect')
      .upload(uniqueFileName, buffer, {
        contentType: `image/${fileExtension}`,
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error('Failed to upload image to Supabase');
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('tenderconnect')
      .getPublicUrl(uniqueFileName);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

module.exports = {
  supabase,
  uploadImageToSupabase
}; 