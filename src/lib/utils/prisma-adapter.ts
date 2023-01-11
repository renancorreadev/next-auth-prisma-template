import { PrismaClient } from '@prisma/client'

export class PrismaCLientCustom extends PrismaClient {
  async createUser(data: {
    email?: string
    name?: string
    addressWeb3: string
    emailVerified?: Date
    image?: string
    role?: 'USER' | 'ADMIN' | 'SUPERADMIN'
  }) {
    const existingUser = await this.user.findFirst({
      where: { addressWeb3: data.addressWeb3 },
    })

    if (existingUser) {
      throw new Error(
        `User with addressWeb3 ${data.addressWeb3} already exists.`
      )
    }

    return this.user.create({
      data: {
        ...data,
      },
    })
  }

  async updateUser(
    id: string,
    data: {
      email?: string
      name?: string
      addressWeb3?: string
      emailVerified?: Date
      image?: string
      role?: 'USER' | 'ADMIN' | 'SUPERADMIN'
    }
  ) {
    if (data.addressWeb3) {
      const existingUser = await this.user.findFirst({
        where: { addressWeb3: data.addressWeb3 },
      })

      if (existingUser && existingUser.id !== id) {
        throw new Error(
          `User with addressWeb3 ${data.addressWeb3} already exists.`
        )
      }
    }
    return this.user.update({
      where: { id },
      data: {
        ...data,
      },
    })
  }
}
