const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
}) => {
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()

  const chainId = await getChainId()
  let ethUsdPriceFeedAddress

  const isDevNetwork = developmentChains.includes(network.name)

  if (isDevNetwork) {
    const ethUsdAggregator = await get("MockV3Aggregator")
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
  }

  // the following will only deploy  "GenericMetaTxProcessor" if the contract was never deployed or if the code changed since last deployment
  const fundMe = await deploy("FundMe", {
    from: deployer,
    gasLimit: 4000000,
    log: true,
    args: [ethUsdPriceFeedAddress],
    waitConfirmations: network.config.blockConfirmations || 1,
  })

  log("--------------------------------------")

  if (!isDevNetwork && process.env.ETHERSCAN_API_KEY) {
    await verify(fundMe.address, [ethUsdPriceFeedAddress])
  }
}

module.exports.tags = ["all", "fundme"]
