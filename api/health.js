export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    mode: "Pi Testnet A2U",
    configured: Boolean(process.env.PI_API_KEY && process.env.PI_WALLET_PRIVATE_SEED),
    codeRequired: Boolean(process.env.A2U_TEST_CODE),
  });
}
