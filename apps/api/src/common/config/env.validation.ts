export type RuntimeEnv = Record<string, string | undefined>;

function requireInProduction(env: RuntimeEnv, key: string) {
  if (env.NODE_ENV === 'production' && !env[key]) {
    throw new Error(`Variable de entorno requerida en producción: ${key}`);
  }
}

function validateJwtSecret(env: RuntimeEnv) {
  const secret = env.JWT_SECRET;
  requireInProduction(env, 'JWT_SECRET');
  if (secret && secret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
  }
}

function validateUrl(env: RuntimeEnv, key: string) {
  const value = env[key];
  if (!value) return;
  for (const candidate of value.split(',').map((item) => item.trim()).filter(Boolean)) {
    try {
      // eslint-disable-next-line no-new
      new URL(candidate);
    } catch {
      throw new Error(`${key} contiene una URL inválida: ${candidate}`);
    }
  }
}

function validatePositiveInteger(env: RuntimeEnv, key: string) {
  const value = env[key];
  if (!value) return;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${key} debe ser un entero positivo`);
  }
}

export function validateEnv(env: RuntimeEnv) {
  requireInProduction(env, 'DATABASE_URL');
  requireInProduction(env, 'APP_URL');
  requireInProduction(env, 'UPLOADS_DIR');
  validateJwtSecret(env);
  validateUrl(env, 'APP_URL');
  validateUrl(env, 'API_URL');
  validatePositiveInteger(env, 'PORT');
  validatePositiveInteger(env, 'MAX_UPLOAD_MB');
  return env;
}
