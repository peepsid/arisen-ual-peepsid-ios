# UAL for dWebID Authenticator

This authenticator is meant to be used with the [dWebID Authenticator Apps](#supported-environments) and the [Universal Authenticator Library](https://github.com/arisenio/universal-authenticator-library).

![ARISEN Labs](https://img.shields.io/badge/ARISEN-Labs-5cb3ff.svg)

## Getting Started

`yarn add arisen-ual-dwebid`

#### Dependencies

* All apps must follow the [Manifest Specification](https://github.com/arisenio/arisen-manifest-spec)

* You must use one of the UAL renderers below.

  * React - `https://github.com/arisenio/dwebual-reactjs-renderer`

  * PlainJS - `https://github.com/arisenio/dwebarisen-ual-plainjs-renderer`


#### Basic Usage with React

```javascript
import { ARISENAuth } from 'arisen-ual-dwebid'
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

const arisenAuth = new ARISENAuth([exampleNet], { appName: 'Example App' })

<UALProvider chains={[exampleNet]} authenticators={[arisenAuth]}>
  <AppWithUAL />
</UALProvider>
```

## Supported Environments

The UAL dWebID Authenticator is currently supported on the following environments and their required [options](https://github.com/arisenio/arisen-ual-dwebid/blob/master/src/interfaces.ts#L18) are listed below:

* Chrome Desktop Browser - [dWebID Chrome Extension Authenticator App](https://github.com/peepsx/dWebID-chrome-extension)
  * Required option: `appName`
  * Optional option: `securityExclusions`
  ```javascript
  const securityExclusions = {
    addAssertToTransactions: false
  }
  const arisenAuth = new ARISENAuth([exampleNet], { appName: 'Example App', securityExclusions })
  ```
* iOS - [dWebID iOS Authenticator App](https://github.com/peepsx/dWebID-ios)
  * Required options: `appName`, `protocol`
  * Optional option: `securityExclusions`
  ```javascript
  const securityExclusions = {
    addAssertToTransactions: false
  }
  const arisenAuth = new ARISENAuth([exampleNet], { appName: 'Example App', protocol: 'arisen', securityExclusions })
  ```

## License

[MIT](./LICENSE)
