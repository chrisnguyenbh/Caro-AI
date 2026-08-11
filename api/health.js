export default function handler(req, res) {
  const hasApiKey = Boolean(process.env.PI_API_KEY);
  const hasWalletSeed = Boolean(process.env.PI_WALLET_PRIVATE_SEED);

  res.status(200).json({
    ok: true,
    mode: "Pi Testnet A2U",
    hasApiKey,
    hasWalletSeed,
    configured: hasApiKey && hasWalletSeed
  });
}
