import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma.service';

/**
 * One-off CLI command (not exposed as HTTP) to link all unowned QuestionBanks, AssessmentTemplates,
 * and OptionSets to organizationId = 1 with ADMIN access. Idempotent.
 *
 * Run (from repo root):
 *   pnpm --filter @doneplay/api ts-node src/organization/commands/link-unowned-resources.command.ts
 * or build & run with node dist variant after compiling.
 */

const ORG_ID = 1;
const BATCH = 100; // Slightly higher for server-side execution

async function ensureQuestionBanks(prisma: PrismaService) {
  const total = await prisma.questionBank.count();
  let offset = 0,
    changed = 0;
  while (offset < total) {
    const items = await prisma.questionBank.findMany({
      skip: offset,
      take: BATCH,
      select: {
        id: true,
        createdByOrganizationId: true,
        orgLinks: { select: { organizationId: true, accessLevel: true } },
      },
    });
    if (!items.length) break;
    for (const bank of items) {
      const link = bank.orgLinks.find((l) => l.organizationId === ORG_ID);
      await prisma.$transaction(async (tx) => {
        if (!bank.createdByOrganizationId) {
          await tx.questionBank.update({
            where: { id: bank.id },
            data: { createdByOrganizationId: ORG_ID },
          });
        }
        if (!link) {
          await tx.questionBankOrganizationLink.create({
            data: {
              questionBankId: bank.id,
              organizationId: ORG_ID,
              accessLevel: 'ADMIN',
            },
          });
          changed++;
        } else if (link.accessLevel !== 'ADMIN') {
          await tx.questionBankOrganizationLink.update({
            where: {
              questionBankId_organizationId: {
                questionBankId: bank.id,
                organizationId: ORG_ID,
              },
            },
            data: { accessLevel: 'ADMIN' },
          });
          changed++;
        }
      });
    }
    offset += items.length;
  }
  return changed;
}

async function ensureTemplates(prisma: PrismaService) {
  const total = await prisma.assessmentTemplate.count();
  let offset = 0,
    changed = 0;
  while (offset < total) {
    const items = await prisma.assessmentTemplate.findMany({
      skip: offset,
      take: BATCH,
      select: {
        id: true,
        createdByOrganizationId: true,
        orgLinks: { select: { organizationId: true, accessLevel: true } },
      },
    });
    if (!items.length) break;
    for (const t of items) {
      const link = t.orgLinks.find((l) => l.organizationId === ORG_ID);
      await prisma.$transaction(async (tx) => {
        if (!t.createdByOrganizationId) {
          await tx.assessmentTemplate.update({
            where: { id: t.id },
            data: { createdByOrganizationId: ORG_ID },
          });
        }
        if (!link) {
          await tx.assessmentTemplateOrganizationLink.create({
            data: {
              templateId: t.id,
              organizationId: ORG_ID,
              accessLevel: 'ADMIN',
            },
          });
          changed++;
        } else if (link.accessLevel !== 'ADMIN') {
          await tx.assessmentTemplateOrganizationLink.update({
            where: {
              templateId_organizationId: {
                templateId: t.id,
                organizationId: ORG_ID,
              },
            },
            data: { accessLevel: 'ADMIN' },
          });
          changed++;
        }
      });
    }
    offset += items.length;
  }
  return changed;
}

async function ensureOptionSets(prisma: PrismaService) {
  const total = await prisma.optionSet.count();
  let offset = 0,
    changed = 0;
  while (offset < total) {
    const items = await prisma.optionSet.findMany({
      skip: offset,
      take: BATCH,
      select: {
        id: true,
        createdByOrganizationId: true,
        orgLinks: { select: { organizationId: true, accessLevel: true } },
      },
    });
    if (!items.length) break;
    for (const s of items) {
      const link = s.orgLinks.find((l) => l.organizationId === ORG_ID);
      await prisma.$transaction(async (tx) => {
        if (!s.createdByOrganizationId) {
          await tx.optionSet.update({
            where: { id: s.id },
            data: { createdByOrganizationId: ORG_ID },
          });
        }
        if (!link) {
          await tx.optionSetOrganizationLink.create({
            data: {
              optionSetId: s.id,
              organizationId: ORG_ID,
              accessLevel: 'ADMIN',
            },
          });
          changed++;
        } else if (link.accessLevel !== 'ADMIN') {
          await tx.optionSetOrganizationLink.update({
            where: {
              optionSetId_organizationId: {
                optionSetId: s.id,
                organizationId: ORG_ID,
              },
            },
            data: { accessLevel: 'ADMIN' },
          });
          changed++;
        }
      });
    }
    offset += items.length;
  }
  return changed;
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });
  const prisma = app.get(PrismaService);
  console.time('org1-linking');
  const qb = await ensureQuestionBanks(prisma);
  const tp = await ensureTemplates(prisma);
  const os = await ensureOptionSets(prisma);
  console.timeEnd('org1-linking');
  console.log(
    `Summary: QuestionBanks changed=${qb}, Templates changed=${tp}, OptionSets changed=${os}`,
  );
  await app.close();
}

bootstrap().catch((err) => {
  console.error('Linking script failed', err);
  process.exit(1);
});
