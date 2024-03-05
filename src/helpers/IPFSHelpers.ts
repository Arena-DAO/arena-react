export function withIpfsSupport(gateway: string, url?: string | null) {
	if (!url) {
		return url;
	}

	// Detect if URL is IPFS and convert to HTTP
	const ipfsRegex = /^ipfs:\/\/(.*)/;
	const match = url.match(ipfsRegex);
	if (match) {
		return `${gateway}${match[1]}`;
	}

	// Otherwise return the URL as it is
	return url;
}
