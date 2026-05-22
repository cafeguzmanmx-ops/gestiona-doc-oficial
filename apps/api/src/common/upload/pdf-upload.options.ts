import { BadRequestException } from '@nestjs/common';
import { diskStorage, Options } from 'multer';
import { extname } from 'path';

const DEFAULT_MAX_UPLOAD_MB = 10;
const TMP_UPLOAD_DIR = '/tmp';

export function getPdfUploadOptions(): Options {
  const maxUploadMb = Number(process.env.MAX_UPLOAD_MB ?? DEFAULT_MAX_UPLOAD_MB);
  const maxBytes = Math.max(1, maxUploadMb) * 1024 * 1024;

  return {
    storage: diskStorage({ destination: TMP_UPLOAD_DIR }),
    limits: { fileSize: maxBytes, files: 1 },
    fileFilter: (_req, file, callback) => {
      const ext = extname(file.originalname).toLowerCase();
      const isPdf = file.mimetype === 'application/pdf' && ext === '.pdf';
      if (!isPdf) {
        callback(new BadRequestException('Solo se permiten archivos PDF con extensi+¦n .pdf') as any, false);
        return;
      }
      callback(null, true);
    },
  };
}
