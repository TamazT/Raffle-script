const { ethers } = require("hardhat")

const networkConfig = {
    4: {
        name: "rinkeby",
        vrfCoordinatorV2: "0x6168499c0cffcacd319c818142124b7a15e857ab",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasline: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        interval: 30,
        subcsriptionId: 7489,
    },
    31337: {
        name: "hardhat",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasline: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        interval: 30,
    },
}
const developmentChan = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChan,
}
