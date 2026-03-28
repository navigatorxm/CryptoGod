import { StakingPool } from '@/types';

export const STAKING_ABI = [
  'function stake(uint256 amount) external',
  'function unstake(uint256 amount) external',
  'function claimRewards() external',
  'function earned(address account) external view returns (uint256)',
  'function stakedBalance(address account) external view returns (uint256)',
  'function rewardRate() external view returns (uint256)',
  'function totalStaked() external view returns (uint256)',
  'function rewardsDuration() external view returns (uint256)',
  'function lastUpdateTime() external view returns (uint256)',
  'function periodFinish() external view returns (uint256)',
] as const;

export const ERC20_APPROVE_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
] as const;

export const MOCK_STAKING_POOLS: StakingPool[] = [
  {
    id: 'demo-1',
    name: 'ETH Flexible Staking',
    stakingToken: '0x0000000000000000000000000000000000000000',
    stakingTokenSymbol: 'ETH',
    rewardToken: '0x0000000000000000000000000000000000000000',
    rewardTokenSymbol: 'ETH',
    network: 'ethereum',
    apy: 4.8,
    tvl: 12500000,
    lockPeriod: 0,
    isActive: true,
  },
  {
    id: 'demo-2',
    name: 'BNB 30-Day Lock',
    stakingToken: '0x0000000000000000000000000000000000000000',
    stakingTokenSymbol: 'BNB',
    rewardToken: '0x0000000000000000000000000000000000000000',
    rewardTokenSymbol: 'BNB',
    network: 'bsc',
    apy: 18.5,
    tvl: 3200000,
    lockPeriod: 30,
    isActive: true,
  },
  {
    id: 'demo-3',
    name: 'MATIC LP Rewards',
    stakingToken: '0x0000000000000000000000000000000000000000',
    stakingTokenSymbol: 'MATIC',
    rewardToken: '0x0000000000000000000000000000000000000000',
    rewardTokenSymbol: 'MATIC',
    network: 'polygon',
    apy: 32.1,
    tvl: 890000,
    lockPeriod: 7,
    isActive: true,
  },
];
