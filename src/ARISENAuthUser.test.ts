import { Chain, UALErrorType } from 'universal-authenticator-library'
import { Api, JsonRpc } from 'eosjs'

import { ARISENAuthUser } from './ARISENAuthUser'
import { PlatformChecker } from './PlatformChecker'

let signatureProviderMock: jest.Mock
let getReturnUrlMock: jest.Mock
let getSupportedSignatureProviderMock: jest.Mock

jest.mock('./PlatformChecker', () => ({
  PlatformChecker: jest.fn().mockImplementation(() => ({
    declaredDomain: 'testDeclaredDomain',
    getSupportedSignatureProvider: getSupportedSignatureProviderMock,
    getReturnUrl: getReturnUrlMock
  }))
}))

let transactMock: jest.Mock

jest.mock('eosjs', () => ({
  Api: jest.fn().mockImplementation(() => ({
    transact: transactMock
  })),
  JsonRpc: jest.fn()
}))

describe('ARISENAuthUser', () => {
  let chain: Chain
  let arisenAuthUser: ARISENAuthUser

  beforeEach(() => {
    signatureProviderMock = jest.fn()
    getReturnUrlMock = jest.fn().mockReturnValue('testReturnURL')
    getSupportedSignatureProviderMock = jest.fn().mockReturnValue(signatureProviderMock)

    chain = {
      chainId: 'testChainId',
      rpcEndpoints: [{
        protocol: 'https',
        host: 'testHost',
        port: 1234,
      }]
    }

    arisenAuthUser = new ARISENAuthUser(chain, 'testAccount')
  })

  describe('init', () => {
    beforeEach(async () => {
      await arisenAuthUser.init()
    })

    it('creates a new PlatformChecker', () => {
      expect(PlatformChecker).toHaveBeenCalled()
    })

    it('gets the returnUrl from PlatformChecker', () => {
      expect(getReturnUrlMock).toHaveBeenCalled()
    })

    it('gets the SignatureProvider Class from PlatformChecker ', () => {
      expect(getSupportedSignatureProviderMock).toHaveBeenCalled()
    })

    it('creates a new SignatureProvider', () => {
      expect(signatureProviderMock).toHaveBeenCalledWith({
        declaredDomain: 'testDeclaredDomain',
        returnUrl: 'testReturnURL'
      })
    })

    it('creates a new SignatureProvider with options when given', async () => {
      const options = {
        appName: 'testAppName'
      }
      const arisenAuthUser = new ARISENAuthUser(chain, 'testAccount', options)
      await arisenAuthUser.init()

      expect(signatureProviderMock).toHaveBeenCalledWith({
        declaredDomain: 'testDeclaredDomain',
        returnUrl: 'testReturnURL',
        options,
      })
    })

    it('creates a new SignatureProvider with security exclusions when given', async () => {
      const options = {
        appName: 'testAppName',
        securityExclusions: {
          addAssertToTransactions: false 
        }
      }
      const arisenAuthUser = new ARISENAuthUser(chain, 'testAccount', options)
      await arisenAuthUser.init()

      expect(signatureProviderMock).toHaveBeenCalledWith({
        declaredDomain: 'testDeclaredDomain',
        returnUrl: 'testReturnURL',
        securityExclusions: options.securityExclusions,
        options,
      })
    })

    it('creates a new eosjs JsonRpc with the correct rpc endpoint', () => {
      expect(JsonRpc).toHaveBeenCalledWith('https://testHost:1234')
    })

    it('creates a new eosjs Api', () => {
      expect(Api).toHaveBeenCalled()
    })
  })

  describe(('signTransaction'), () => {
    let transaction

    beforeEach(async () => {
      transactMock = jest.fn().mockReturnValue({
        transaction_id: 'abcd',
        processed: {
          receipt: {
            status: 'executed',
          }
        }
      })

      transaction = {
        actions: [{
          account: 'example',
          name: 'test',
          authorization: [{
            actor: 'test',
            permission: 'active',
          }]
        }],
      }

      await arisenAuthUser.init()
    })

    it('calls eosjs Api with the transaction and transaction configuration if given', async () => {
      const transactionConfig = { broadcast: false, blocksBehind: 6, expireSeconds: 90 }
      await arisenAuthUser.signTransaction(transaction, transactionConfig)
  
      expect(transactMock).toHaveBeenCalledWith(transaction,  transactionConfig)
    })

    it('calls eosjs Api with the transaction and default configuration if none given', async () => {
      await arisenAuthUser.signTransaction(transaction, {})
  
      expect(transactMock).toHaveBeenCalledWith(transaction,  { broadcast: true, blocksBehind: 3, expireSeconds: 30 })
    })

    it('signs transactions', async () => {
      const transactionResponse = await arisenAuthUser.signTransaction(transaction, { broadcast: true })
  
      expect(transactionResponse).toEqual({
        wasBroadcast: true,
        transactionId: 'abcd',
        status: 'executed',
        transaction: {
          processed: {
            receipt: {
              status: 'executed'
            }
          },
          transaction_id: 'abcd',
        }
      })
    })

    it('throws a Signing Error if an error is thrown while attempting to sign the transaction with eosjs Api', async (done) => {
      transactMock.mockImplementation(() => { throw new Error('Unable to sign') })

      try {
        await arisenAuthUser.signTransaction(transaction, {})
      } catch (error) {
        expect(error.type).toEqual(UALErrorType.Signing)
        done()
      }
    })

    it('throws a Signing Error with an Initialization Error as the cause if the eosjs Api is not initialized', async (done) => {
      arisenAuthUser = new ARISENAuthUser(chain, 'testAccount')

      try {
        await arisenAuthUser.signTransaction(transaction, {})
      } catch (error) {
        expect(error.type).toEqual(UALErrorType.Signing)
        expect(error.cause.type).toEqual(UALErrorType.Initialization)
        done()
      }
    })
  })
})
