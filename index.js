import ccxt, { binance } from "ccxt"
import delay from "delay"
import 'dotenv/config'
import moment from "moment"
import { dummyData } from "./src/data";
import { cuaHang } from "./src/cuaHang";

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
    
    // console.log(`Oder by ${moment().format()}: ${condition} ${quantity} BTC at ${lastPrice}`);
    // balance()
    // console.log('check git branch');
    // console.log('check git branch 2');
    // console.log('check git branch commit 4');
    // console.log('check git branch commit 6');
    // console.log('check git branch commit 7');
    // console.log('check git branch commit 8');
    // console.log('check git branch commit 9');
    // console.log('check git branch commit 10');
    // console.log('check git branch commit 12');
    // var condition = 0 ;
}
const main = async() => {
    // while (true) {
    //     await tradeBot()
    //     await delay(60000)
    // }
    getData()
}



    const handleData = () => {
        const groupedData = dummyData.reduce((acc, item) => {
            const {chiNhanh, maNhapHang,thoiGian,maNhaCungCap, tongTienHang,ghiChu, tongSoLuong, maHang, imei, donGia, soLuong } = item;
        
            if (!acc[maNhapHang]) {
                acc[maNhapHang] = {chiNhanh, maNhapHang,thoiGian,maNhaCungCap, tongTienHang, ghiChu, danhSachHang: [] };
            }
        
            acc[maNhapHang].danhSachHang.push({ tongSoLuong,maHang, imei, donGia, soLuong,  });
            
            return acc;
        }, {});
        
        const result = Object.values(groupedData);

        return result;
    }
    const getData = async() => {
        const data = handleData()
        for (const item of data) {
            const cuaHang = fetchCuaHang(item.chiNhanh)
            const nhaCungCap = fetchPhieuNhap(item.maNhaCungCap)
            
            const gioHang = []
            let totalAmount = 0
            for (const element of item.danhSachHang) {
                totalAmount += element.donGia * element.soLuong
                const maHang = element.maHang.replace(/\\\\/g, "\\")
                  const data = fetchDanhSachHang(maHang)
                  gioHang.push(data.filter((item) => item.SKUCode.toLowerCase() == element.maHang.toLowerCase()))
            }

            

            const body = {
                "RefID": "QLCH.model.business.INInward-2",
                "RefType": 2095,
                "RefTypeName": "",
                "RefNo": item.maNhapHang,
                "RefDate": moment(item.thoiGian, "DD/MM/YYYY").format("YYYY-MM-DDT00:00:00"),
                "RefTime": moment(item.thoiGian, "DD/MM/YYYY").format("YYYY-MM-DDT00:00:00"),
                "BranchID": cuaHang.BranchID,
                "BranchName": cuaHang.BranchName,
                "ContactName": "",
                "JournalMemo": item.ghiChu,
                "CreatedDate": null,
                "CreatedBy": "",
                "ModifiedDate": null,
                "ModifiedBy": "",
                "AccountObjectID": nhaCungCap.ObjectDetailID,
                "AccountObjectName": nhaCungCap.Name,
                "EditVersion": "",
                "TotalAmount": totalAmount,
                "CARefDate": null,
                "CARefNo": "",
                "VendorName": "",
                "ReceiverName": "",
                "InvDate": null,
                "CompanyTaxCode": "",
                "PaymentType": "",
                "IncludeInvoice": "",
                "InvNo": "",
                "Address": "",
                "EmployeeID": "00000000-0000-0000-0000-000000000000",
                "EmployeeName": "",
                "OutwardRefID": "",
                "OutwardRefNo": "",
                "FromBranch": "",
                "EditMode": 1,
                "INInwardDetails": []
            }
           
          }
    }

    const fetchCuaHang = (chiNhanh) => {
        cuaHang.forEach(element => {
            if(element.BranchName == chiNhanh){
                fetch("https://taodentest.mshopkeeper.vn/backendg1/api/Stocks?_dc=1740133834857&page=1&start=0&limit=50&filter=%5B%7B%22xtype%22%3A%22filter%22%2C%22isFilterRow%22%3Atrue%2C%22property%22%3A%22Inactive%22%2C%22operator%22%3A0%2C%22value%22%3A0%2C%22type%22%3A7%7D%5D", {
                    "headers": {
                      "accept": "application/json",
                      "accept-language": "en-US,en;q=0.9,vi;q=0.8",
                      "authorization": "Bearer ZWPdqcvs02sVYstrdyx7grXqWVnEUocGj7cMjkc6ZtWmoYC74xTEyjm3tL3DjQxrfXnyGkQIdxd7sT0HCRmejWK-FoDadgPbIevOEizzQPZ7t4GJ46cSwQEYgps8IYZPhkqlvjkKSI3aBltznoOUEhOwmCcysJVm1_rLCDjYJxi4Sq_YiDr1sDAaGeY3SMFw-b9HcJFGxaU_aRxJ8uPzycoRhgF2M-KZdpbScK09y_aiwvgUfNi_b9vwKji_JbsqRFwCycOVqX9dpnheS9wSuq9pYL0PIbtpGEbN6BzQn0YzLjxJQnOzQB6GPq7fa_HsgUITiYkd2jkLvYaK7NbY3JqOuJ5_eCbNJpf-YWNrAkr7KgfbOinOC_DAZqGLlBN1GOCRFw8N9vfoG3cgr9TpLnGJxPl7vuSSIXCyzWX2jaGn0Q8OojqSiBvJ56Y769wpPDVcdRZhch2TyR-s0r6zn2xeijd9sXq7USAoCVx5SZwHydbXUrkzat-NVekt4iCHL-3ffp8bsCuPmNGBEUxvgj-gxaadJelAe6Kd6KeqqKtfAnmpou1QG3PZmMBfrDZLvj6cX5EpP2DRFtseIJB1ZpGn_7SJX9uDIMONqKIOVjHQgaNX8wm5EyEb7KwZPRn-yDM2Gf8vkqJbQgGWfDkrsS8UQwNE8etU_bsKwKemH27v_MGZjKVippRED7gLwQBM962esUCUI3NoislL0ydtv9Rnry__iwvzrh80Ac9yJPFiDresgvrtRVbFsGupmmz0",
                      "companycode": "taodentest",
                      "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
                      "sec-ch-ua-mobile": "?1",
                      "sec-ch-ua-platform": "\"Android\"",
                      "sec-fetch-dest": "empty",
                      "sec-fetch-mode": "cors",
                      "sec-fetch-site": "same-origin",
                      "x-misa-branchid": "7c366055-6d2f-4992-92d3-54c77886d1b0",
                      "x-misa-language": "vi-VN",
                      "cookie": "_gid=GA1.2.405653036.1740037992; x-deviceid=fae18cf23ea94c28b7fcfa66f2fd5660; ASP.NET_SessionId=ttkfrnhn0sryfyn322kau5iw; taodentest_Token=7522c5a9517e4ba9b77e404973894324; TS01fe7274=019ba1692d9d327f3e8f9c3a426ba4a0e9659bc610d2657c0ceab270acf35d816396fffa9ed01a05043475199590f4ae41ddabf726; _ga=GA1.1.370415893.1740037992; _ga_YLF50693DS=GS1.1.1740133753.7.1.1740133757.0.0.0; _gat=1; _ga_D8GFJLDVNQ=GS1.2.1740130095.9.1.1740133834.0.0.0",
                      "Referer": "https://taodentest.mshopkeeper.vn/main",
                      "Referrer-Policy": "strict-origin-when-cross-origin"
                    },
                    "body": null,
                    "method": "GET"
                  });
                return element
            }
        });
    }
    const fetchPhieuNhap = async(maNhaCungCap) => {
        const response = await fetch(`https://taodentest.mshopkeeper.vn/backendg1/api/ObjectDetails/GetObjectDetailPaging?_dc=1740111358157&query=%5B%7B%22xtype%22%3A%22filter%22%2C%22isFilterRow%22%3Atrue%2C%22property%22%3A%22Code%22%2C%22operator%22%3A1%2C%22value%22%3A%22${maNhaCungCap}%22%2C%22group%22%3A0%2C%22type%22%3A1%2C%22addition%22%3A2%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22isFilterRow%22%3Atrue%2C%22property%22%3A%22Name%22%2C%22operator%22%3A1%2C%22value%22%3A%22${maNhaCungCap}%22%2C%22group%22%3A1%2C%22type%22%3A1%2C%22addition%22%3A2%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22isFilterRow%22%3Atrue%2C%22property%22%3A%22Tel%22%2C%22operator%22%3A1%2C%22value%22%3A%22${maNhaCungCap}%22%2C%22group%22%3A2%2C%22type%22%3A1%2C%22addition%22%3A2%7D%5D&branchId=00000000-0000-0000-0000-000000000000&editMode=1&isIncludeVendor=true`, {
            "headers": {
              "accept": "application/json",
              "accept-language": "en-US,en;q=0.9,vi;q=0.8",
              "authorization": "Bearer ZWPdqcvs02sVYstrdyx7grXqWVnEUocGj7cMjkc6ZtWmoYC74xTEyjm3tL3DjQxrfXnyGkQIdxd7sT0HCRmejWK-FoDadgPbIevOEizzQPZ7t4GJ46cSwQEYgps8IYZPhkqlvjkKSI3aBltznoOUEhOwmCcysJVm1_rLCDjYJxi4Sq_YiDr1sDAaGeY3SMFw-b9HcJFGxaU_aRxJ8uPzycoRhgF2M-KZdpbScK09y_aiwvgUfNi_b9vwKji_JbsqRFwCycOVqX9dpnheS9wSuq9pYL0PIbtpGEbN6BzQn0YzLjxJQnOzQB6GPq7fa_HsgUITiYkd2jkLvYaK7NbY3JqOuJ5_eCbNJpf-YWNrAkr7KgfbOinOC_DAZqGLlBN1GOCRFw8N9vfoG3cgr9TpLnGJxPl7vuSSIXCyzWX2jaGn0Q8OojqSiBvJ56Y769wpPDVcdRZhch2TyR-s0r6zn2xeijd9sXq7USAoCVx5SZwHydbXUrkzat-NVekt4iCHL-3ffp8bsCuPmNGBEUxvgj-gxaadJelAe6Kd6KeqqKtfAnmpou1QG3PZmMBfrDZLvj6cX5EpP2DRFtseIJB1ZpGn_7SJX9uDIMONqKIOVjHQgaNX8wm5EyEb7KwZPRn-yDM2Gf8vkqJbQgGWfDkrsS8UQwNE8etU_bsKwKemH27v_MGZjKVippRED7gLwQBM962esUCUI3NoislL0ydtv9Rnry__iwvzrh80Ac9yJPFiDresgvrtRVbFsGupmmz0",
              "companycode": "taodentest",
              "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
              "sec-ch-ua-mobile": "?1",
              "sec-ch-ua-platform": "\"Android\"",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-misa-branchid": "3f83b38e-c3c8-4030-8dae-106ca1e00e77",
              "x-misa-language": "vi-VN",
              "cookie": "_gid=GA1.2.405653036.1740037992; x-deviceid=fae18cf23ea94c28b7fcfa66f2fd5660; ASP.NET_SessionId=ttkfrnhn0sryfyn322kau5iw; taodentest_Token=7522c5a9517e4ba9b77e404973894324; _ga=GA1.1.370415893.1740037992; _ga_YLF50693DS=GS1.1.1740103192.4.1.1740103773.0.0.0; _ga_D8GFJLDVNQ=GS1.2.1740109023.6.1.1740109023.0.0.0; TS01fe7274=019ba1692d7cecc4f6963cdc20f296aab761f63a00b1ce6d78e41c03d7aee1f6278e0ab99e40b1bf362c9d1914b33ab78afbdc6a16",
              "Referer": "https://taodentest.mshopkeeper.vn/main",
              "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": null,
            "method": "GET"
          });
        const rs = await response.json();
        return rs.Data
    }
    const fetchDanhSachHang = async(maHang) => {
        const response = await fetch(`https://taodentest.mshopkeeper.vn/backendg1/api/InventoryItems/GetItemPagingQuickSearch?_dc=1740113777131&inventoryItemCategoryID=994C6FE5-DA83-441B-A0E8-57A6FED98FB2&getUnit=3&isGetServiceItem=false&isGetSetItem=false&vendorID=00000000-0000-0000-0000-000000000000&page=1&start=0&limit=50&filter=%5B%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22SKUCode%22%2C%22operator%22%3A1%2C%22value%22%3A%22${maHang}%22%2C%22type%22%3A1%2C%22group%22%3A%22SKUCode%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22InventoryItemNameNoAccent%22%2C%22operator%22%3A1%2C%22value%22%3A%22${maHang}%22%2C%22type%22%3A1%2C%22addition%22%3A2%2C%22group%22%3A%22SKUCode%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22InventoryItemName%22%2C%22operator%22%3A1%2C%22value%22%3A%22${maHang}%22%2C%22type%22%3A1%2C%22addition%22%3A2%2C%22group%22%3A%22SKUCode%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22UnitPrice%22%2C%22operator%22%3A0%2C%22value%22%3A99%2C%22type%22%3A7%2C%22addition%22%3A2%2C%22group%22%3A%22SKUCode%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22InventoryItemType%22%2C%22operator%22%3A9%2C%22value%22%3A2%2C%22type%22%3A7%2C%22addition%22%3A1%2C%22group%22%3A%22InventoryItemType%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22InventoryItemTypeSetFilter%22%2C%22operator%22%3A9%2C%22value%22%3A5%2C%22type%22%3A7%2C%22addition%22%3A1%2C%22group%22%3A%22InventoryItemType%22%7D%5D`, {
            "headers": {
              "accept": "application/json",
              "accept-language": "en-US,en;q=0.9,vi;q=0.8",
              "authorization": "Bearer ZWPdqcvs02sVYstrdyx7grXqWVnEUocGj7cMjkc6ZtWmoYC74xTEyjm3tL3DjQxrfXnyGkQIdxd7sT0HCRmejWK-FoDadgPbIevOEizzQPZ7t4GJ46cSwQEYgps8IYZPhkqlvjkKSI3aBltznoOUEhOwmCcysJVm1_rLCDjYJxi4Sq_YiDr1sDAaGeY3SMFw-b9HcJFGxaU_aRxJ8uPzycoRhgF2M-KZdpbScK09y_aiwvgUfNi_b9vwKji_JbsqRFwCycOVqX9dpnheS9wSuq9pYL0PIbtpGEbN6BzQn0YzLjxJQnOzQB6GPq7fa_HsgUITiYkd2jkLvYaK7NbY3JqOuJ5_eCbNJpf-YWNrAkr7KgfbOinOC_DAZqGLlBN1GOCRFw8N9vfoG3cgr9TpLnGJxPl7vuSSIXCyzWX2jaGn0Q8OojqSiBvJ56Y769wpPDVcdRZhch2TyR-s0r6zn2xeijd9sXq7USAoCVx5SZwHydbXUrkzat-NVekt4iCHL-3ffp8bsCuPmNGBEUxvgj-gxaadJelAe6Kd6KeqqKtfAnmpou1QG3PZmMBfrDZLvj6cX5EpP2DRFtseIJB1ZpGn_7SJX9uDIMONqKIOVjHQgaNX8wm5EyEb7KwZPRn-yDM2Gf8vkqJbQgGWfDkrsS8UQwNE8etU_bsKwKemH27v_MGZjKVippRED7gLwQBM962esUCUI3NoislL0ydtv9Rnry__iwvzrh80Ac9yJPFiDresgvrtRVbFsGupmmz0",
              "companycode": "taodentest",
              "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
              "sec-ch-ua-mobile": "?1",
              "sec-ch-ua-platform": "\"Android\"",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-misa-branchid": "7ff2b736-cd8f-408b-9a2c-1abaa132573f",
              "x-misa-language": "vi-VN",
              "cookie": "_gid=GA1.2.405653036.1740037992; x-deviceid=fae18cf23ea94c28b7fcfa66f2fd5660; ASP.NET_SessionId=ttkfrnhn0sryfyn322kau5iw; taodentest_Token=7522c5a9517e4ba9b77e404973894324; _ga=GA1.1.370415893.1740037992; _ga_YLF50693DS=GS1.1.1740112290.5.1.1740113349.0.0.0; _ga_D8GFJLDVNQ=GS1.2.1740112243.7.1.1740113352.0.0.0; TS01fe7274=019ba1692d3bf34063dc20473e6f0b43094955d66974e4378e22eb92bf040a577262ca9aeb2129d324821152d77d19d48efda5c80a",
              "Referer": "https://taodentest.mshopkeeper.vn/main",
              "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": null,
            "method": "GET"
          });   
          const rs = await response.json();
          return rs.Data
    }
    
main()
