const { assert, expect } = require('chai')
const { deployments, ethers, getNamedAccounts } = require('hardhat')

describe('FundMe', async function () {
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther('1')
    beforeEach(async function () {
        // deploy our contract
        // using hardhar-deploy

        await deployments.fixture('all')
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract('FundMe', deployer)
        mockV3Aggregator = await ethers.getContract(
            'MockV3Aggregator',
            deployer
        )
    })

    describe('constructor', async function () {
        it('sets the aggregator addresses correctly', async function () {
            const response = await fundMe.getPriceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe('fund', async function () {
        it("Fails if you don't send enough ETH!", async function () {
            await expect(fundMe.fund()).to.be.revertedWith(
                'You need to spend more ETH!'
            )
        })

        it('update fund amount data structure', async function () {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getAddressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })

        it('add funder to array of getFunders', async function () {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getFunders(0)
            assert.equal(response, deployer)
        })
    })

    describe('withdraw', async function () {
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue })
        })

        it('withdraw ETH from a single funder', async function () {
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            console.log(
                startingDeployerBalance.toString(),
                startingFundMeBalance.toString()
            )

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
        })

        it('allows us to withdraw with multiple getFunders', async function () {
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }

            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )

            // make sure getFunders are reset properly
            await expect(fundMe.getFunders(0)).to.be.reverted

            for (let i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })

        it('Only allows owner to withdraw', async function () {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(
                attackerConnectedContract.withdraw()
            ).to.be.revertedWith('NotOwner()')
        })
    })
})
