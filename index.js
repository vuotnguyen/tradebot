import ccxt, { binance } from "ccxt"
import delay from "delay"
import 'dotenv/config'
import moment from "moment"
import { dummyData } from "./src/data.js";
import { cuaHang } from "./src/cuaHang.js";
import { v4 } from "uuid"

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
    // console.log('check git branch commit 12');
    // var condition = 0 ;
}
const main = async () => {
    // while (true) {
    //     await tradeBot()
    //     await delay(60000)
    // }
    getData()
}



const handleData = () => {
    const groupedData = dummyData.reduce((acc, item) => {
        const { chiNhanh, maNhapHang, thoiGian, maNhaCungCap, tongTienHang, ghiChu, tongSoLuong, maHang, imei, donGia, soLuong } = item;

        if (!acc[maNhapHang]) {
            acc[maNhapHang] = { chiNhanh, maNhapHang, thoiGian, maNhaCungCap, tongTienHang, ghiChu, danhSachHang: [] };
        }

        acc[maNhapHang].danhSachHang.push({ tongSoLuong, maHang, imei, donGia, soLuong, });

        return acc;
    }, {});

    const result = Object.values(groupedData);


    return result;
}
const getData = async () => {
    const data = handleData()
    for (const item of data) {
        
        const cuaHang = fetchCuaHang(item.chiNhanh)
        const nhaCungCap = await fetchPhieuNhap(item.maNhaCungCap)
        const gioHang = []
        let totalAmount = 0
       
        
        for (const element of item.danhSachHang) {
            totalAmount += element.donGia * element.soLuong
            const maHang = element.maHang.replace(/\\\\/g, "\\")
            const data = await fetchDanhSachHang(maHang)

            try {
                const detail = data
                    .filter(itemDetail => itemDetail.SKUCode.trim().toLowerCase() == element.maHang.trim().toLowerCase())
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
                        Serials: element.imei,
                        EditMode: 1,
                        BakEditMode: 1,
                        ListSerial: [element.imei]
                    }))
                gioHang.push(detail[0])
            } catch (error) {
                console.log('error ', error);

            }

        }
        const body = {
            RefID: "QLCH.model.business.INInward-2",
            RefType: 2095,
            RefTypeName: "",
            RefNo: item.maNhapHang,
            RefDate: moment(item.thoiGian, "DD/MM/YYYY").format("YYYY-MM-DDT00:00:00"),
            RefTime: moment(item.thoiGian, "DD/MM/YYYY").format("YYYY-MM-DDT00:00:00"),
            BranchID: cuaHang.BranchID,
            BranchName: cuaHang.BranchName,
            ContactName: "",
            JournalMemo: item.ghiChu,
            CreatedDate: null,
            CreatedBy: "",
            ModifiedDate: null,
            ModifiedBy: "",
            AccountObjectID: nhaCungCap[0].ObjectDetailID,
            AccountObjectName: nhaCungCap[0].Name,
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
        console.log("body ", body);
        await saveData(body)
        
    }
}

