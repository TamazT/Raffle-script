const { format } = require("path")
const { deveplopmentChains } = require("../helper-hardhat-config.js")
const BASE_FEE = ethers.utils.parseEther("0.25")
const GAS_PRICE_LINK = 1e9
const args = [BASE_FEE, GAS_PRICE_LINK]

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    let chainid = network.config.chainid

    if ((chainid = "31337")) {
        console.log("Local network detected! Deploying Mock")
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args: args,
            log: true,
            waitConfirmations: network.config.blockConfirmations,
        })
        log("Mocks DEployed")
        log("_____________________________________")
    }
}

module.exports.tags = ["all", "mocks"]
