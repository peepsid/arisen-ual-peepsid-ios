# UAL for PeepsIDiOS Authenticator

This authenticator is meant to be used with the [PeepsIDiOS Authenticator Apps](#supported-environments) and the [Universal Authenticator Library](https://github.com/arisenio/universal-authenticator-library).

![ARISEN Labs](https://img.shields.io/badge/ARISEN-Labs-5cb3ff.svg)

## Getting Started

`yarn add arisen-ual-peepsid-ios`

#### Dependencies

* All apps must follow the [Manifest Specification](https://github.com/arisenio/manifest-spec)

* You must use one of the UAL renderers below.

  * React - `https://github.com/arisenio/arisen-ual-reactjs-renderer`

  * PlainJS - `https://github.com/arisenio/arisen-ual-plainjs-renderer`


#### Basic Usage with React

```javascript
import { PeepsiOS } from 'arisen-ual-peepsid-ios'
import { UALProvider, withUAL } from '@dwebual/reactjs-renderer'

const exampleNet = {
  chainId: '',
  rpcEndpoints: [{
    protocol: '',
    host: '',
    port: '',
  }]
}

const App = (props) => <div>{JSON.stringify(props.ual)}</div>
const AppWithUAL = withUAL(App)

const peepsiOSAuth = new PeepsiOS([exampleNet], { appName: 'Example App' })

<UALProvider chains={[exampleNet]} authenticators={[peepsiOSAuth]}>
  <AppWithUAL />
</UALProvider>
```

## Supported Environments

The UAL PeepsIDiOS Authenticator is currently supported on the following environments and their required [options](https://github.com/arisenio/arisen-ual-peepsid-ios/blob/master/src/interfaces.ts#L18) are listed below:

* Chrome Desktop Browser - [PeepsIDiOS Chrome Extension Authenticator App](https://github.com/peepsx/PeepsIDiOS-chrome-extension)
  * Required option: `appName`
  * Optional option: `securityExclusions`
  ```javascript
  const securityExclusions = {
    addAssertToTransactions: false
  }
  const peepsiOSAuth = new PeepsiOS([exampleNet], { appName: 'Example App', securityExclusions })
  ```
* iOS - [PeepsIDiOS iOS Authenticator App](https://github.com/peepsx/peepsid-ios)
  * Required options: `appName`, `protocol`
  * Optional option: `securityExclusions`
  ```javascript
  const securityExclusions = {
    addAssertToTransactions: false
  }
  const peepsiOSAuth = new PeepsiOS([exampleNet], { appName: 'Example App', protocol: 'arisen', securityExclusions })
  ```

## License

[MIT](./LICENSE)
