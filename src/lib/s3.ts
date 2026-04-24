import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const endpoint = process.env.DO_SPACES_ENDPOINT;
const region = process.env.DO_SPACES_REGION;
const key = process.env.DO_SPACES_KEY;
const secret = process.env.DO_SPACES_SECRET;
const bucket = process.env.DO_SPACES_BUCKET;
const cdnEndpoint = process.env.DO_SPACES_CDN_ENDPOINT;

const s3Client = new S3Client({
    endpoint: endpoint,
    region: region,
    credentials: {
        accessKeyId: key!,
        secretAccessKey: secret!,
    },
});

/**
 * Sube un archivo a DigitalOcean Spaces
 * @param file Buffer o Blob del archivo
 * @param fileName Nombre del archivo con el que se guardará
 * @param folder Carpeta dentro del bucket (ej: 'visitas' o 'personal')
 * @returns La URL pública del archivo
 */
export async function uploadToSpaces(file: Buffer | Uint8Array, fileName: string, folder: string): Promise<string> {
    const keyPath = `${folder}/${fileName}`;
    
    try {
        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: bucket!,
                Key: keyPath,
                Body: file,
                ACL: "public-read",
                ContentType: getContentType(fileName),
            },
        });

        await upload.done();
        
        // Retornar la URL del CDN si está configurado, o el endpoint directo del bucket
        return cdnEndpoint 
            ? `${cdnEndpoint}/${keyPath}` 
            : `${endpoint}/${bucket}/${keyPath}`;
    } catch (error) {
        console.error("Error subiendo archivo a DigitalOcean Spaces:", error);
        throw new Error("No se pudo subir el archivo al almacenamiento en la nube");
    }
}

/**
 * Elimina un archivo de DigitalOcean Spaces
 * @param fileUrl URL completa del archivo
 */
export async function deleteFromSpaces(fileUrl: string) {
    try {
        // Extraer el Key desde la URL
        // La URL suele ser https://bucket.region.digitaloceanspaces.com/folder/file.ext
        // o https://cdn-url/folder/file.ext
        let key = "";
        if (cdnEndpoint && fileUrl.startsWith(cdnEndpoint)) {
            key = fileUrl.replace(`${cdnEndpoint}/`, "");
        } else {
            // Intento genérico basado en el nombre del bucket
            const bucketPart = `${bucket}.${region}.digitaloceanspaces.com/`;
            if (fileUrl.includes(bucketPart)) {
                key = fileUrl.split(bucketPart)[1];
            } else if (fileUrl.includes(endpoint!)) {
                key = fileUrl.split(`${endpoint}/`)[1].replace(`${bucket}/`, "");
            }
        }

        if (!key) return;

        const command = new DeleteObjectCommand({
            Bucket: bucket!,
            Key: key,
        });

        await s3Client.send(command);
    } catch (error) {
        console.error("Error eliminando archivo de DigitalOcean Spaces:", error);
    }
}

function getContentType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'png': return 'image/png';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'webp': return 'image/webp';
        case 'pdf': return 'application/pdf';
        case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        case 'csv': return 'text/csv';
        default: return 'application/octet-stream';
    }
}
