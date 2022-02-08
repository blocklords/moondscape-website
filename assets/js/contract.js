/**
 * Returns a contract instance to use. If the configuration doesn't support the connected wallet, then throws an error.
 * @param {string} name of contract to load from blockchainConfig.
 * @throws Exception in case of unconnected wallet, invalid network, damage of configuration
 */
 window.getContractAsync = async function(name) {
   console.log('getContract')
  if (!web3) {
      throw "Failed to load Web3 library. Please check your internet connection!";
  }
  if (web3.eth === undefined) {
      throw "Provider not instantiniated. Please connect the wallet";
  }

  const chainId = await web3.eth.getChainId();
  console.log('chainId from getcontract:' , chainId)
  if (window.config[chainId] === undefined) {
      throw `${chainId} not supported. Please switch your blockchain network!`;
  }

  if (window.config[chainId][name] === undefined) {
      throw `Invalid contract name: ${name}!`;
  }

  const address = window.config[chainId][name];
  const abi = window[name];

  if (abi == undefined) {
      throw "Failed to load Abi. Please Check your internet connection!";
  }
  return new web3.eth.Contract(abi, address);
}