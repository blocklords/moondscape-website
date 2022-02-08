"use strict";

// Chosen wallet provider given by the dialog window
let provider;

// Address of the selected account
let selectedAccount;

let currentAccount;

async function fetchAccountData() {
  console.log('fetchAccountData')
  // Get a Web3 instance for the wallet
  window.web3 = new Web3(provider);

  // Get connected chain id from Ethereum node
  const chainId = await web3.eth.getChainId();
  console.log('chainId: ',chainId)

  // Get list of accounts of the connected wallet
  const accounts = await web3.eth.getAccounts();
  // MetaMask does not give you all accounts, only the selected account
  window.selectedAccount = accounts[0];
  localStorage.setItem('connected', chainId);
  console.log('pathname:',window.location.pathname )
  if(window.location.pathname.includes('/walletConnect.html')){
    window.location = 'connected.html';
  }

  // Showing pool also loads the tokens
  updateBalance();
}

function updateBalance() {
  if (window.balanceTimeout == undefined) {
      clearInterval(window.balanceTimeout);
  }

  window.balanceTimeout = setInterval(async () => {
    // if (window.showNativeToken) {
    //   await window.showNativeToken();
    // }
    if (window.showMSCPToken) {
      await window.showMSCPToken();
    }
  }, 1000);
}

window.showNativeToken = async function() {
  const balance               = await web3.eth.getBalance(window.selectedAccount);
  const ethBalance            = web3.utils.fromWei(balance, "ether");
  const humanFriendlyBalance  = parseFloat(ethBalance).toFixed(6);

  console.log('dev: ',humanFriendlyBalance);
}

window.showMSCPToken = async function() {
  if (!window.MscpTokenContract) {
    try {
      window.MscpTokenContract = await getContractAsync('MscpToken');
    } catch (e) {
      return;
    }
  }

  const balance = await window.MscpTokenContract.methods.balanceOf(window.selectedAccount).call({from: window.selectedAccount});
  const ethBalance = web3.utils.fromWei(balance, "ether");
  const humanFriendlyBalance = parseFloat(ethBalance).toFixed(2).toLocaleString();

  console.log('mscp: ',humanFriendlyBalance);
  $('#balance').text(humanFriendlyBalance);
}


/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
async function refreshAccountData() {
  console.log('refreshAccountData')
  await fetchAccountData(provider);
  
}


//***METAMASK EIP1193
  function handleAccountsChanged(accounts) {
    console.log('handleAccountsChanged')
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      console.log('Please connect to MetaMask.');
    } else if (accounts[0] !== currentAccount) {
      currentAccount = accounts[0];
    }
  }

  function handleChainChanged(_chainId) {
    // We recommend reloading the page, unless you must do otherwise
    window.location.reload();
  }

  async function validateChainAsync(chainId) {
    const moonbeamId = 1284;
    const moonbeamHex = `0x${moonbeamId.toString(16)}`;
    const moonbaseId = 1287;
    const moonbaseHex = `0x${moonbaseId.toString(16)}`;

    const chainInfo = {
      1284: {
        chainId: '0x504',
        chainName: 'Moonbeam',
        nativeCurrency: {
          name: 'GLMR',
          symbol: 'GLMR',
          decimals: 18
        },
        rpcUrls: ['https://rpc.api.moonbeam.network'],
        blockExplorerUrls: ['https://moonbeam.moonscan.io/']
      },
      1287: {
        chainId: '0x507',
        chainName: 'Moonbase Alpha',
        nativeCurrency: {
          name: 'DEV',
          symbol: 'DEV',
          decimals: 18
        },
        rpcUrls: ['https://rpc.api.moonbase.moonbeam.network'],
        blockExplorerUrls: ['https://moonbase.moonscan.io/']
      }
    };

    if(chainId !== moonbeamHex && chainId !== moonbaseHex){
      try{
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: moonbeamHex }]
        });
      }catch (error) {
        if (error.code === 4902) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [chainInfo[Number(moonbeamHex)]]
            });
    
          } catch (addError) {
            console.log('Did not add network');
          }
        }
      }
    }

  }
/**
 * Connect wallet button pressed.
 */
async function onConnectMetamask() {
  console.log('onConnectMetamask')

  if (window.ethereum) {
    console.log('inside if')
    //Detect the MetaMask Ethereum provider
    provider = await detectEthereumProvider();
    //handleEthereum();
    if (provider !== window.ethereum) {
      console.error('Do you have multiple wallets installed?');
    }

    //Handle chain (network) and chainChanged (per EIP-1193)
    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log('chainId: ', chainId)
    await validateChainAsync(chainId);
    
    //Handle user accounts and accountsChanged (per EIP-1193)
    currentAccount = null;
    ethereum
      .request({ method: 'eth_accounts' })
      .then(handleAccountsChanged)
      .catch((err) => {
        // Some unexpected error.
        // For backwards compatibility reasons, if no accounts are available,
        // eth_accounts will return an empty array.
        console.error(err);
      });

    ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(handleAccountsChanged)
      .catch((err) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log('Please connect to MetaMask.');
        } else {
          console.error('Request was rejected');
        }
      });
  }

  // *** metamask

  ethereum.on('accountsChanged', handleAccountsChanged);
  //
  ethereum.on('chainChanged', handleChainChanged);


  await refreshAccountData();
}


/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect() {
  // TODO: Which providers have close method?
  if(provider.close) {
    await provider.close();
    provider = null;
  }

  selectedAccount = null;
  localStorage.removeItem('connected');
}


/**
 * Main entry point.
 */
$(document).ready(function(){
  const chainId = localStorage.getItem('connected');
  console.log('init: ',chainId);
  if(chainId){
    onConnectMetamask();
  }
  $('#metamask').on('click', function(e) {
    onConnectMetamask();
  });
  $('#wallet').on('click', function(e) {
    onDisconnect();
  });
});