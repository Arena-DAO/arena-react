export function convertIPFSToHttp(gateway: string, url: string) {
	// Detect if URL is IPFS and convert to HTTP
	const ipfsRegex = /^ipfs:\/\/(.*)/;
	const match = url.match(ipfsRegex);
	if (match) {
		return `${gateway}${match[1]}`;
	}

	// Otherwise return the URL as it is
	return url;
}
