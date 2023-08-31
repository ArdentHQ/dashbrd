import { ethers } from "ethers";

const validateAddress = (address: string): boolean => ethers.utils.isAddress(address);

export { validateAddress };
