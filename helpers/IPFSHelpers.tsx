export function convertIPFSToHttp(url: string | null | undefined) {
  if (!url) return undefined;

  // Detect if URL is IPFS and convert to HTTP
  const ipfsRegex = /^ipfs:\/\/(.*)/;
  const match = url.match(ipfsRegex);
  if (match) {
    return `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${match[1]}`;
  }

  // Otherwise return the URL as it is
  return url;
}
