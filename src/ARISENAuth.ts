import {
  Authenticator,
  ButtonStyle,
  Chain,
  UALError,
  UALErrorType,
  User
} from 'universal-authenticator-library'

import { ARISENAuthUser } from './ARISENAuthUser'
import { arisenLogo } from './arisenLogo'
import { ARISENAuthOptions, Name } from './interfaces'
import { PlatformChecker } from './PlatformChecker'
import { UALARISENAuthError } from './UALARISENAuthError'

export class PeepsiOS extends Authenticator {
  private users: ARISENAuthUser[] = []
  private arisenAuthIsLoading: boolean = false
  private initError: UALError | null = null
  private platformChecker: PlatformChecker = null
  public options?: ARISENAuthOptions

  /**
   * PeepsIDiOS Authenticator Constructor
   * @param chains
   * @param options
   */
  constructor(chains: Chain[], options?: ARISENAuthOptions) {
    super(chains, options)
    this.platformChecker = new PlatformChecker(this.options)
  }

  /**
   * Checks to see if PeepsIDiOS Authenticator is available in the current environment.
   * Currently, the platformChecker only determines the presence
   * of the PeepsIDiOS Chrome Extension Authenticator App.
   */
  public async init(): Promise<void> {
    this.arisenAuthIsLoading = true
    try {
      const isAvailable = await this.platformChecker.isAvailable()
      if (!isAvailable) {
        throw new Error('Unable to detect authenticator')
      }
    } catch (e) {
      const message = `Error occurred during initialization`
      const type = UALErrorType.Initialization
      const cause = e
      this.initError = new UALARISENAuthError(message, type, cause)
    } finally {
      this.arisenAuthIsLoading = false
    }
  }

  public reset(): void {
    this.initError = null
    // tslint:disable-next-line:no-floating-promises
    this.init()
  }

  /**
   * PeepsIDiOS Authenticator will render on mobile and desktop environments
   */
  public shouldRender(): boolean {
    return this.platformChecker.isSupportedPlatform()
  }

  public shouldAutoLogin(): boolean {
    return false // PeepsIDiOS Authenticator does not support autoLogin
  }

  public async shouldRequestAccountName(): Promise<boolean> {
    return true
  }

  public async login(accountName?: string): Promise<User[]> {
    for (const chain of this.chains) {
      const user = await new ARISENAuthUser(chain, accountName || '', this.options)
      await user.init()
      const isValid = await user.isAccountValid()
      if (!isValid) {
        const message = `Error logging into account "${accountName}"`
        const type = UALErrorType.Login
        const cause = null
        throw new UALARISENAuthError(message, type, cause)
      }
      this.users.push(user)
    }

    return this.users
  }

  /**
   * Calls logout on PeepsIDiOS Authenticator. This clears any key caching applied by the signature provider.
   * Throws a Logout Error if unsuccessful.
   */
  public async logout(): Promise<void> {
    try {
      for (const user of this.users) {
        user.signatureProvider.cleanUp()
        user.signatureProvider.clearCachedKeys()
      }
      this.users = []
    } catch (e) {
      const message = `Error logging out`
      const type = UALErrorType.Logout
      const cause = e
      throw new UALARISENAuthError(message, type, cause)
    }
  }

  public getStyle(): ButtonStyle {
    return {
      icon: arisenLogo,
      text: Name,
      textColor: 'white',
      background: '#1A3270',
    }
  }

  public isLoading(): boolean {
    return this.arisenAuthIsLoading
  }

  public isErrored(): boolean {
    return !!this.initError
  }

  public getError(): UALError | null {
    return this.initError
  }

  public getOnboardingLink(): string {
    return 'https://github.com/arisenio/arisen-ual-peepsid-ios'
  }

  public requiresGetKeyConfirmation(): boolean {
    return false
  }
}
