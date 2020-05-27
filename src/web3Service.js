import {
  ERC20_ABI,
  ATOKEN_ABI,
  LENDING_POOL_ABI,
  LENDING_POOL_ADDRESSES_PROVIDER_ABI,
  KOVAN_ADDRESSES,
} from "./constants";
import Web3 from "web3";

window.ethereum.enable().catch((error) => {
  console.log(error);
});

const web3 = new Web3(window.ethereum);

const LENDING_POOL_ADDRESSES_PROVIDER_CONTRACT = new web3.eth.Contract(
  LENDING_POOL_ADDRESSES_PROVIDER_ABI,
  KOVAN_ADDRESSES.LendingPoolAddressesProvider
);

export async function getDefaultAccount() {
  try {
    const accounts = await getAccounts();
    if (accounts && accounts.length >= 1) {
      return accounts[0];
    }
  } catch (e) {
    // ignore
  }
  return null;
}
// get accounts
export function getAccounts() {
  return window.ethereum.enable().then(() => {
    return new Promise((resolve, reject) => {
      web3.eth.getAccounts((err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
    });
  });
}

export const getLendingPoolCoreAddress = async () => {
  // Get the latest LendingPoolCore address
  const lpCoreAddress = await LENDING_POOL_ADDRESSES_PROVIDER_CONTRACT.methods
    .getLendingPoolCore()
    .call()
    .catch((e) => {
      throw Error(`Error getting lendingPool address: ${e.message}`);
    });
  return lpCoreAddress;
};

export const getLendingPoolAddress = async () => {
  // Get the latest LendingPool contract address
  const lpAddress = await LENDING_POOL_ADDRESSES_PROVIDER_CONTRACT.methods
    .getLendingPool()
    .call()
    .catch((e) => {
      throw Error(`Error getting lendingPool address: ${e.message}`);
    });
  return lpAddress;
};

export const approve = async (pAssetAddress, daiAmountinWei) => {
  // Approve the LendingPoolCore address with the Token contract
  const tokenContract = new web3.eth.Contract(ERC20_ABI, pAssetAddress);
  const lpCoreAddress = await getLendingPoolCoreAddress();
  const userAddress = await getDefaultAccount();
  await tokenContract.methods
    .approve(lpCoreAddress, daiAmountinWei)
    .send({ from: userAddress })
    .catch((e) => {
      throw Error(`Error approving DAI allowance: ${e.message}`);
    });
};

export const deposit = async (pAmount, pToken) => {
  const tokenAmountinWei = web3.utils.toWei(pAmount, "ether").toString();
  const tokenAddress = pToken;
  const referralCode = "0";
  const lpAddress = await getLendingPoolAddress();
  const userAddress = await getDefaultAccount();

  console.log(tokenAmountinWei, tokenAddress, lpAddress, userAddress);
  const lpContract = new web3.eth.Contract(LENDING_POOL_ABI, lpAddress);

  if (tokenAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
    await lpContract.methods
      .deposit(tokenAddress, tokenAmountinWei, referralCode)
      .send({ from: userAddress, value: tokenAmountinWei })
      .catch((e) => {
        throw Error(
          `Error depositing to the LendingPool contract: ${e.message}`
        );
      });
  } else {
    await approve(tokenAddress, tokenAmountinWei);
    await lpContract.methods
      .deposit(tokenAddress, tokenAmountinWei, referralCode)
      .send({ from: userAddress })
      .catch((e) => {
        throw Error(
          `Error depositing to the LendingPool contract: ${e.message}`
        );
      });
  }
};

export const redeem = async (pAmount, pAToken) => {
  // const lpCoreAddress = await getLendingPoolCoreAddress();
  const aTokenAddress = pAToken;
  const aTokenContract = new web3.eth.Contract(ATOKEN_ABI, aTokenAddress);
  const amountInWei = web3.utils.toWei(pAmount, "ether");
  const userAddress = await getDefaultAccount();
  await aTokenContract.methods
    .redeem(amountInWei)
    .send({from: userAddress})
    .catch((e) => {
      throw Error(`Error redeeming aDai: ${e.message}`);
    });
};
