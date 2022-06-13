require('dotenv').config()
require('@nomiclabs/hardhat-etherscan')
require('@nomiclabs/hardhat-waffle')
require('hardhat-gas-reporter')
require('solidity-coverage')
require('hardhat-deploy')

const RINKBEY_RPC_URL = process.env.RINKBEY_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINTMARKETCAP_API_KEY = process.env.COINTMARKETCAP_API_KEY

module.exports = {
    // solidity: '0.8.8',
    solidity: {
        compilers: [{ version: '0.8.8' }, { version: '0.6.6' }],
    },
    defaultNetwork: 'hardhat',
    networks: {
        rinkbey: {
            url: RINKBEY_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 4,
            blockConfirmations: 6,
        },
    },
    gasReporter: {
        enabled: true,
        outputFile: 'gas-report.txt',
        noColors: true,
        currency: 'USD',
        coinmarketcap: COINTMARKETCAP_API_KEY,
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0,
        },
    },
}
