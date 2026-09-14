const { createClient } = require("@supabase/supabase-js");

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn("Supabase environment variables are not configured.");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function uploadFridgeImage(userId, filePath, fileBuffer, contentType) {
  const storagePath = `${userId}/${filePath}`;

  const { data, error } = await supabase.storage
    .from("fridge-images")
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: false
    });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  return data;
}

async function deleteFridgeImage(storagePath) {
  const { error } = await supabase.storage
    .from("fridge-images")
    .remove([storagePath]);

  if (error) {
    throw new Error(`Image delete failed: ${error.message}`);
  }

  return true;
}

module.exports = {
  supabase,
  uploadFridgeImage,
  deleteFridgeImage
};
