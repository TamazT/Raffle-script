const { network, ethers } = require("hardhat")
const { deveplopmentChains, networkConfig } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    let chainid = network.config.chainId

    let vrfCoordinatorV2, subscriptionID

    let Sub_Fund = ethers.utils.parseEther("5")

    if ((chainid = "31337")) {
        const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        const transactionResponse = await VRFCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait(1)
        subscriptionID = transactionReceipt.events[0].args.subId
        await VRFCoordinatorV2Mock.fundSubscription(subscriptionID, Sub_Fund)

        vrfCoordinatorV2 = VRFCoordinatorV2Mock.address
    } else {
        subscriptionID = networkConfig[chainid]["subscriptionID"]
        vrfCoordinatorV2 = networkConfig[chainid]["vrfCoordinatorV2"]
    }
    let entranceFee = networkConfig[chainid]["entranceFee"]
    let gasline = networkConfig[chainid]["gasline"]
    let interval = 30
    const args = [vrfCoordinatorV2, entranceFee, subscriptionID, 30]
    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations,
    })
}
module.exports.tags = ["all", "mocks"]
