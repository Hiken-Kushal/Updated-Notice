import '../config/env';
import { prisma } from '../config/prisma';
import { hashPassword } from '../utils/password';

interface BootstrapConfig {
  username: string;
  email: string;
  fullName: string;
  password: string;
}

function readBootstrapConfig(): BootstrapConfig {
  const username = process.env.SUPERADMIN_BOOTSTRAP_USERNAME?.trim();
  const email = process.env.SUPERADMIN_BOOTSTRAP_EMAIL?.trim();
  const fullName = process.env.SUPERADMIN_BOOTSTRAP_FULL_NAME?.trim();
  const password = process.env.SUPERADMIN_BOOTSTRAP_PASSWORD;
  if (!username || !email || !fullName || !password) {
    throw new Error(
      'Set SUPERADMIN_BOOTSTRAP_USERNAME, SUPERADMIN_BOOTSTRAP_EMAIL, SUPERADMIN_BOOTSTRAP_FULL_NAME, and SUPERADMIN_BOOTSTRAP_PASSWORD'
    );
  }
  if ([...password].filter((character) => !/\s/.test(character)).length < 20) {
    throw new Error('SUPERADMIN_BOOTSTRAP_PASSWORD must contain at least 20 non-whitespace characters');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('SUPERADMIN_BOOTSTRAP_EMAIL must be a valid email address');
  }

  return { username, email, fullName, password };
}

async function bootstrapSuperAdmin(): Promise<void> {
  try {
    const config = readBootstrapConfig();
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: config.username }, { email: config.email }],
      },
      select: { id: true },
    });

    if (existing) {
      throw new Error('An account already uses the configured username or email. No account was changed.');
    }

    const passwordHash = await hashPassword(config.password);
    const user = await prisma.user.create({
      data: {
        username: config.username,
        email: config.email,
        fullName: config.fullName,
        passwordHash,
        role: 'SUPERADMIN',
        status: 'APPROVED',
      },
      select: { username: true, email: true },
    });

    console.log(`Created approved SuperAdmin account "${user.username}" (${user.email}).`);
    console.log('Remove the SUPERADMIN_BOOTSTRAP_* values from the environment now.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`SuperAdmin bootstrap failed: ${message}`);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void bootstrapSuperAdmin();
