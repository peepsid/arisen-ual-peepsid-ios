# UAL for PeepsID iOS Authenticator

This authenticator is meant to be used with the [PeepsID iOS Authenticator Apps](#supported-environments) and the [Universal Authenticator Library](https://github.com/peepsid/universal-authenticator-library).

![ARISEN Labs](https://img.shields.io/badge/ARISEN-Labs-5cb3ff.svg)

## Getting Started

`yarn add @arisenual/peepsid-ios`

#### Dependencies

* All apps must follow the [Manifest Specification](https://github.com/peepsid/manifest-spec)

* You must use one of the UAL renderers below.

  * React - `https://github.com/peepsid/arisen-ual-reactjs-renderer`

  * PlainJS - `https://github.com/peepsid/arisen-ual-plainjs-renderer`


#### Basic Usage with React

```javascript
import { PeepsAuthIOS } from '@arisenual/peepsid-ios'
import { UALProvider, withUAL } from '@arisenual/reactjs-renderer'

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

const peepsAuthIOS = new PeepsAuthIOS([exampleNet], { appName: 'Example App' })

<UALProvider chains={[exampleNet]} authenticators={[peepsAuthIOS]}>
  <AppWithUAL />
</UALProvider>
```

## Supported Environments

The UAL PeepsID iOS Authenticator is currently supported on the following environments and their required [options](https://github.com/peepsid/@arisenual/peepsid-ios/blob/master/src/interfaces.ts#L18) are listed below:

* Chrome Desktop Browser - [PeepsID iOS Chrome Extension Authenticator App](https://github.com/peepsid/PeepsID iOS-chrome-extension)
  * Required option: `appName`
  * Optional option: `securityExclusions`
  ```javascript
  const securityExclusions = {
    addAssertToTransactions: false
  }
  const peepsAuthIOS = new PeepsAuthIOS([exampleNet], { appName: 'Example App', securityExclusions })
  ```
* iOS - [PeepsID iOS iOS Authenticator App](https://github.com/peepsid/peepsid-ios)
  * Required options: `appName`, `protocol`
  * Optional option: `securityExclusions`
  ```javascript
  const securityExclusions = {
    addAssertToTransactions: false
  }
  const peepsAuthIOS = new PeepsAuthIOS([exampleNet], { appName: 'Example App', protocol: 'arisen', securityExclusions })
  ```

## License

[MIT](./LICENSE)
