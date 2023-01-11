import type { AppProps } from 'next/app'
import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'

import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react'

// This is the chainId your dApp will work on.
const activeChainId = ChainId.Goerli

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={session}>
      <ThirdwebProvider desiredChainId={activeChainId}>
        <Component {...pageProps} />
      </ThirdwebProvider>
    </SessionProvider>
  )
}
