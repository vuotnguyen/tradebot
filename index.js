import ccxt, { binance } from "ccxt"
import delay from "delay"
import 'dotenv/config'
import moment from "moment"
import { dummyData, token } from "./src/data.js";
import { cuaHang } from "./src/cuaHang.js";
import { v4 } from "uuid"

import { Agent } from "https"; // Dùng `http` nếu API là HTTP
import { jobSaveBill } from "./src/billLogic.js";

const agent = new Agent({ keepAlive: true });

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

const balance = async () => {
    const balance = await bnb.fetchBalance()
    const total = balance.total
    console.log(`Tai san: BTC ${total.BTC} , USDT: ${total.USDT}`);

}

const tradeBot = async () => {
    const price = await bnb.fetchOHLCV('BTC/USDT', '15m', undefined, 5)
    const sub = await bnb.listener
    const formatPrice = price.map(price => {
        return {
            timestamp: moment(price[0]).format(),
            open: price[1],
            hight: price[2],
            low: price[3],
            close: price[4],
            volume: price[5]
        }
    })

    const averagePrice = formatPrice.reduce((acc, price) => acc + price.close, 0) / 5
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
    console.log('check git branch commit 13');
    const a;
    // var condition = 0 ;
}
const main = async () => {
    // while (true) {
    //     await tradeBot()
    //     await delay(60000)
    // }

    // getData()
    jobSaveBill()

}



const handleData = () => {
    const groupedData = dummyData.reduce((acc, item) => {
        const { chiNhanh, maNhapHang, thoiGian, maNhaCungCap, tongTienHang, ghiChu, maHang, imei, donGia, soLuong } = item;

        if (!acc[maNhapHang]) {
            acc[maNhapHang] = { chiNhanh, maNhapHang, thoiGian, maNhaCungCap, tongTienHang, ghiChu, danhSachHang: [] };
        }

        acc[maNhapHang].danhSachHang.push({maHang, imei, donGia, soLuong, });

        return acc;
    }, {});

    const result = Object.values(groupedData);


    return result;
}
const getData = async () => {
    const data = handleData()
    for (const item of data) {

        try {
            const cuaHang = fetchCuaHang(item.chiNhanh)
            
            
            const gioHang = []
            let totalAmount = 0
            for (const element of item.danhSachHang) {
                totalAmount += element.donGia * element.soLuong
                const maHang = element.maHang.replace(/\\\\/g, "\\")
                
                const data = await fetchDanhSachHang(cuaHang.BranchID,encodeURIComponent(JSON.stringify(element.maHang)))
                const detail = data
                    .filter(itemDetail => itemDetail.SKUCode.trim().toLowerCase() == maHang.trim().toLowerCase())
                    .map(itemDetail => ({
                        RefDetailID: v4(),
                        RefI: "",
                        InventoryItemID: itemDetail.InventoryItemID,
                        InventoryItemName: itemDetail.InventoryItemName,
                        StockID: cuaHang.StockID,
                        StockName: cuaHang.StockName,
                        SKUCode: itemDetail.SKUCode,
                        UnitID: itemDetail.UnitID,
                        UnitName: itemDetail.UnitName,
                        Quantity: element.soLuong,
                        QuantityDocument: 0,
                        UnitPrice: element.donGia,
                        Amount: element.donGia * element.soLuong,
                        SortOrder: gioHang.length + 1,
                        LotNo: "",
                        ExpireDate: null,
                        OutwardRefID: "",
                        OutwardRefDetailID: "",
                        IsAuditByValue: false,
                        SalePrice: 0,
                        AmountSalePrice: 0,
                        BranchID: cuaHang.BranchID,
                        ManageType: itemDetail.ManageType,
                        FastUnitPrice: "",
                        IsFromQuickSearch: true,
                        StockLocationID: null,
                        OriginalUnitID: itemDetail.UnitID,
                        Serials: element?.imei,
                        EditMode: 1,
                        BakEditMode: 1,
                        ListSerial: element?.imei?.includes(",") ? element.imei.split(",") : [element.imei] 
                    }))
                gioHang.push(detail[0])


            }
            const nhaCungCap = item.maNhaCungCap ? await fetchPhieuNhap(cuaHang.BranchID,item.maNhaCungCap) : []
            const body = {
                RefID: "QLCH.model.business.INInward-2",
                RefType: 2095,
                RefTypeName: "",
                RefNo: item.maNhapHang,
                RefDate: moment(item.thoiGian, "DD/MM/YYYY").format("YYYY-MM-DDT01:00:00"),
                RefTime: moment(item.thoiGian, "DD/MM/YYYY").format("YYYY-MM-DDT01:00:00"),
                BranchID: cuaHang.BranchID,
                BranchName: cuaHang.BranchName,
                ContactName: "",
                JournalMemo: item.ghiChu,
                CreatedDate: null,
                CreatedBy: "",
                ModifiedDate: null,
                ModifiedBy: "",
                AccountObjectID: nhaCungCap[0]?.ObjectDetailID,
                AccountObjectName: nhaCungCap[0]?.Name,
                EditVersion: "",
                TotalAmount: totalAmount,
                CARefDate: null,
                CARefNo: "",
                VendorName: "",
                ReceiverName: "",
                InvDate: null,
                CompanyTaxCode: "",
                PaymentType: "",
                IncludeInvoice: "",
                InvNo: "",
                Address: "",
                EmployeeID: "00000000-0000-0000-0000-000000000000",
                EmployeeName: "",
                OutwardRefID: "",
                OutwardRefNo: "",
                FromBranch: "",
                EditMode: 1,
                INInwardDetails: gioHang,
                VoucherReferences: [],
                IsFromBE: true
            }
            await saveData(cuaHang.BranchID,body)
            // console.log(body);
            
        } catch (error) {
            console.log(`error  ${error } when ${item.maNhapHang}` );
            // continue
        }
    }
}

