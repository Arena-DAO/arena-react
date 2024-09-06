const IPFS_GATEWAYS = ["https://ipfs.daodao.zone/ipfs/"];

export function withIpfsSupport(url?: string | null) {
	if (!url) {
		return url;
	}

	// Detect if URL is IPFS and convert to HTTP
	const ipfsRegex = /^ipfs:\/\/(.*)/;
	const match = url.match(ipfsRegex);
	if (match) {
		return `${IPFS_GATEWAYS[0]}${match[1]}`;
	}

	// Otherwise return the URL as it is
	return url;
}
