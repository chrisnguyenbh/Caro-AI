export default function handler(req,res){
  res.status(200).json({ok:true,network:"Pi Mainnet",paymentFlow:"U2A",sandbox:false,configured:Boolean(process.env.PI_API_KEY),a2uConfigured:Boolean(process.env.PI_API_KEY&&process.env.PI_WALLET_PRIVATE_SEED)});
}
