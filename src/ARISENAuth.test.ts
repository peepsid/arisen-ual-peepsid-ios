import { Chain, User } from 'universal-authenticator-library'

import { PeepsiOS } from './PeepsiOS'
import { ARISENAuthUser } from './ARISENAuthUser'
import { PlatformChecker } from './PlatformChecker'
import { UALARISENAuthError } from './UALARISENAuthError'
import { ARISENAuthOptions } from './interfaces'

describe('PeepsiOS', () => {
  let chain: Chain
  let peepsiOSAuth: PeepsiOS
  let options: ARISENAuthOptions

  beforeAll(() => {
    chain = {
      chainId: '',
      rpcEndpoints: [{
        protocol: '',
        host: '',
        port: 1234,
      }]
    }
    options = { appName: '', protocol: ''}
  })

  describe('should render', () => {
    beforeAll(() => {
      peepsiOSAuth = new PeepsiOS([chain], options)
    })

    it('true if authenticator has platform support', () => {
      PlatformChecker.prototype.isSupportedPlatform = jest.fn().mockReturnValue(true)
      expect(peepsiOSAuth.shouldRender()).toEqual(true)
    })

    it('false if authenticator does not have platform support', () => {
      PlatformChecker.prototype.isSupportedPlatform = jest.fn().mockReturnValue(false)
      expect(peepsiOSAuth.shouldRender()).toEqual(false)
    })
  })

  describe('initializes', () => {
    beforeEach(() => {
      peepsiOSAuth = new PeepsiOS([chain], options)
    })

    it('with a status of loading', () => {
      expect(peepsiOSAuth.isLoading()).toEqual(false)
      peepsiOSAuth.init()
      expect(peepsiOSAuth.isLoading()).toEqual(true)
    })

    it('without error if authenticator is available', async () => {
      PlatformChecker.prototype.isSupportedPlatform = jest.fn().mockReturnValue(true)
      await peepsiOSAuth.init()
      expect(peepsiOSAuth.isErrored()).toEqual(false)
    })

    it('with an error if authenticator is unavailable', async () => {
      PlatformChecker.prototype.isSupportedPlatform = jest.fn().mockReturnValue(false)
      await peepsiOSAuth.init()
      expect(peepsiOSAuth.isErrored()).toEqual(true)
    })
  })

  describe('on login', () => {
    beforeEach(() => {
      peepsiOSAuth = new PeepsiOS([chain], options)
    })

    it('returns an array of users if account is valid', async () => {
      ARISENAuthUser.prototype.isAccountValid = jest.fn().mockReturnValue(true)
      const users: User[] = await peepsiOSAuth.login()
      expect(users.length).toEqual(1)
    })

    it('throws a login error if account is invalid', () => {
      ARISENAuthUser.prototype.isAccountValid = jest.fn().mockReturnValue(false)
      expect(peepsiOSAuth.login()).rejects.toThrow(UALARISENAuthError)
    })
  })

  describe('on logout', () => {
    let users
    beforeAll(() => {
      peepsiOSAuth = new PeepsiOS([chain], options)
      ARISENAuthUser.prototype.isAccountValid = jest.fn().mockReturnValue(true)
    })

    beforeEach(async () => {
      users = await peepsiOSAuth.login() 
    })

    it('calls cleanUp on the active user\'s signatureProvider', async () => {
      const spy = jest.spyOn(users[0].signatureProvider, 'cleanUp')
      await peepsiOSAuth.logout()
      expect(spy).toHaveBeenCalled()
    })

    it('calls clearCachedKeys on the active user\'s signatureProvider', async () => {
      const spy = jest.spyOn(users[0].signatureProvider, 'clearCachedKeys')
      await peepsiOSAuth.logout()
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('on reset', () => {
    beforeEach(async () => {
      peepsiOSAuth = new PeepsiOS([chain], options)
      PlatformChecker.prototype.isSupportedPlatform = jest.fn().mockReturnValue(false)
      await peepsiOSAuth.init()
    })

    it('clears any initialization error', () => {
      expect(peepsiOSAuth.isErrored()).toEqual(true)
      peepsiOSAuth.reset()
      expect(peepsiOSAuth.isErrored()).toEqual(false)
    })

    it('calls init', () => {
      const spy = jest.spyOn(peepsiOSAuth, 'init')
      peepsiOSAuth.reset()
      expect(spy).toHaveBeenCalled()
    })
  })
})
