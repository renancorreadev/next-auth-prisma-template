import { PrismaCLientCustom } from './prisma-adapter'

declare global {
  var prisma: PrismaCLientCustom | undefined
}

export const prisma =
  globalThis.prisma ||
  new PrismaCLientCustom({
    log: ['query', 'info'],
  })
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
