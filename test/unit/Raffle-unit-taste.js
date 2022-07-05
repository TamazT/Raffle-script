const { equal } = require("assert")
const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { convertCompilerOptionsFromJson } = require("typescript")
const { developmentChan, networkConfig } = require("../../helper-hardhat-config")

!developmentChan.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", function () {
          let raffle, raffleContract, vrfCoordinatorV2Mock, raffleEntranceFee, interval, player // , deployer

          beforeEach(async () => {
              accounts = await ethers.getSigners() // could also do with getNamedAccounts
              //   deployer = accounts[0]
              player = accounts[1]
              await deployments.fixture(["mocks", "raffle"])
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
              raffleContract = await ethers.getContract("Raffle")
              raffle = raffleContract.connect(player)
              raffleEntranceFee = await raffle.getEntranceFee()

              interval = await raffle.getInterval()
          })
          describe("Raffle Unit Tests", function () {
              it("intitiallizes the raffle correctly", async () => {
                  let chain = network.config.chainId
                  assert.equal(interval.toString(), networkConfig[chain]["interval"])
              })
          })
          describe("Raffle Unit Tests", function () {
              it("intitiallizes the raffle correctly", async () => {
                  let chain = network.config.chainId
                  assert.equal(raffleEntranceFee.toString(), networkConfig[chain]["entranceFee"])
              })
          })
          describe("Raffle Unit Tests", function () {
              it("enterRaffle correctly", async () => {
                  await expect(raffle.enterRaffle()).to.be.revertedWith("Raffle_notEnoug")
              })
          })
          describe("Raffle Unit Tests", function () {
              it("Count players", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  const nd = await raffle.getPlayers(0)
                  assert.equal(nd, player.address)
              })
          })
          describe("checkUpkeep", function () {
              it("returns false if people haven't sent any ETH", async () => {
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.request({ method: "evm_mine", params: [] })
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x")
                  assert(!upkeepNeeded)
              })
          })
          describe("perforumkeep", function () {
              it("updates the raffle state and emits a requestId", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const txResponce = await raffle.performUpkeep([])
                  const txReceipt = await txResponce.wait(1)
                  requestId = txReceipt.events[1].args.requestId
                  const raffleState = await raffle.getRaffleState()
                  console.log(requestId)
                  assert.equal(requestId.toNumber(), true)
                  assert.equal(raffleState, 2)
              })
          })
      })
