import { Chain, User } from 'universal-authenticator-library'

import { ARISENAuth } from './ARISENAuth'
import { ARISENAuthUser } from './ARISENAuthUser'
import { PlatformChecker } from './PlatformChecker'
import { UALEOSIOAuthError } from './UALEOSIOAuthError'
import { EOSIOAuthOptions } from './interfaces'

describe('ARISENAuth', () => {
  let chain: Chain
  let arisenAuth: ARISENAuth
  let options: EOSIOAuthOptions

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
      arisenAuth = new ARISENAuth([chain], options)
    })

    it('true if authenticator has platform support', () => {
      PlatformChecker.prototype.isSupportedPlatform = jest.fn().mockReturnValue(true)
      expect(arisenAuth.shouldRender()).toEqual(true)
    })

    it('false if authenticator does not have platform support', () => {
      PlatformChecker.prototype.isSupportedPlatform = jest.fn().mockReturnValue(false)
      expect(arisenAuth.shouldRender()).toEqual(false)
    })
  })

  describe('initializes', () => {
    beforeEach(() => {
      arisenAuth = new ARISENAuth([chain], options)
    })

    it('with a status of loading', () => {
      expect(arisenAuth.isLoading()).toEqual(false)
      arisenAuth.init()
      expect(arisenAuth.isLoading()).toEqual(true)
    })

    it('without error if authenticator is available', async () => {
      PlatformChecker.prototype.isSupportedPlatform = jest.fn().mockReturnValue(true)
      await arisenAuth.init()
      expect(arisenAuth.isErrored()).toEqual(false)
    })

    it('with an error if authenticator is unavailable', async () => {
      PlatformChecker.prototype.isSupportedPlatform = jest.fn().mockReturnValue(false)
      await arisenAuth.init()
      expect(arisenAuth.isErrored()).toEqual(true)
    })
  })

  describe('on login', () => {
    beforeEach(() => {
      arisenAuth = new ARISENAuth([chain], options)
    })

    it('returns an array of users if account is valid', async () => {
      ARISENAuthUser.prototype.isAccountValid = jest.fn().mockReturnValue(true)
      const users: User[] = await arisenAuth.login()
      expect(users.length).toEqual(1)
    })

    it('throws a login error if account is invalid', () => {
      ARISENAuthUser.prototype.isAccountValid = jest.fn().mockReturnValue(false)
      expect(arisenAuth.login()).rejects.toThrow(UALEOSIOAuthError)
    })
  })

  describe('on logout', () => {
    let users
    beforeAll(() => {
      arisenAuth = new ARISENAuth([chain], options)
      ARISENAuthUser.prototype.isAccountValid = jest.fn().mockReturnValue(true)
    })

    beforeEach(async () => {
      users = await arisenAuth.login() 
    })

    it('calls cleanUp on the active user\'s signatureProvider', async () => {
      const spy = jest.spyOn(users[0].signatureProvider, 'cleanUp')
      await arisenAuth.logout()
      expect(spy).toHaveBeenCalled()
    })

    it('calls clearCachedKeys on the active user\'s signatureProvider', async () => {
      const spy = jest.spyOn(users[0].signatureProvider, 'clearCachedKeys')
      await arisenAuth.logout()
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('on reset', () => {
    beforeEach(async () => {
      arisenAuth = new ARISENAuth([chain], options)
      PlatformChecker.prototype.isSupportedPlatform = jest.fn().mockReturnValue(false)
      await arisenAuth.init()
    })

    it('clears any initialization error', () => {
      expect(arisenAuth.isErrored()).toEqual(true)
      arisenAuth.reset()
      expect(arisenAuth.isErrored()).toEqual(false)
    })

    it('calls init', () => {
      const spy = jest.spyOn(arisenAuth, 'init')
      arisenAuth.reset()
      expect(spy).toHaveBeenCalled()
    })
  })
})