const fetchCuaHang = (chiNhanh) => {
    const result = cuaHang.find(element => element.BranchName.trim().toLowerCase() == chiNhanh.trim().toLowerCase());
    return result
}
const fetchPhieuNhap = async (brandId, maNhaCungCap) => {
    const response = await fetch(`https://taodentest.mshopkeeper.vn/backendg1/api/ObjectDetails?_dc=1740646651778&type=1&content=${maNhaCungCap}&branchId=${brandId}&editMode=1&isReturnEmpty=false&page=1&start=0&limit=50`, {
        "headers": {
          "accept": "application/json",
          "accept-language": "en-US,en;q=0.9,vi;q=0.8",
          "authorization": `Bearer ${token}`,
          "companycode": "taodentest",
          "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": "\"Android\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-misa-branchid": brandId,
          "x-misa-language": "vi-VN",
          "cookie": "x-deviceid=fae18cf23ea94c28b7fcfa66f2fd5660; ASP.NET_SessionId=ttkfrnhn0sryfyn322kau5iw; _gid=GA1.2.1900814718.1740360132; taodentest_Token=7611421578d14668be66db31dbe4808e; _ga_5RQ0H2DBF0=GS1.1.1740641202.11.1.1740641370.0.0.0; _ga_877E0J2DYM=GS1.1.1740641202.11.1.1740641370.0.0.0; _ga=GA1.1.370415893.1740037992; _ga_YLF50693DS=GS1.1.1740646457.23.1.1740646458.0.0.0; _ga_D8GFJLDVNQ=GS1.2.1740645286.24.1.1740646461.0.0.0; TS01fe7274=019ba1692dd14028ba606da954d25922f9dcab2984e26a969e0292278b671e97a3dacd2f39dba28a824e023fb1689c8aac59cee503",
          "Referer": "https://taodentest.mshopkeeper.vn/main",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
      });

    const rs = await response.json();
    return rs.Data
}
const fetchDanhSachHang = async (branchID,maHang) => {
    
    const response = await fetch(`https://taodentest.mshopkeeper.vn/backendg1/api/InventoryItems/GetItemPagingQuickSearch?_dc=1740369237936&inventoryItemCategoryID=994C6FE5-DA83-441B-A0E8-57A6FED98FB2&getUnit=3&isGetServiceItem=false&isGetSetItem=false&vendorID=00000000-0000-0000-0000-000000000000&page=1&start=0&limit=50&filter=%5B%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22SKUCode%22%2C%22operator%22%3A1%2C%22value%22%3A${maHang}%2C%22type%22%3A1%2C%22group%22%3A%22SKUCode%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22InventoryItemNameNoAccent%22%2C%22operator%22%3A1%2C%22value%22%3A${maHang}%2C%22type%22%3A1%2C%22addition%22%3A2%2C%22group%22%3A%22SKUCode%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22InventoryItemName%22%2C%22operator%22%3A1%2C%22value%22%3A${maHang}%2C%22type%22%3A1%2C%22addition%22%3A2%2C%22group%22%3A%22SKUCode%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22UnitPrice%22%2C%22operator%22%3A0%2C%22value%22%3A-1%2C%22type%22%3A7%2C%22addition%22%3A2%2C%22group%22%3A%22SKUCode%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22InventoryItemType%22%2C%22operator%22%3A9%2C%22value%22%3A2%2C%22type%22%3A7%2C%22addition%22%3A1%2C%22group%22%3A%22InventoryItemType%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22InventoryItemTypeSetFilter%22%2C%22operator%22%3A9%2C%22value%22%3A5%2C%22type%22%3A7%2C%22addition%22%3A1%2C%22group%22%3A%22InventoryItemType%22%7D%5D`, {
        "headers": {
          "accept": "application/json",
          "accept-language": "en-US,en;q=0.9,vi;q=0.8",
          "authorization": `Bearer ${token}`,
          "companycode": "taodentest",
          "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": "\"Android\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-misa-branchid": branchID,
          "x-misa-language": "vi-VN",
          "cookie": "x-deviceid=fae18cf23ea94c28b7fcfa66f2fd5660; ASP.NET_SessionId=ttkfrnhn0sryfyn322kau5iw; _gid=GA1.2.1900814718.1740360132; taodentest_Token=afd48085388b4166a1a96e2854d28006; _ga=GA1.1.370415893.1740037992; _ga_D8GFJLDVNQ=GS1.2.1740364977.11.1.1740366740.0.0.0; _ga_YLF50693DS=GS1.1.1740365582.9.1.1740366743.0.0.0; TS01fe7274=019ba1692db4570a0c36c1e37baec0635ee5228e5f65b263d1aa3d13c1758eb13ed5ccb6e6a7ccc96897f4807fb00a7ebae7626ae8",
          "Referer": "https://taodentest.mshopkeeper.vn/main",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET",
        "agent": agent, // Gán agent để giữ kết nối
      });
   
    const rs = await response.json();
    
    return rs.Data
}

const saveData = async (branchID,body) => {
   
    const response = await fetch("https://taodentest.mshopkeeper.vn/backendg1/api/INInwards", {
        "headers": {
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.9,vi;q=0.8",
            "Connection": "keep-alive",
            "authorization": `Bearer ${token}`,
            "companycode": "taodentest",
            "content-type": "application/json",
            "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-misa-branchid": branchID,
            "x-misa-language": "vi-VN",
            "cookie": "_gid=GA1.2.1805397636.1740064661; x-deviceid=1fa93391747741088caf19ef50d2f6c2; ASP.NET_SessionId=q4fnao0uov4d4zercdebf04j; taodentest_Token=c4cb99497a42471ba9c3991b0833e0db; _ga=GA1.2.2089273383.1740064661; _ga_YLF50693DS=GS1.1.1740154099.3.1.1740155699.0.0.0; TS01fe7274=019ba1692dee36a0b76ac2e2da99d52eb357aeec5aa13d8743444598e77f318160c4da9bfbc9fc05b10862c17f6e9ddabcfc2f01d6; _gat=1; _ga_D8GFJLDVNQ=GS1.2.1740152457.3.1.1740157079.0.0.0",
            "Referer": "https://taodentest.mshopkeeper.vn/main",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": JSON.stringify(body),
        "method": "POST",
        "agent": agent, // Gán agent để giữ kết nối
    });
    const rs = await response.json();
    rs.Code == 200 ? console.log("Phieu nhap thanh cong: ", body.RefNo) : console.log("Phieu nhap loi: ", body.RefNo);

}

main()
