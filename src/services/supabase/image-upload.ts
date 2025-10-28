import { supabaseClient } from "@src/lib/supbase";

export const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "estante-infinita";
export const BOOK_IMAGES_PATH = "book-images";

export async function uploadImageToSupabase(file: Express.Multer.File): Promise<string> {
  const fileExt = file.originalname.split(".").pop();
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
  const filePath = `${BOOK_IMAGES_PATH}/${fileName}`;

  const { error } = await supabaseClient.storage.from(SUPABASE_BUCKET).upload(filePath, file.buffer, {
    contentType: file.mimetype,
    upsert: true,
  });

  if (error) {
    throw new Error("Falha ao fazer upload da imagem");
  }

  const { data: urlData } = supabaseClient.storage.from(SUPABASE_BUCKET).getPublicUrl(filePath);

  return urlData.publicUrl;
}
