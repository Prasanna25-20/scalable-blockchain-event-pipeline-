require("dotenv").config();
const { ethers } = require("ethers");
const axios = require("axios");

// ✅ WebSocket provider
const provider = new ethers.WebSocketProvider(process.env.RPC_WS);

// ✅ Contract details
const contractAddress = process.env.CONTRACT;

const abi = [
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

const contract = new ethers.Contract(contractAddress, abi, provider);

console.log("🚀 Listening for Transfer events...");

// 🔥 Event Listener
contract.on("Transfer", async (from, to, value, event) => {
  try {
    const txHash =
      event?.transactionHash ||
      event?.log?.transactionHash ||
      "unknown";

    const data = {
      type: "blockchain",
      from,
      to,
      value: value.toString(),
      txHash,
      timestamp: Date.now()
    };

    console.log("📡 Blockchain Event:", data);

    // 🔥 Send to backend
    await axios.post("http://127.0.0.1:5000/blockchain-event", data);

  } catch (err) {
    console.error("❌ Listener error:", err.message);
  }
});

// 🔥 Handle WebSocket errors (important)
provider.websocket?.on("error", (err) => {
  console.error("⚠️ WebSocket error:", err.message);
});

provider.websocket?.on("close", () => {
  console.error("⚠️ WebSocket closed. Reconnecting needed...");
});