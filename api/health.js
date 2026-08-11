export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    mode: "Pi Testnet A2U",
    vercelEnv: process.env.VERCEL_ENV || null,
    hasApiKey: Boolean(process.env.PI_API_KEY),
    hasWalletSeed: Boolean(process.env.PI_WALLET_PRIVATE_SEED),
    hasTestCode: Boolean(process.env.A2U_TEST_CODE),
    hasTestAmount: Boolean(process.env.A2U_TEST_AMOUNT)
  });
}
