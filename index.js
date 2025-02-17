import ccxt, { binance } from "ccxt"
import delay from "delay"
import 'dotenv/config'
import moment from "moment"


const subMain = async () => {
    // listen realtime crypto
    const exchangeId = 'binance'; // Sàn giao dịch
    const symbols = ['BTC/USDT', 'ETH/USDT', 'XRP/USDT']; // Các cặp giao dịch cần lắng nghe

    try {
        const exchange = new ccxt[exchangeId]();

        console.log(`Đang kết nối WebSocket để lắng nghe giá real-time...`);

        while (true) {
            // Lắng nghe giá cho tất cả các cặp
            const prices = await Promise.all(symbols.map((symbol) => exchange.watchTicker(symbol)));

            // Hiển thị giá của từng cặp
            prices.forEach((ticker, index) => {
                const { last, bid, ask } = ticker;
                console.log(`[${symbols[index]}] Giá: ${last} | Bid: ${bid} | Ask: ${ask}`);
            });
        }
    } catch (error) {
        console.error('Có lỗi xảy ra:', error.message);
    }
};

const bnb = new ccxt.binance({
    apiKey: process.env.API_KEY,
    secret: process.env.SECRET
})
bnb.setSandboxMode(true)

const balance = async() => {
    const balance = await bnb.fetchBalance()
    const total = balance.total
    console.log(`Tai san: BTC ${total.BTC} , USDT: ${total.USDT}`);
    
}

const tradeBot = async() => {
    const price = await bnb.fetchOHLCV('BTC/USDT', '15m', undefined, 5)
    const sub = await bnb.listener
    const formatPrice = price.map(price => {
        return{
            timestamp: moment(price[0]).format(),
            open: price[1],
            hight: price[2],
            low: price[3],
            close: price[4],
            volume: price[5]
        }
    })

    const averagePrice = formatPrice.reduce((acc, price) => acc + price.close, 0)/5
    const lastPrice = formatPrice[formatPrice.length - 1].close

    console.log(formatPrice.map(p => p.close), averagePrice, lastPrice);
    const condition = lastPrice > averagePrice ? "sell" : "buy"
    const TRADE_VOLLUMN = 100
    const quantity = TRADE_VOLLUMN / lastPrice

    console.log(`average price: ${averagePrice} , Last price: ${lastPrice}`);
    await bnb.createMarketOrder("BTC/USDT", condition, quantity)
    
    console.log(`Oder by ${moment().format()}: ${condition} ${quantity} BTC at ${lastPrice}`);
    balance()
    console.log('check git branch');
    console.log('check git branch 2');
    console.log('check git branch commit 4');
    console.log('check git branch commit 5');
    
}
const main = async() => {
    while (true) {
        await tradeBot()
        await delay(60000)
    }
}
main()
// subMain()