const fetchCuaHang = (chiNhanh) => {
    const result = cuaHang.find(element => element.BranchName.trim().toLowerCase() == chiNhanh.trim().toLowerCase());
    return result
}
const fetchPhieuNhap = async (maNhaCungCap) => {
    const response = await fetch(`https://taodentest.mshopkeeper.vn/backendg1/api/ObjectDetails/GetObjectDetailPaging?_dc=1740143965499&query=%5B%7B%22xtype%22%3A%22filter%22%2C%22isFilterRow%22%3Atrue%2C%22property%22%3A%22Code%22%2C%22operator%22%3A1%2C%22value%22%3A%22${maNhaCungCap}%22%2C%22group%22%3A0%2C%22type%22%3A1%2C%22addition%22%3A2%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22isFilterRow%22%3Atrue%2C%22property%22%3A%22Name%22%2C%22operator%22%3A1%2C%22value%22%3A%22${maNhaCungCap}%22%2C%22group%22%3A1%2C%22type%22%3A1%2C%22addition%22%3A2%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22isFilterRow%22%3Atrue%2C%22property%22%3A%22Tel%22%2C%22operator%22%3A1%2C%22value%22%3A%22${maNhaCungCap}%22%2C%22group%22%3A2%2C%22type%22%3A1%2C%22addition%22%3A2%7D%5D&branchId=00000000-0000-0000-0000-000000000000&editMode=1&isIncludeVendor=true`, {
        "headers": {
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.9,vi;q=0.8",
            "authorization": "Bearer nUDCwLJYQR2WMasrfz5D3D_VN2p0ziBtB3Aj4-JAkOrAT6yMbzISLowLNfYPa8-IV-3NVZTv-SSU3oSt4C6zCp-YF8mmFjg2gf3TLHqF6kyjmQkIw3vOdZi5TBsNqvpYueyKh5pvb9YUfhAej-kygBEuYPkwICfR2oWZctSAqpomdECI5G9yMMiwPy9qgah8mW_gb6S32u-H1UheUcojleEfPuEhnBgUmPhlcY16Z-560BIrAnO5m1P1O0e3ZlSrBO_Bx8f3D4aBY_Us5vtf3F7FYjtWJsgcVpzvuVZ8IssXj_5Fr8o-LJ_bD3xb6VQUsVnCogiMkkD1UdxF8MeFBbR-EvD_6pd54f3S8kDLwmC5Yf_os_N9kArguwmw0hMnVQQPR2tQR9axWynyf0GVEgFzAmnixWJfstG-QoH7W_wX_XOsbITyWrB6IHj5q5w_v6pRQLHExvLHUeonH7SyEhLES8C0-WC8BNZPttTOGrlxLxeuD1bndHzBkFBw36f1Uk2G6nwPTf0ObWHmAs1bNhLlwQRVYvPZcwjWZdwAxtW5ZyIfdP__84FUqOZW5xS3nGXIKqZ9XPl6Uhz6GEV9U9cNq_dXPugqh359DLX_sFSoZkiyr-YDomGxE52NKYN5bqDawmM7CcFPaxDxC97hXc6ZTIXOlfjXQicMHd9SPNFSlNty0ICTXWuf8IeplVB8KoaL6nkgesbwnpGwvJ1EBNsgjvroL5R0T_6D_04j0dCrLYuiPHbhhLWWl3ntX3nA",
            "companycode": "taodentest",
            "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-misa-branchid": "355ac2c1-e5e5-4dda-875c-c15cfd1b540d",
            "x-misa-language": "vi-VN",
            "cookie": "_gid=GA1.2.1805397636.1740064661; x-deviceid=1fa93391747741088caf19ef50d2f6c2; ASP.NET_SessionId=q4fnao0uov4d4zercdebf04j; taodentest_Token=c4cb99497a42471ba9c3991b0833e0db; _ga=GA1.2.2089273383.1740064661; _ga_YLF50693DS=GS1.1.1740139652.2.1.1740139849.0.0.0; _ga_D8GFJLDVNQ=GS1.2.1740139695.2.1.1740141304.0.0.0; TS01fe7274=019ba1692db6afef0dd7b43485ebac65f756e3bfc91ea9a4413511982c2a0bfc55c30c7a630d2ee271cb22d6beb4523bb3f7951eb7",
            "Referer": "https://taodentest.mshopkeeper.vn/main",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
    });
    // const response = await fetch(`https://taodentest.mshopkeeper.vn/backendg1/api/ObjectDetails/GetObjectDetailPaging?_dc=1740111358157&query=%5B%7B%22xtype%22%3A%22filter%22%2C%22isFilterRow%22%3Atrue%2C%22property%22%3A%22Code%22%2C%22operator%22%3A1%2C%22value%22%3A%22${maNhaCungCap}%22%2C%22group%22%3A0%2C%22type%22%3A1%2C%22addition%22%3A2%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22isFilterRow%22%3Atrue%2C%22property%22%3A%22Name%22%2C%22operator%22%3A1%2C%22value%22%3A%22${maNhaCungCap}%22%2C%22group%22%3A1%2C%22type%22%3A1%2C%22addition%22%3A2%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22isFilterRow%22%3Atrue%2C%22property%22%3A%22Tel%22%2C%22operator%22%3A1%2C%22value%22%3A%22${maNhaCungCap}%22%2C%22group%22%3A2%2C%22type%22%3A1%2C%22addition%22%3A2%7D%5D&branchId=00000000-0000-0000-0000-000000000000&editMode=1&isIncludeVendor=true`, {
    //     "headers": {
    //       "accept": "application/json",
    //       "accept-language": "en-US,en;q=0.9,vi;q=0.8",
    //       "authorization": "Bearer nUDCwLJYQR2WMasrfz5D3D_VN2p0ziBtB3Aj4-JAkOrAT6yMbzISLowLNfYPa8-IV-3NVZTv-SSU3oSt4C6zCp-YF8mmFjg2gf3TLHqF6kyjmQkIw3vOdZi5TBsNqvpYueyKh5pvb9YUfhAej-kygBEuYPkwICfR2oWZctSAqpomdECI5G9yMMiwPy9qgah8mW_gb6S32u-H1UheUcojleEfPuEhnBgUmPhlcY16Z-560BIrAnO5m1P1O0e3ZlSrBO_Bx8f3D4aBY_Us5vtf3F7FYjtWJsgcVpzvuVZ8IssXj_5Fr8o-LJ_bD3xb6VQUsVnCogiMkkD1UdxF8MeFBbR-EvD_6pd54f3S8kDLwmC5Yf_os_N9kArguwmw0hMnVQQPR2tQR9axWynyf0GVEgFzAmnixWJfstG-QoH7W_wX_XOsbITyWrB6IHj5q5w_v6pRQLHExvLHUeonH7SyEhLES8C0-WC8BNZPttTOGrlxLxeuD1bndHzBkFBw36f1Uk2G6nwPTf0ObWHmAs1bNhLlwQRVYvPZcwjWZdwAxtW5ZyIfdP__84FUqOZW5xS3nGXIKqZ9XPl6Uhz6GEV9U9cNq_dXPugqh359DLX_sFSoZkiyr-YDomGxE52NKYN5bqDawmM7CcFPaxDxC97hXc6ZTIXOlfjXQicMHd9SPNFSlNty0ICTXWuf8IeplVB8KoaL6nkgesbwnpGwvJ1EBNsgjvroL5R0T_6D_04j0dCrLYuiPHbhhLWWl3ntX3nA",
    //       "companycode": "taodentest",
    //       "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
    //       "sec-ch-ua-mobile": "?1",
    //       "sec-ch-ua-platform": "\"Android\"",
    //       "sec-fetch-dest": "empty",
    //       "sec-fetch-mode": "cors",
    //       "sec-fetch-site": "same-origin",
    //       "x-misa-branchid": "3f83b38e-c3c8-4030-8dae-106ca1e00e77",
    //       "x-misa-language": "vi-VN",
    //       "cookie": "_gid=GA1.2.405653036.1740037992; x-deviceid=fae18cf23ea94c28b7fcfa66f2fd5660; ASP.NET_SessionId=ttkfrnhn0sryfyn322kau5iw; taodentest_Token=7522c5a9517e4ba9b77e404973894324; _ga=GA1.1.370415893.1740037992; _ga_YLF50693DS=GS1.1.1740103192.4.1.1740103773.0.0.0; _ga_D8GFJLDVNQ=GS1.2.1740109023.6.1.1740109023.0.0.0; TS01fe7274=019ba1692d7cecc4f6963cdc20f296aab761f63a00b1ce6d78e41c03d7aee1f6278e0ab99e40b1bf362c9d1914b33ab78afbdc6a16",
    //       "Referer": "https://taodentest.mshopkeeper.vn/main",
    //       "Referrer-Policy": "strict-origin-when-cross-origin"
    //     },
    //     "body": null,
    //     "method": "GET"
    //   });
    const rs = await response.json();
    
    return rs.Data
}
const fetchDanhSachHang = async (maHang) => {
    const response = await fetch(`https://taodentest.mshopkeeper.vn/backendg1/api/InventoryItems/GetItemPagingQuickSearch?_dc=1740141323348&inventoryItemCategoryID=994C6FE5-DA83-441B-A0E8-57A6FED98FB2&getUnit=3&isGetServiceItem=false&isGetSetItem=false&vendorID=00000000-0000-0000-0000-000000000000&page=1&start=0&limit=50&filter=%5B%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22SKUCode%22%2C%22operator%22%3A1%2C%22value%22%3A%22${maHang}%22%2C%22type%22%3A1%2C%22group%22%3A%22SKUCode%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22InventoryItemNameNoAccent%22%2C%22operator%22%3A1%2C%22value%22%3A%22${maHang}%22%2C%22type%22%3A1%2C%22addition%22%3A2%2C%22group%22%3A%22SKUCode%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22InventoryItemName%22%2C%22operator%22%3A1%2C%22value%22%3A%22${maHang}%22%2C%22type%22%3A1%2C%22addition%22%3A2%2C%22group%22%3A%22SKUCode%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22UnitPrice%22%2C%22operator%22%3A0%2C%22value%22%3A95%2C%22type%22%3A7%2C%22addition%22%3A2%2C%22group%22%3A%22SKUCode%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22InventoryItemType%22%2C%22operator%22%3A9%2C%22value%22%3A2%2C%22type%22%3A7%2C%22addition%22%3A1%2C%22group%22%3A%22InventoryItemType%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22InventoryItemTypeSetFilter%22%2C%22operator%22%3A9%2C%22value%22%3A5%2C%22type%22%3A7%2C%22addition%22%3A1%2C%22group%22%3A%22InventoryItemType%22%7D%5D`, {
        "headers": {
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.9,vi;q=0.8",
            "authorization": "Bearer nUDCwLJYQR2WMasrfz5D3D_VN2p0ziBtB3Aj4-JAkOrAT6yMbzISLowLNfYPa8-IV-3NVZTv-SSU3oSt4C6zCp-YF8mmFjg2gf3TLHqF6kyjmQkIw3vOdZi5TBsNqvpYueyKh5pvb9YUfhAej-kygBEuYPkwICfR2oWZctSAqpomdECI5G9yMMiwPy9qgah8mW_gb6S32u-H1UheUcojleEfPuEhnBgUmPhlcY16Z-560BIrAnO5m1P1O0e3ZlSrBO_Bx8f3D4aBY_Us5vtf3F7FYjtWJsgcVpzvuVZ8IssXj_5Fr8o-LJ_bD3xb6VQUsVnCogiMkkD1UdxF8MeFBbR-EvD_6pd54f3S8kDLwmC5Yf_os_N9kArguwmw0hMnVQQPR2tQR9axWynyf0GVEgFzAmnixWJfstG-QoH7W_wX_XOsbITyWrB6IHj5q5w_v6pRQLHExvLHUeonH7SyEhLES8C0-WC8BNZPttTOGrlxLxeuD1bndHzBkFBw36f1Uk2G6nwPTf0ObWHmAs1bNhLlwQRVYvPZcwjWZdwAxtW5ZyIfdP__84FUqOZW5xS3nGXIKqZ9XPl6Uhz6GEV9U9cNq_dXPugqh359DLX_sFSoZkiyr-YDomGxE52NKYN5bqDawmM7CcFPaxDxC97hXc6ZTIXOlfjXQicMHd9SPNFSlNty0ICTXWuf8IeplVB8KoaL6nkgesbwnpGwvJ1EBNsgjvroL5R0T_6D_04j0dCrLYuiPHbhhLWWl3ntX3nA",
            "companycode": "taodentest",
            "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-misa-branchid": "355ac2c1-e5e5-4dda-875c-c15cfd1b540d",
            "x-misa-language": "vi-VN",
            "cookie": "_gid=GA1.2.1805397636.1740064661; x-deviceid=1fa93391747741088caf19ef50d2f6c2; ASP.NET_SessionId=q4fnao0uov4d4zercdebf04j; taodentest_Token=c4cb99497a42471ba9c3991b0833e0db; _ga=GA1.2.2089273383.1740064661; _ga_YLF50693DS=GS1.1.1740139652.2.1.1740139849.0.0.0; TS01fe7274=019ba1692d4b63cab3cf903ecec2969e6c149079b83a249fee21af7772d03f6ba36e80908552315213b06a0ab5d7e482a2719632c2; _gat=1; _ga_D8GFJLDVNQ=GS1.2.1740139695.2.1.1740141304.0.0.0",
            "Referer": "https://taodentest.mshopkeeper.vn/main",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
    });
    // const response = await fetch(`https://taodentest.mshopkeeper.vn/backendg1/api/InventoryItems/GetItemPagingQuickSearch?_dc=1740113777131&inventoryItemCategoryID=994C6FE5-DA83-441B-A0E8-57A6FED98FB2&getUnit=3&isGetServiceItem=false&isGetSetItem=false&vendorID=00000000-0000-0000-0000-000000000000&page=1&start=0&limit=50&filter=%5B%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22SKUCode%22%2C%22operator%22%3A1%2C%22value%22%3A%22${maHang}%22%2C%22type%22%3A1%2C%22group%22%3A%22SKUCode%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22InventoryItemNameNoAccent%22%2C%22operator%22%3A1%2C%22value%22%3A%22${maHang}%22%2C%22type%22%3A1%2C%22addition%22%3A2%2C%22group%22%3A%22SKUCode%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22InventoryItemName%22%2C%22operator%22%3A1%2C%22value%22%3A%22${maHang}%22%2C%22type%22%3A1%2C%22addition%22%3A2%2C%22group%22%3A%22SKUCode%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22UnitPrice%22%2C%22operator%22%3A0%2C%22value%22%3A99%2C%22type%22%3A7%2C%22addition%22%3A2%2C%22group%22%3A%22SKUCode%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22InventoryItemType%22%2C%22operator%22%3A9%2C%22value%22%3A2%2C%22type%22%3A7%2C%22addition%22%3A1%2C%22group%22%3A%22InventoryItemType%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22InventoryItemTypeSetFilter%22%2C%22operator%22%3A9%2C%22value%22%3A5%2C%22type%22%3A7%2C%22addition%22%3A1%2C%22group%22%3A%22InventoryItemType%22%7D%5D`, {
    //     "headers": {
    //       "accept": "application/json",
    //       "accept-language": "en-US,en;q=0.9,vi;q=0.8",
    //       "authorization": "Bearer nUDCwLJYQR2WMasrfz5D3D_VN2p0ziBtB3Aj4-JAkOrAT6yMbzISLowLNfYPa8-IV-3NVZTv-SSU3oSt4C6zCp-YF8mmFjg2gf3TLHqF6kyjmQkIw3vOdZi5TBsNqvpYueyKh5pvb9YUfhAej-kygBEuYPkwICfR2oWZctSAqpomdECI5G9yMMiwPy9qgah8mW_gb6S32u-H1UheUcojleEfPuEhnBgUmPhlcY16Z-560BIrAnO5m1P1O0e3ZlSrBO_Bx8f3D4aBY_Us5vtf3F7FYjtWJsgcVpzvuVZ8IssXj_5Fr8o-LJ_bD3xb6VQUsVnCogiMkkD1UdxF8MeFBbR-EvD_6pd54f3S8kDLwmC5Yf_os_N9kArguwmw0hMnVQQPR2tQR9axWynyf0GVEgFzAmnixWJfstG-QoH7W_wX_XOsbITyWrB6IHj5q5w_v6pRQLHExvLHUeonH7SyEhLES8C0-WC8BNZPttTOGrlxLxeuD1bndHzBkFBw36f1Uk2G6nwPTf0ObWHmAs1bNhLlwQRVYvPZcwjWZdwAxtW5ZyIfdP__84FUqOZW5xS3nGXIKqZ9XPl6Uhz6GEV9U9cNq_dXPugqh359DLX_sFSoZkiyr-YDomGxE52NKYN5bqDawmM7CcFPaxDxC97hXc6ZTIXOlfjXQicMHd9SPNFSlNty0ICTXWuf8IeplVB8KoaL6nkgesbwnpGwvJ1EBNsgjvroL5R0T_6D_04j0dCrLYuiPHbhhLWWl3ntX3nA",
    //       "companycode": "taodentest",
    //       "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
    //       "sec-ch-ua-mobile": "?1",
    //       "sec-ch-ua-platform": "\"Android\"",
    //       "sec-fetch-dest": "empty",
    //       "sec-fetch-mode": "cors",
    //       "sec-fetch-site": "same-origin",
    //       "x-misa-branchid": "7ff2b736-cd8f-408b-9a2c-1abaa132573f",
    //       "x-misa-language": "vi-VN",
    //       "cookie": "_gid=GA1.2.405653036.1740037992; x-deviceid=fae18cf23ea94c28b7fcfa66f2fd5660; ASP.NET_SessionId=ttkfrnhn0sryfyn322kau5iw; taodentest_Token=7522c5a9517e4ba9b77e404973894324; _ga=GA1.1.370415893.1740037992; _ga_YLF50693DS=GS1.1.1740112290.5.1.1740113349.0.0.0; _ga_D8GFJLDVNQ=GS1.2.1740112243.7.1.1740113352.0.0.0; TS01fe7274=019ba1692d3bf34063dc20473e6f0b43094955d66974e4378e22eb92bf040a577262ca9aeb2129d324821152d77d19d48efda5c80a",
    //       "Referer": "https://taodentest.mshopkeeper.vn/main",
    //       "Referrer-Policy": "strict-origin-when-cross-origin"
    //     },
    //     "body": null,
    //     "method": "GET"
    //   });   
    const rs = await response.json();
    
    return rs.Data
}

const saveData = async(body) => {
    // const response = await fetch("https://taodentest.mshopkeeper.vn/backendg1/api/INInwards", {
    //     "headers": {
    //       "accept": "application/json",
    //       "accept-language": "en-US,en;q=0.9,vi;q=0.8",
    //       "authorization": "Bearer nUDCwLJYQR2WMasrfz5D3D_VN2p0ziBtB3Aj4-JAkOrAT6yMbzISLowLNfYPa8-IV-3NVZTv-SSU3oSt4C6zCp-YF8mmFjg2gf3TLHqF6kyjmQkIw3vOdZi5TBsNqvpYueyKh5pvb9YUfhAej-kygBEuYPkwICfR2oWZctSAqpomdECI5G9yMMiwPy9qgah8mW_gb6S32u-H1UheUcojleEfPuEhnBgUmPhlcY16Z-560BIrAnO5m1P1O0e3ZlSrBO_Bx8f3D4aBY_Us5vtf3F7FYjtWJsgcVpzvuVZ8IssXj_5Fr8o-LJ_bD3xb6VQUsVnCogiMkkD1UdxF8MeFBbR-EvD_6pd54f3S8kDLwmC5Yf_os_N9kArguwmw0hMnVQQPR2tQR9axWynyf0GVEgFzAmnixWJfstG-QoH7W_wX_XOsbITyWrB6IHj5q5w_v6pRQLHExvLHUeonH7SyEhLES8C0-WC8BNZPttTOGrlxLxeuD1bndHzBkFBw36f1Uk2G6nwPTf0ObWHmAs1bNhLlwQRVYvPZcwjWZdwAxtW5ZyIfdP__84FUqOZW5xS3nGXIKqZ9XPl6Uhz6GEV9U9cNq_dXPugqh359DLX_sFSoZkiyr-YDomGxE52NKYN5bqDawmM7CcFPaxDxC97hXc6ZTIXOlfjXQicMHd9SPNFSlNty0ICTXWuf8IeplVB8KoaL6nkgesbwnpGwvJ1EBNsgjvroL5R0T_6D_04j0dCrLYuiPHbhhLWWl3ntX3nA",
    //       "companycode": "taodentest",
    //       "content-type": "application/json",
    //       "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
    //       "sec-ch-ua-mobile": "?0",
    //       "sec-ch-ua-platform": "\"macOS\"",
    //       "sec-fetch-dest": "empty",
    //       "sec-fetch-mode": "cors",
    //       "sec-fetch-site": "same-origin",
    //       "x-misa-branchid": "06b9265d-b3c3-470a-ad58-34f019424c90",
    //       "x-misa-language": "vi-VN",
    //       "cookie": "_gid=GA1.2.1805397636.1740064661; x-deviceid=1fa93391747741088caf19ef50d2f6c2; ASP.NET_SessionId=q4fnao0uov4d4zercdebf04j; taodentest_Token=c4cb99497a42471ba9c3991b0833e0db; _ga=GA1.2.2089273383.1740064661; _ga_YLF50693DS=GS1.1.1740139652.2.1.1740139849.0.0.0; TS01fe7274=019ba1692df1f2a4610ba4383369098a6496ba0d31df00cd1201a924446340725cc25f903db14397e11ffad07bca47427c10dc97ee; _gat=1; _ga_D8GFJLDVNQ=GS1.2.1740152457.3.1.1740153234.0.0.0",
    //       "Referer": "https://taodentest.mshopkeeper.vn/main",
    //       "Referrer-Policy": "strict-origin-when-cross-origin"
    //     },
    //     "body": body,
    //     "method": "POST"
    //   });
    const response = await fetch("https://taodentest.mshopkeeper.vn/backendg1/api/INInwards", {
        "headers": {
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.9,vi;q=0.8",
            "authorization": "Bearer nUDCwLJYQR2WMasrfz5D3D_VN2p0ziBtB3Aj4-JAkOrAT6yMbzISLowLNfYPa8-IV-3NVZTv-SSU3oSt4C6zCp-YF8mmFjg2gf3TLHqF6kyjmQkIw3vOdZi5TBsNqvpYueyKh5pvb9YUfhAej-kygBEuYPkwICfR2oWZctSAqpomdECI5G9yMMiwPy9qgah8mW_gb6S32u-H1UheUcojleEfPuEhnBgUmPhlcY16Z-560BIrAnO5m1P1O0e3ZlSrBO_Bx8f3D4aBY_Us5vtf3F7FYjtWJsgcVpzvuVZ8IssXj_5Fr8o-LJ_bD3xb6VQUsVnCogiMkkD1UdxF8MeFBbR-EvD_6pd54f3S8kDLwmC5Yf_os_N9kArguwmw0hMnVQQPR2tQR9axWynyf0GVEgFzAmnixWJfstG-QoH7W_wX_XOsbITyWrB6IHj5q5w_v6pRQLHExvLHUeonH7SyEhLES8C0-WC8BNZPttTOGrlxLxeuD1bndHzBkFBw36f1Uk2G6nwPTf0ObWHmAs1bNhLlwQRVYvPZcwjWZdwAxtW5ZyIfdP__84FUqOZW5xS3nGXIKqZ9XPl6Uhz6GEV9U9cNq_dXPugqh359DLX_sFSoZkiyr-YDomGxE52NKYN5bqDawmM7CcFPaxDxC97hXc6ZTIXOlfjXQicMHd9SPNFSlNty0ICTXWuf8IeplVB8KoaL6nkgesbwnpGwvJ1EBNsgjvroL5R0T_6D_04j0dCrLYuiPHbhhLWWl3ntX3nA",
            "companycode": "taodentest",
            "content-type": "application/json",
            "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-misa-branchid": "06b9265d-b3c3-470a-ad58-34f019424c90",
            "x-misa-language": "vi-VN",
            "cookie": "_gid=GA1.2.1805397636.1740064661; x-deviceid=1fa93391747741088caf19ef50d2f6c2; ASP.NET_SessionId=q4fnao0uov4d4zercdebf04j; taodentest_Token=c4cb99497a42471ba9c3991b0833e0db; _ga=GA1.2.2089273383.1740064661; _ga_YLF50693DS=GS1.1.1740154099.3.1.1740155699.0.0.0; TS01fe7274=019ba1692dee36a0b76ac2e2da99d52eb357aeec5aa13d8743444598e77f318160c4da9bfbc9fc05b10862c17f6e9ddabcfc2f01d6; _gat=1; _ga_D8GFJLDVNQ=GS1.2.1740152457.3.1.1740157079.0.0.0",
            "Referer": "https://taodentest.mshopkeeper.vn/main",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": JSON.stringify(body),
        "method": "POST"
        });
      const rs = await response.json();
      console.log(rs);
      
}

main()
