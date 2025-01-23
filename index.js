import ccxt, { binance } from "ccxt"
import delay from "delay"
import moment from "moment"

const bnb = new ccxt.binance({
    apiKey: 'S6jde05yZO2zu8NP5OeAzu6cpk8qRkwytufDD13wFE6TxSvO2GtOXi5zxGbs1xd0',
    secret: 'jQYTqlWExHyd5KiJNggh7ol8x5mw8ZAV2x6t90p9C9dgc2QJLZDILOTbfMz9phAa'
})
bnb.setSandboxMode(true)

const balance = async() => {
    const balance = await bnb.fetchBalance()
    const total = balance.total
    console.log(`Tai san: BTC ${total.BTC} , USDT: ${total.USDT}`);
    
}

const tradeBot = async() => {
    const price = await bnb.fetchOHLCV('BTC/USDT', '15m', undefined, 5)
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
    const order  = await bnb.createMarketOrder("BTC/USDT", condition, quantity)
    
    console.log(`Oder by ${moment().format()}: ${condition} ${quantity} BTC at ${lastPrice}`);
    balance()
    
}
const main = async() => {
    while (true) {
        await tradeBot()
        await delay(60000)
    }
}
main()
// balance()
