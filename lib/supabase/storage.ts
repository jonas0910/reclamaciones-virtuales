import { createClient } from "./client";

/**
 * Sube un archivo de logotipo al bucket público "logos" en Supabase Storage
 * bajo una ruta segura basada en el UUID del usuario autenticado.
 * 
 * @param file Objeto de archivo de tipo File
 * @returns La URL pública del logotipo subido
 */
export async function uploadLogo(file: File): Promise<string> {
  const supabase = createClient();
  
  // 1. Obtener la sesión del usuario actual
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("No autenticado. Por favor inicia sesión.");
  }

  // 2. Generar un nombre único de archivo para evitar colisiones
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  // 3. Subir el archivo al bucket "logos"
  const { error: uploadError } = await supabase.storage
    .from("logos")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  // 4. Obtener y retornar la URL pública del archivo
  const { data: { publicUrl } } = supabase.storage
    .from("logos")
    .getPublicUrl(filePath);

  return publicUrl;
}
