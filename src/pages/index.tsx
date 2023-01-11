import React from 'react'
import { signIn, useSession, signOut } from 'next-auth/react'
import { withGraphql } from '../lib/graphql/with-graphql'
import { useViewerQuery } from '../lib/graphql/viewer.generated'
import { Viewer } from '../components/viewer'

import {
  useAddress,
  useDisconnect,
  useMetamask,
  useSDK,
} from '@thirdweb-dev/react'

const Index = () => {
  const sdk = useSDK()
  const address = useAddress()
  const connect = useMetamask()
  const disconnect = useDisconnect()
  const { data: session } = useSession()

  const loginWithWallet = async () => {
    try {
      const domain = 'http://localhost:3000/'
      const payload = await sdk?.auth.login(domain)
      await signIn('credentials', { payload: JSON.stringify(payload) })
    } catch (err) {
      throw err
    }
  }

  const [{ fetching, data, error }] = useViewerQuery()

  if (fetching) {
    return <div>Loading</div>
  }
  if (error) {
    return <div>{error.message}</div>
  }
  if (data?.viewer) {
    return <Viewer viewer={data?.viewer} />
  }

  return (
    <>
      {session ? (
        <>
          <button onClick={() => signOut()}>Logout</button>
          <pre>User: {JSON.stringify(session)}</pre>
        </>
      ) : (
        <>
          <button onClick={() => signIn()}>Login with web2</button>
          {address ? (
            <>
              <button onClick={loginWithWallet}>Login with Wallet</button>
              <button onClick={disconnect}>Disconnect Wallet</button>
              <br />
              <p>Your address: {address}</p>
            </>
          ) : (
            <button onClick={connect}>Connect Wallet</button>
          )}
        </>
      )}
    </>
  )
}

export default withGraphql(Index)
