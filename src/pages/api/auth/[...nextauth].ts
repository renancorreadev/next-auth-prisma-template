import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'

import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import { ThirdwebNextAuth } from '@thirdweb-dev/auth/next-auth'

const prisma = new PrismaClient()

export const { NextAuthHandler, getUser } = ThirdwebNextAuth({
  privateKey: process.env.ADMIN_PRIVATE_KEY || '',
  domain: 'http://localhost:3000/',
  nextOptions: {
    providers: [
      GitHubProvider({
        clientId: String(process.env.GITHUB_ID),
        clientSecret: String(process.env.GITHUB_SECRET),
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      }),
    ],
    session: {
      strategy: 'jwt',
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.role = user.role
          token.id = user.id
        }

        return token
      },
    },
    adapter: PrismaAdapter(prisma),
  },
})

export default NextAuthHandler()
