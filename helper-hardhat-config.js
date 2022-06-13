const networkConfig = {
    4: {
        name: 'rinkbey',
        ethUsdPriceFeed: '0x78F9e60608bF48a1155b4B2A5e31F32318a1d85F',
    },
    137: {
        name: 'polygon',
        ethUsdPriceFeed: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
    },
}

const developmentChains = ['hardhat', 'loclhost']
const DECIMALS = 8
const INITIAL_ANSWER = 20000000000

module.exports = {
    developmentChains,
    networkConfig,
    DECIMALS,
    INITIAL_ANSWER,
}
