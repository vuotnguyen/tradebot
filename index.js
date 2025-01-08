import ccxt from "ccxt"
import moment from "moment"

const bnb = new ccxt.binance({
    apiKey: 'S6jde05yZO2zu8NP5OeAzu6cpk8qRkwytufDD13wFE6TxSvO2GtOXi5zxGbs1xd0',
    secret: 'jQYTqlWExHyd5KiJNggh7ol8x5mw8ZAV2x6t90p9C9dgc2QJLZDILOTbfMz9phAa'
})
bnb.setSandboxMode(true)

const balance = async() => {
    const balance = await bnb.fetchBalance()
    console.log('giao dich ', balance);
    
}

const main = async() => {
    const price = await bnb.fetchOHLCV('AIUSDT', '15m', undefined, 192)
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
    const higherArea = formatPrice.reduce((rs, current) => {
        return rs.hight < current.hight ? current : rs
    })
    console.log('bnb info ai feature ', higherArea);
    
}
main()
// balance()
