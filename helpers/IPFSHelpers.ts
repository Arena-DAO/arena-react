import env from "@config/env";

export function convertIPFSToHttp(url: string | null | undefined) {
  if (!url) return undefined;

  // Detect if URL is IPFS and convert to HTTP
  const ipfsRegex = /^ipfs:\/\/(.*)/;
  const match = url.match(ipfsRegex);
  if (match) {
    return `${env.IPFS_GATEWAY}${match[1]}`;
  }

  // Otherwise return the URL as it is
  return url;
}
