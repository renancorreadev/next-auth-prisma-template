import GitHubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '../../../lib/utils/prisma'

import { NextApiRequest, NextApiResponse } from 'next'
import NextAuth, { NextAuthOptions } from 'next-auth'
import { IncomingMessage } from 'http'

import { getCsrfToken } from 'next-auth/react'
import { SiweMessage } from 'siwe'
import CredentialsProvider from 'next-auth/providers/credentials'

export function getAuthOptions(req: IncomingMessage): NextAuthOptions {
  const providers = [
    CredentialsProvider({
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(JSON.parse(credentials?.message || '{}'))

          const nextAuthUrl =
            process.env.NEXTAUTH_URL ||
            (process.env.VERCEL_URL
              ? `https://${process.env.VERCEL_URL}`
              : null)
          if (!nextAuthUrl) {
            return null
          }

          const nextAuthHost = new URL(nextAuthUrl).host
          if (siwe.domain !== nextAuthHost) {
            return null
          }

          if (siwe.nonce !== (await getCsrfToken({ req }))) {
            return null
          }

          await siwe.validate(credentials?.signature || '')

          // return the user object with the properties defined on User
          return {
            id: siwe.address,
            emailVerified: new Date(), // <-- Make sure this matches the expected type
            addressWeb3: siwe.address,
            role: 'USER',
          }
        } catch (e) {
          return null
        }
      },
      credentials: {
        message: {
          label: 'Message',
          placeholder: '0x0',
          type: 'text',
        },
        signature: {
          label: 'Signature',
          placeholder: '0x0',
          type: 'text',
        },
      },
      name: 'Ethereum',
    }),
    GitHubProvider({
      clientId: String(process.env.GITHUB_ID),
      clientSecret: String(process.env.GITHUB_SECRET),
    }),
  ]

  return {
    adapter: PrismaAdapter(prisma),
    callbacks: {
      //@ts-ignore
      async jwt({ token, user }) {
        if (user) {
          token.role = user.role
          token.id = user.id
        }

        return token
      },
    },
    // https://next-auth.js.org/configuration/providers/oauth
    providers,
    secret: process.env.NEXTAUTH_SECRET,
    session: {
      strategy: 'jwt',
    },
  }
}

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const authOptions = getAuthOptions(req)

  if (!Array.isArray(req.query.nextauth)) {
    res.status(400).send('Bad request')
    return
  }

  const isDefaultSigninPage =
    req.method === 'GET' &&
    req.query.nextauth.find((value) => value === 'signin')

  // Hide Sign-In with Ethereum from default sign page
  if (isDefaultSigninPage) {
    authOptions.providers.pop()
  }

  return await NextAuth(req, res, authOptions)
}
