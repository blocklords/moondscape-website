"use strict";

let provider;
let selectedAccount;
let currentAccount;

window.postAsync = async function(url, data) {
  return await fetch(url, {method: "POST", headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)});
}

async function preparePage(){
  if(window.chainId && window.config[chainId]){
    $('#mscp_amount').text(window.config[chainId].amount);

    await checkCityNft();

    await checkStakedMSCP();
  }
}

window.checkCityNft = async function(){
  const loadingCifyNftHtml = `
  <div class="city_nft_search_image"> </div>
  <div class="loading"> </div>
  <div class="city_nft_search_main_text">
    <span>SEARCHING FOR CITY NFT</span>
  </div>
  <div class="city_nft_search_footer_text">
    <span>Please remain seated. We are scanning your wallet for the Moonscape City NFT.</span>
  </div>
  `;
  $('#city_nft').html(loadingCifyNftHtml);
  if (!window.CityNftContract) {
    try {
      window.CityNftContract = await getContractAsync('CityNft');
    } catch (e) {
      return;
    }
  }

  const nftBalance = await window.CityNftContract.methods.balanceOf(window.selectedAccount).call({from: window.selectedAccount});
  window.nftBalance = nftBalance;
  console.log('nft balance: ', nftBalance)
  const notFoundCityNftHtml = `
  <div class="city_nft_search_image"> </div>
  <div class="not_found"> </div>
  <div class="city_nft_not_found_main_text">
    <span>NO CITY NFT FOUND IN WALLET</span>
  </div>
  <div class="city_nft_not_found_footer_text">
    <span>Unfortunately, we couldn't find any city NFT in your wallet.</span> <a class="city_nft_not_found_footer_link" onClick="checkCityNft()">Scan again?</a>
  </div>
  `;


  if(nftBalance < 1){
    $('#city_nft').html(notFoundCityNftHtml);
  }else{
    const cityNftId = await window.CityNftContract.methods.tokenOfOwnerByIndex(window.selectedAccount, 0).call({from: window.selectedAccount});
    window.cityNftId = cityNftId;
    console.log('cityNftId: ', cityNftId)
    if(cityNftId >0){
      const response = await postAsync(window.config[window.chainId].api, {ids: [cityNftId]});
      
      console.log('response: ', response)
      const json = await response.json();
      console.log('json: ', json)
      const nft = json[0];
      console.log('nft: ',nft)
      const foundCityNftHtml = `
      <img class="city_nft_found_image" src="${nft.imageUrl}" alt="cityNft"> </img>
      <span class = "city_nft_found_text">${nft.name}</span>
      <div class="city_nft_found_footer"> </div>
      `;
      $('#city_nft').html(foundCityNftHtml);
    }else{
      $('#city_nft').html(notFoundCityNftHtml);
    }
  }

  const playGameHtml = `
  <div class="play_game_btn${window.nftBalance < 1 || window.cityNftId < 1 || !window.userHasStakedMSCP ? '_disabled' : ''}">
    <a class="btn btn-link" href="#">Early Access</a>
  </div>
  `;
  $('#play_game').html(playGameHtml);
}

window.checkStakedMSCP = async function(){
  if (!window.MoonscapeBetaContract) {
    try {
      window.MoonscapeBetaContract = await getContractAsync('MoonscapeBeta');
    } catch (e) {
      return;
    }
  }

  const userHasStakedMSCP = await window.MoonscapeBetaContract.methods.stakers(window.selectedAccount).call({from: window.selectedAccount});
  window.userHasStakedMSCP = userHasStakedMSCP;
  console.log('userHasStakedMSCP: ', userHasStakedMSCP)
  const userHasStakedMSCPHtml = `
  <span class="stake_mscp_header">STAKE MSCP</span>
  <div class="stake_mscp_main">
    <img class="stake_mscp_mscp" src="assets/img/others/mscp_token.png" alt="">
    <span id="mscp_amount" class="stake_mscp_amount">${window.config[window.chainId].amount}</span>
  </div>
  <div class="staked_mscp">
    <img class="staked_mscp_mark" src="assets/img/play-game/mark.png" alt="">
    <span class="staked_mscp_text">Staked MSCP</span>
  </div>
  <span class="staked_mscp_footer_text">You can now join the Moonscape game. Enjoy!</span>
  `;

  const userDoesNotHaveStakedMSCP = `
  <span class="stake_mscp_header">STAKE MSCP</span>
  <div class="stake_mscp_main">
    <img class="stake_mscp_mscp" src="assets/img/others/mscp_token.png" alt="">
    <span  id="mscp_amount"class="stake_mscp_amount">${window.config[window.chainId].amount}</span>
  </div>
  <div class="stake_mscp_btn${nftBalance < 1 ? '_disabled': ''}">
    <a class="btn btn-link" onClick="stakeMSCP()">Stake MSCP</a>
  </div>
  <span class="stake_mscp_footer_text">After staking, your funds will be locked until Closed Beta ends.</span>
  `;
  if(userHasStakedMSCP){
    $('#stake_mscp').html(userHasStakedMSCPHtml);
  }else{
    $('#stake_mscp').html(userDoesNotHaveStakedMSCP);
  }

  const playGameHtml = `
  <div class="play_game_btn${window.nftBalance < 1 || window.cityNftId < 1 || !window.userHasStakedMSCP ? '_disabled' : ''}">
    <a class="btn btn-link" href="#">Early Access</a>
  </div>
  `;
  $('#play_game').html(playGameHtml);
}

