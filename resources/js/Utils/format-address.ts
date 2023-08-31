import { ethers } from "ethers";

const formatAddress = (address: string): string => ethers.utils.getAddress(address);

export { formatAddress };
