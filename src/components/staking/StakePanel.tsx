'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Coins, ArrowDownUp, Gift, Loader2, AlertCircle } from 'lucide-react';
import { StakingPool } from '@/types';
import { useWalletStore } from '@/store';
import { STAKING_ABI, ERC20_APPROVE_ABI } from '@/lib/constants/staking';
import toast from 'react-hot-toast';

interface Props {
  pool: StakingPool;
}

export default function StakePanel({ pool }: Props) {
  const { connected, provider } = useWalletStore();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [stakedBalance, setStakedBalance] = useState('0');
  const [claimable, setClaimable] = useState('0');
  const [loading, setLoading] = useState<string | null>(null);

  const getSigner = useCallback(async () => {
    if (!provider || !window.ethereum) throw new Error('Wallet not connected');
    const ethersProvider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
    return ethersProvider.getSigner();
  }, [provider]);

  const loadBalances = useCallback(async () => {
    if (!connected || !pool.contractAddress || !window.ethereum) return;
    try {
      const ethersProvider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(pool.contractAddress, STAKING_ABI, ethersProvider);
      const [staked, earned] = await Promise.all([
        contract.stakedBalance(address) as Promise<bigint>,
        contract.earned(address) as Promise<bigint>,
      ]);
      setStakedBalance(ethers.formatEther(staked));
      setClaimable(ethers.formatEther(earned));
    } catch {
      // Contract may not be deployed yet — use demo values
    }
  }, [connected, pool.contractAddress]);

  useEffect(() => {
    loadBalances();
  }, [loadBalances]);

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error('Enter a valid stake amount');
      return;
    }
    if (!pool.contractAddress) {
      toast.error('No contract address for this pool');
      return;
    }
    setLoading('stake');
    try {
      const signer = await getSigner();
      const amount = ethers.parseEther(stakeAmount);

      // Step 1: Approve
      const tokenContract = new ethers.Contract(pool.stakingToken, ERC20_APPROVE_ABI, signer);
      const approveTx = await tokenContract.approve(pool.contractAddress, amount);
      await approveTx.wait();
      toast.success('Approved!');

      // Step 2: Stake
      const stakingContract = new ethers.Contract(pool.contractAddress, STAKING_ABI, signer);
      const stakeTx = await stakingContract.stake(amount);
      await stakeTx.wait();
      toast.success(`Staked ${stakeAmount} ${pool.stakingTokenSymbol}`);
      setStakeAmount('');
      await loadBalances();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Stake failed');
    } finally {
      setLoading(null);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      toast.error('Enter a valid unstake amount');
      return;
    }
    if (!pool.contractAddress) {
      toast.error('No contract address for this pool');
      return;
    }
    setLoading('unstake');
    try {
      const signer = await getSigner();
      const amount = ethers.parseEther(unstakeAmount);
      const stakingContract = new ethers.Contract(pool.contractAddress, STAKING_ABI, signer);
      const tx = await stakingContract.unstake(amount);
      await tx.wait();
      toast.success(`Unstaked ${unstakeAmount} ${pool.stakingTokenSymbol}`);
      setUnstakeAmount('');
      await loadBalances();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unstake failed');
    } finally {
      setLoading(null);
    }
  };

  const handleClaim = async () => {
    if (!pool.contractAddress) {
      toast.error('No contract address for this pool');
      return;
    }
    setLoading('claim');
    try {
      const signer = await getSigner();
      const stakingContract = new ethers.Contract(pool.contractAddress, STAKING_ABI, signer);
      const tx = await stakingContract.claimRewards();
      await tx.wait();
      toast.success(`Claimed ${claimable} ${pool.rewardTokenSymbol}`);
      await loadBalances();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Claim failed');
    } finally {
      setLoading(null);
    }
  };

  if (!connected) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-xs text-amber-200">
        <AlertCircle size={14} />
        Connect your wallet to stake
      </div>
    );
  }

  return (
    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 border-t border-white/5 pt-3">
      {/* Stake */}
      <div className="space-y-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Coins size={10} /> Stake
        </div>
        <input
          type="number"
          placeholder={`Amount in ${pool.stakingTokenSymbol}`}
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          className="crypto-input text-xs h-8 w-full"
          min="0"
        />
        <div className="text-[10px] text-muted-foreground">
          Staked: {parseFloat(stakedBalance).toFixed(4)} {pool.stakingTokenSymbol}
        </div>
        <button
          onClick={handleStake}
          disabled={loading === 'stake'}
          className="btn-primary w-full h-8 text-xs"
        >
          {loading === 'stake' ? <Loader2 size={12} className="animate-spin" /> : <Coins size={12} />}
          Stake
        </button>
      </div>

      {/* Unstake */}
      <div className="space-y-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <ArrowDownUp size={10} /> Unstake
        </div>
        <input
          type="number"
          placeholder={`Amount in ${pool.stakingTokenSymbol}`}
          value={unstakeAmount}
          onChange={(e) => setUnstakeAmount(e.target.value)}
          className="crypto-input text-xs h-8 w-full"
          min="0"
        />
        <div className="text-[10px] text-muted-foreground">
          Available: {parseFloat(stakedBalance).toFixed(4)}
        </div>
        <button
          onClick={handleUnstake}
          disabled={loading === 'unstake'}
          className="btn-secondary w-full h-8 text-xs"
        >
          {loading === 'unstake' ? <Loader2 size={12} className="animate-spin" /> : <ArrowDownUp size={12} />}
          Unstake
        </button>
      </div>

      {/* Claim */}
      <div className="space-y-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Gift size={10} /> Rewards
        </div>
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 h-8 flex items-center justify-between">
          <span className="text-xs text-emerald-300 font-semibold">
            {parseFloat(claimable).toFixed(6)} {pool.rewardTokenSymbol}
          </span>
        </div>
        <div className="text-[10px] text-muted-foreground">
          APY: <span className="text-emerald-400 font-semibold">{pool.apy}%</span>
        </div>
        <button
          onClick={handleClaim}
          disabled={loading === 'claim' || parseFloat(claimable) === 0}
          className="btn-primary w-full h-8 text-xs"
          style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
        >
          {loading === 'claim' ? <Loader2 size={12} className="animate-spin" /> : <Gift size={12} />}
          Claim Rewards
        </button>
      </div>
    </div>
  );
}