window.stakeMSCP = async function(){
  if(window.nftBalance < 1) return;
  if(window.cityNftId < 1) return;
  if(window.userHasStakedMSCP) return;

  if (!window.MscpTokenContract) {
    try {
      window.MscpTokenContract = await getContractAsync('MscpToken');
    } catch (e) {
      return;
    }
  }
  const address = window.config[window.chainId].MoonscapeBetaContract;
  const amountInGwei = web3.utils.toWei(window.config[window.chainId].amount.toString(),"ether");
  await window.MscpTokenContract.methods
    .approve(address, amountInGwei)
    .send({from: window.selectedAccount})
    .on('transactionHash', (txIdResponse) => {
      console.log('APPROVE_TRANSACTION_HASH', txIdResponse);
    })
    .on('receipt', (receipt) => {
      console.log('APPROVE_RECEIPT', receipt);
    })
    .on('error', (error) => {
      console.log('APPROVE_ERROR', error);
      return;
    });
  
  if (!window.MoonscapeBetaContract) {
    try {
      window.MoonscapeBetaContract = await getContractAsync('MoonscapeBeta');
    } catch (e) {
      return;
    }
  }
  
  await window.MoonscapeBetaContract.methods
    .lock()
    .send({from: window.selectedAccount})
    .on('transactionHash', (txIdResponse) => {
      console.log('LOCK_TRANSACTION_HASH', txIdResponse);
    })
    .on('receipt', (receipt) => {
      console.log('LOCK_RECEIPT', receipt);
    })
    .on('error', (error) => {
      console.log('LOCK_ERROR', error);
      return;
    });
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

async function refreshAccountData() {
  console.log('refreshAccountData')
  await fetchAccountData(provider);
}

function handleAccountsChanged(accounts) {
  console.log('handleAccountsChanged')
  if (accounts.length === 0) {
    console.log('Please connect to MetaMask.');
  } else if (accounts[0] !== currentAccount) {
    currentAccount = accounts[0];
  }
}

function handleChainChanged(_chainId) {
  window.location.reload();
}

async function fetchAccountData() {
  console.log('fetchAccountData')
  window.web3 = new Web3(provider);

  const chainId = await web3.eth.getChainId();
  console.log('chainId: ',chainId)

  const accounts = await web3.eth.getAccounts();
  window.selectedAccount = accounts[0];
  window.chainId = chainId;
  localStorage.setItem('connected', chainId);

  console.log('pathname:',window.location.pathname )
  if(window.location.pathname.includes('/connect.html')){
    window.location = 'beta.html';
  }

  await preparePage();
  // Showing pool also loads the tokens
  await updateBalance();
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
        params: [{ chainId: moonbaseHex }]
      });
    }catch (error) {
      if (error.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [chainInfo[Number(moonbaseHex)]]
          });
  
        } catch (addError) {
          console.log('Did not add network');
        }
      }
    }
  }
}

async function onConnectMetamask() {
  console.log('onConnectMetamask')
  if (window.ethereum) {
    provider = await detectEthereumProvider();

    if (provider !== window.ethereum) {
      console.error('Do you have multiple wallets installed?');
    }

    let chainId = await ethereum.request({ method: 'eth_chainId' });

    await validateChainAsync(chainId);
    
    currentAccount = null;
    ethereum
      .request({ method: 'eth_accounts' })
      .then(handleAccountsChanged)
      .catch((err) => {
        console.error(err);
      });

    ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(handleAccountsChanged)
      .catch((err) => {
        if (err.code === 4001) {
          console.log('Please connect to MetaMask.');
        } else {
          console.error('Request was rejected');
        }
      });
  }

  // *** metamask
  provider.on("accountsChanged", (accounts) => {
    fetchAccountData();
  });
  provider.on("chainChanged", (chainId) => {
    fetchAccountData();
  });
  // Subscribe to session disconnection
  provider.on("disconnect", (code, reason) => {
    console.log(code, reason);
  });

  ethereum.on('accountsChanged', handleAccountsChanged);
  ethereum.on('chainChanged', handleChainChanged);

  await refreshAccountData();
}

async function onConnectWalletConnect(){
  console.log('onConnectWalletConnect')
  provider = new window.WalletConnectProvider.default({
    rpc: {
      1284: 'https://rpc.api.moonbeam.network',
      1287: 'https://rpc.testnet.moonbeam.network'
    },
    qrcode: true,
    pollingInterval: 1200,
    bridge: 'https://bridge.walletconnect.org'
  });
  
  //  Enable session (triggers QR Code modal)
  await provider.enable();
  
  //  Create Web3
  window.web3 = new Web3(provider);
}

async function onDisconnect() {
  console.log('onDisconnect')
  if(provider.close) {
    await provider.close();
    provider = null;
  }

  selectedAccount = null;
  chainId = null;
  nftBalance = null;
  userHasStakedMSCP = null;
  localStorage.removeItem('connected');
  window.location = 'connect.html';
}

/**
 * Main entry point.
 */
$(document).ready(function(){
  const chainId = localStorage.getItem('connected');
  console.log('chainId: ',chainId);
  if(!!chainId){
    onConnectMetamask();
  }
  $('#metamask').on('click', function(e) {
    onConnectMetamask();
  });
  $('#walletConnect').on('click', function(e) {
    onConnectWalletConnect();
  });
  $('#wallet').on('click', function(e) {
    onDisconnect();
  });
});