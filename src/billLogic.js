

import moment from "moment"
import { v4 } from "uuid"
// import { store } from "./bill.js";
import { token } from "./data.js";
import excelToJson from "convert-excel-to-json";
import { cuaHang } from "./cuaHang.js";

const handleDataBill = () => {
  const rs = excelToJson({sourceFile: "data/hoadon1819.xlsx", columnToKey: {
    A: 'chiNhanh',
    B: 'maHoaDon',
    C: 'thoiGian',
    D: 'maKhachHang',
    E: 'ghiChu',
    F: 'giamGiaHoaDon',
    G: 'tongTien',
    H: 'maHang',
    I: 'imei',
    J: 'soLuong',
    K: 'donGia',
    L: 'giamGiaHangHoa',
    M: 'giaBan',
    N: 'thanhTien'
}})

  
  const groupedData = rs.oneMonth.reduce((acc, item) => {
    const { chiNhanh, maHoaDon, thoiGian, maKhachHang, ghiChu, giamGiaHoaDon, tongTien, maHang, imei, soLuong, donGia, giamGiaHangHoa, giaBan, thanhTien } = item;

    if (!acc[maHoaDon]) {
      acc[maHoaDon] = { chiNhanh, maHoaDon, thoiGian, maKhachHang, ghiChu, giamGiaHoaDon, tongTien, danhSachHang: [] };
    }

    acc[maHoaDon].danhSachHang.push({ maHang, imei, donGia, soLuong, giamGiaHangHoa, giaBan, thanhTien });

    return acc;
  }, {});

  const result = Object.values(groupedData);

  return result;
}

const generateRandomString = (length = 9) => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"; // Chữ cái + số
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }

  return result;
}

export const jobSaveBill = async () => {
  const dataBill = handleDataBill()
  for (const item of dataBill) {
    try {
      const store = cuaHang.find((element) => element.BranchName == item.chiNhanh)
      
      const gioHang = []
      let totalAmount = 0
      let amountAfterDiscount = 0
      let totalDiscount = 0
      const uuid = v4()
      for (const element of item.danhSachHang) {
        const timestamp = Date.now();
        const maHang = element.maHang.replace(/\\\\/g, "\\")
        const data = await fetchHangHoa(store.BranchID, encodeURIComponent(JSON.stringify(element.maHang)))
        totalAmount += element.donGia * element.soLuong
        totalDiscount += element.giamGiaHangHoa * element.soLuong
        amountAfterDiscount += ((element.donGia * element.soLuong) - (element.giamGiaHangHoa * element.soLuong))
        const detail = data
          .filter(itemDetail => itemDetail.SKUCode.trim().toLowerCase() == maHang.trim().toLowerCase())
          .map(itemDetail => (
            {
              CODE: `MISA_${generateRandomString(9)}_${timestamp}`, // ?
              InventoryItemID: itemDetail.InventoryItemID,
              SKUCode: itemDetail.SKUCode,
              InventoryItemName: itemDetail.InventoryItemName,
              Quantity: element.soLuong,
              UnitID: itemDetail.UnitID,
              UnitName: itemDetail.UnitName,
              UnitPrice: element.donGia,
              Amount: element.donGia * element.soLuong,
              DiscountRate: 0,
              DiscountAmount: element.giamGiaHangHoa * element.soLuong,
              errorQuantity: false,
              RefDetailType: 1, // đổi trả: 2
              Weight: 0,
              ConvertRate: 1,
              EditMode: 1,
              InventoryItemType: itemDetail.InventoryItemType,
              UnitPriceDefault: element.donGia,
              UnitPriceOld: element.donGia,
              CostPrice: 0,
              CloseQuantityDefault: 2,
              Color: "",
              Size: "",
              ColourCode: "",
              selectedSerial: element?.imei?.includes(",") ? element.imei.split(",") : [element.imei],
              selectedAllSerial: element?.imei?.includes(",") ? element.imei.split(",") : [element.imei],
              ManageType: 2,
              InventoryItemParent: "00000000-0000-0000-0000-000000000000",
              TaxRate: 10,
              Barcode: itemDetail.Barcode,
              SortOrder: gioHang.length + 1,
              QuantityRoot: 1,
              FeeReturnValue: 0,
              AllocationAmount: 0, // ?
              AllocationAmountBeforeTax: 0, //?
              AllocationPointAmount: 0,//?
              AllocationPointAmountBeforeTax: 0,//?
              TaxAmount: 0,//?
              enableDescription: true,
              Description: item.maHoaDon,
              Serials: element.imei,
              ItemEditType: 0,
              RefID: uuid, //?
              RefDetailID: v4() //?
            }
          ))
        gioHang.push(detail[0])
      }
      const khachHang = await fetchKhachHang(item.maKhachHang)
      
      const bill = {
        maHoaDon: item.maHoaDon,
        EditMode: 1,
        TotalItemAmount: totalAmount,
        TotalItem: gioHang.length,
        ReceiveAmount: amountAfterDiscount - item.giamGiaHoaDon,
        CashAmount: amountAfterDiscount - item.giamGiaHoaDon,
        RemainAmount: amountAfterDiscount - item.giamGiaHoaDon,
        CardAmount: 0,
        TotalAmount: amountAfterDiscount - item.giamGiaHoaDon,
        TotalActualAmount: amountAfterDiscount - item.giamGiaHoaDon,
        RefType: 550, // đổi trả: 553
        DiscountAmount: item.giamGiaHoaDon,
        VATAmount: 0,
        DeliveryAmount: 0,
        PointAmount: 0,
        ReturnExchangeAmount: 0,
        TotalItemDiscountAmount: totalDiscount,
        DepositAmount: 0,
        TotalCoupon: 0,
        ChangeAmount: 0,
        NotTakeChangeAmount: 0,
        ChangeDeductedAmount: 0,
        TaxAmount: 0,
        PreOrder: 0,
        SaleChannelID: "00000000-0000-0000-0000-000000000000",
        SaleChannelName: "Tại cửa hàng",
        EmployeeName: "",
        EmployeeCode: "",
        EmployeeID: "",
        EmployeeMobile: "",
        EmployeeEmail: "",
        isCopyData: true,
        IsTaxReduction: false,
        BranchID: store.BranchID,
        IsPointPromotion: false,
        RefID: uuid,//?
        LogID: "",//?
        UnitPriceType: 2,
        ServiceTaxRate: 10,
        IsApplyTax: true,
        Description: item.ghiChu,
        TotalItemReturnAmount: 0,
        TotalItemAmountReturnWithDisCount: 0,
        TaxReductionAmount: 0,
        TotalItemAmountBeforeTax: 0,
        TotalItemDiscountAmountBeforeTax: 0,
        DiscountAmountBeforeTax: 0,
        IsErrorPointAmount: false,
        DeliveryAmountBeforeTax: 0,
        ReturnExchangeAmountBeforeTax: 0,
        DebtReductionAmount: 0,
        TotalReceipt: 0,
        PromotionID: "",
        PromotionName: "Giảm giá trực tiếp",
        DiscountRate: 0,
        ScopeOfApplication: 1,
        sainvoiceCouponDetails: [],
        TotalDebitAmount: 0,
        CustomerID: khachHang?.CustomerID,
        CustomerCode: khachHang?.CustomerCode,
        CustomerAddress: khachHang?.CustomerAddress,
        CustomerName: khachHang?.CustomerName,
        CustomerTel: khachHang?.CustomerTel,
        Gender: khachHang?.Gender,
        MembershipID: null,
        MembershipCode: null,
        MemberLevelID: null,
        DebitAmount: 0,
        PaymentStatus: 3,
        FunctionInvoice: 6,
        // haveCustomer:false,
        RefDate: moment(new Date(item.thoiGian)).format("YYYY-MM-DDTHH:mm:ssZ"),
        CreateInvoiceDate: moment(new Date(item.thoiGian)).format("YYYY-MM-DDTHH:mm:ssZ"),
        CompleteInvoiceDate: moment(new Date(item.thoiGian)).format("YYYY-MM-DDTHH:mm:ssZ"),
        CashierID: "5c67b1b9-8987-4da8-9f14-89a80dc1aacc",
        DeviceID: "5c67b1b9-8987-4da8-9f14-89a80dc1aacc",
        CashierTel: "0374032846",
        CashierName: "Táo Đen Test",
        CashierEmail: "phuongthuy11102000@gmail.com",
        VoucherAmount: 0,
        CouponDiscountAmount: 0,
        CardRank: "",
        PaymentTerm: null,
        SAInvoiceDetails: gioHang,
        // SAInvoicePayments: [{
        //   SAInvoicePaymentID: "99b8d507-42c3-49c7-b59d-1e647a163cd7",
        //   Amount: totalAmount,
        //   CardName: "Tiền mặt",
        //   PaymentName: "Tiền mặt",
        //   PaymentType: 1,
        //   EditMode: 1,
        //   disable: false,
        //   RefID: uuid,
        //   // CODE: `MISA_${generateRandomString(9)}_${timestamp}`,
        //   BankAccountID: ""
        // }],
        SAInvoiceCoupons: [],
        SAInvoiceExtensions: [],
        SAInvoiceDebitDetails: [],
        EcomMappings: [],
        EInvoices: []
      }
      const body = {
        BranchID: store.BranchID,
        ClientID: "SaleCloud",
        CompanyCode: "taodentest2",
        CreatedDate: moment(new Date(item.thoiGian)).format("YYYY-MM-DDTHH:mm:ssZ"),
        UploadData: JSON.stringify([bill])
      }
      await saveBill(store.BranchID,body, item.maHoaDon)
      // gioHang.length >=1 && console.log('body :', body);
      
      
    } catch (error) {
        console.log(`phieu xuat ${item.maHoaDon} loi:  ${error}`);
        
    }
  }
}

const fetchHangHoa = async (branchId, maHangHoa) => {
  const response = await fetch(`https://taodentest2.mshopkeeper.vn/backendg2/api/InventoryItem?_dc=1740478058265&inventoryItemCategoryID=00000000-0000-0000-0000-000000000000&branchID=${branchId}&isOutStock=0&page=1&start=0&limit=50&sort=%5B%7B%22property%22%3A%22InventoryItemName%22%2C%22direction%22%3A%22ASC%22%7D%5D&filter=%5B%7B%22xtype%22%3A%22filter%22%2C%22isFilterRow%22%3Atrue%2C%22property%22%3A%22Inactive%22%2C%22operator%22%3A0%2C%22value%22%3A0%2C%22type%22%3A7%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22isFilterRow%22%3Atrue%2C%22property%22%3A%22SKUCode%22%2C%22operator%22%3A1%2C%22value%22%3A${maHangHoa}%2C%22type%22%3A1%2C%22addition%22%3A1%2C%22group%22%3A%22SKUCodeFFR%22%7D%5D`, {
    "headers": {
      "accept": "application/json",
      "accept-language": "en-US,en;q=0.9,vi;q=0.8",
      "authorization": `Bearer ${token}`,
      "companycode": "taodentest2",
      "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": "\"Android\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-misa-branchid": branchId,
      "x-misa-language": "vi-VN",
      "cookie": "x-deviceid=fae18cf23ea94c28b7fcfa66f2fd5660; ASP.NET_SessionId=ttkfrnhn0sryfyn322kau5iw; _gid=GA1.2.1900814718.1740360132; taoden_Token=41b54bbe4fb948cd9c841ed941308798; _ga_YLF50693DS=GS1.1.1740472754.16.1.1740472905.0.0.0; _ga_5RQ0H2DBF0=GS1.1.1740472865.2.1.1740473820.0.0.0; _ga_877E0J2DYM=GS1.1.1740472865.2.1.1740473820.0.0.0; _ga=GA1.1.370415893.1740037992; TS01fe7274=019ba1692d0d41e2e6fb646d3a24ca2a58fcc26d0df9447ba7548fe1186a87366f2a49d579bdd948f872771f072cfc06ef5956608f; _gat=1; _ga_D8GFJLDVNQ=GS1.2.1740477376.18.1.1740478057.0.0.0",
      "Referer": "https://taodentest2.mshopkeeper.vn/main",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": null,
    "method": "GET"
  });
  const rs = await response.json();
  
  return rs.Data
}

// const fetchHangHoa = async() => {
//   const response = await fetch("https://taodentest2.mshopkeeper.vn/backendg2/api/InventoryItems/GetItemPagingQuickSearch?_dc=1742923205459&inventoryItemCategoryID=994C6FE5-DA83-441B-A0E8-57A6FED98FB2&getUnit=3&isGetServiceItem=false&isGetSetItem=false&vendorID=00000000-0000-0000-0000-000000000000&page=1&start=0&limit=50&filter=%5B%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22SKUCode%22%2C%22operator%22%3A1%2C%22value%22%3A%22ip7pt32%22%2C%22type%22%3A1%2C%22group%22%3A%22SKUCode%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22InventoryItemNameNoAccent%22%2C%22operator%22%3A1%2C%22value%22%3A%22ip7pt32%22%2C%22type%22%3A1%2C%22addition%22%3A2%2C%22group%22%3A%22SKUCode%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22InventoryItemName%22%2C%22operator%22%3A1%2C%22value%22%3A%22ip7pt32%22%2C%22type%22%3A1%2C%22addition%22%3A2%2C%22group%22%3A%22SKUCode%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22UnitPrice%22%2C%22operator%22%3A0%2C%22value%22%3A-1%2C%22type%22%3A7%2C%22addition%22%3A2%2C%22group%22%3A%22SKUCode%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22InventoryItemType%22%2C%22operator%22%3A9%2C%22value%22%3A2%2C%22type%22%3A7%2C%22addition%22%3A1%2C%22group%22%3A%22InventoryItemType%22%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22property%22%3A%22InventoryItemTypeSetFilter%22%2C%22operator%22%3A9%2C%22value%22%3A5%2C%22type%22%3A7%2C%22addition%22%3A1%2C%22group%22%3A%22InventoryItemType%22%7D%5D", {
//     "headers": {
//       "accept": "application/json",
//       "accept-language": "en-US,en;q=0.9,vi;q=0.8",
//       "authorization": "Bearer MGUsjFRxnIJH24IuWkZn_DalkH_AHwPQkzlaKSxAFBNXLMQu7WXE2skYGo3n4S66RjSWj7ILGw6-zNA06J1zKIjnmZEkLf4rme1O0p4BqlAcqV0W4oZGT5ComaB8HKSSKbqaV04jD6ynHaqyDZq21CCIpeV7YtTJ9MLG4KVxyV47WKKlcUTWSnwttoqbqPi2TJxQBSUZOJk8IM9yeiATpNfWRpu2LIxirz-dVfGCbv0DccX_mIpJYqlPxsr42c4mwPJeeo-uNk37s7zYAi7g0TVrbz9zrJRrXG8AVTp8sd6Tfwxo609lEKJLg4YzBCkQEhWfX4VnFgKe_p7_0QNn6CWRqGA2IaLEVerri0D_7X4BuNQpzYNRfkaSuV2iRxmlTaloJ6nWT-XhhMS1ofWrYBZdqLGsdofSPw1BOxj9sJK-c6hcfeX1L_Ojg7qBJ4kS6aqHJYzm2g2dQL7fNDPifs6bVpb5gBaZq9xdDuU-T8Hq6SZDEvbZHlxigln9PXqK9I13VbXIEdszKnRTMbMEFpqtr5iDdvn5t6Jwe8POu_xwLzXHgxaiBrVqZMIeub7M-ddikGSEyYXu-n0nwtq1DKcVxRj6dMRrq-JZcmB-17gEdH8eaBrZMY2nbrRT-YR_Qhi2AZQcl8IJSKr9uBF3JG7RzfsKt0Y98Sh0wfHdt4Hy_W8LXzjIrJXXqy9jIaKUYHNIB_Sbxc3WFIlrW2vc17LjppqKDhxcJTUgOyb1nOYuWL0kc4fB-jswbH_1p3jXFTiSfKgn_mBgpl7U0CfaBQ",
//       "companycode": "taodentest2",
//       "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
//       "sec-ch-ua-mobile": "?0",
//       "sec-ch-ua-platform": "\"macOS\"",
//       "sec-fetch-dest": "empty",
//       "sec-fetch-mode": "cors",
//       "sec-fetch-site": "same-origin",
//       "x-misa-branchid": "a9259b39-a403-4bdf-81f9-0be56b02f01d",
//       "x-misa-language": "vi-VN",
//       "cookie": "x-deviceid=c5bcbd4f6a384c6c8741166dfc070944; ASP.NET_SessionId=nk3ek4z1ru0en0d0jkyfd5gy; _gid=GA1.2.1145348033.1742812049; taodentest2_Token=be0cc37477054eb49cf00beb9b3d8d53; _ga_YLF50693DS=GS1.1.1742919942.26.1.1742919953.0.0.0; _ga_5RQ0H2DBF0=GS1.1.1742919935.13.1.1742920185.0.0.0; _ga_877E0J2DYM=GS1.1.1742919936.13.1.1742920185.0.0.0; _ga=GA1.2.2089273383.1740064661; TS01fe7274=019ba1692db94ce88d282f18337b981122fd8a115708781955911c71d0f73755f506c194c5b48f2818e2afdd3719b32feb6ba0e75e; _gat=1; _ga_D8GFJLDVNQ=GS1.2.1742922736.21.1.1742923150.0.0.0",
//       "Referer": "https://taodentest2.mshopkeeper.vn/main",
//       "Referrer-Policy": "strict-origin-when-cross-origin"
//     },
//     "body": null,
//     "method": "GET"
//   });
//   const rs = await response.json();
//   return rs.Data
// }

const fetchKhachHang = async (maKhachHang) => {
  const response = await fetch(`https://taodentest2.mshopkeeper.vn/backendg1/api/Customer?_dc=1740472948312&page=1&start=0&limit=50&filter=%5B%7B%22xtype%22%3A%22filter%22%2C%22isFilterRow%22%3Atrue%2C%22property%22%3A%22Inactive%22%2C%22operator%22%3A0%2C%22value%22%3A0%2C%22type%22%3A7%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22isFilterRow%22%3Atrue%2C%22property%22%3A%22CustomerCode%22%2C%22operator%22%3A1%2C%22value%22%3A%22${maKhachHang}%22%2C%22type%22%3A1%2C%22addition%22%3A1%2C%22group%22%3A%22CustomerCodeFFR%22%7D%5D`, {
    "headers": {
      "accept": "application/json",
      "accept-language": "en-US,en;q=0.9,vi;q=0.8",
      "authorization": `Bearer ${token}`,
      "companycode": "taodentest2",
      "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": "\"Android\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-misa-language": "vi-VN",
      "cookie": "x-deviceid=fae18cf23ea94c28b7fcfa66f2fd5660; ASP.NET_SessionId=ttkfrnhn0sryfyn322kau5iw; _gid=GA1.2.1900814718.1740360132; TS01fe7274=019ba1692d463e3f001f09a36e4ddb2e57b9e446639d7f816d5cb73c6ebf0d4dcab28e5e10201efff9f06f892b728ca163c44f37b3; _ga_5RQ0H2DBF0=GS1.1.1740472865.2.0.1740472865.0.0.0; _ga_877E0J2DYM=GS1.1.1740472865.2.0.1740472865.0.0.0; taoden_Token=41b54bbe4fb948cd9c841ed941308798; _ga_YLF50693DS=GS1.1.1740472754.16.1.1740472905.0.0.0; _ga=GA1.2.370415893.1740037992; _ga_D8GFJLDVNQ=GS1.2.1740472467.17.1.1740472910.0.0.0",
      "Referer": "https://taodentest2.mshopkeeper.vn/main",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": null,
    "method": "GET"
  });
  const rs = await response.json();
  return rs.Data[0]
}

const saveBill = async (branchID,body, maHoaDon) => {
  const response = await fetch("https://taodentest2.mshopkeeper.vn/salecloud/uploadg2/SAInvoice/save-sync", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9,vi;q=0.8",
      "authorization": `Bearer ${token}`,
      "companycode": "taodentest2",
      "content-type": "application/json",
      "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": "\"Android\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-misa-branchid": branchID,
      "x-misa-userid": "5c67b1b9-8987-4da8-9f14-89a80dc1aacc",
      "x-misa-username": "phuongthuy11102000",
      "cookie": "x-deviceid=fae18cf23ea94c28b7fcfa66f2fd5660; ASP.NET_SessionId=ttkfrnhn0sryfyn322kau5iw; _gid=GA1.2.1900814718.1740360132; taoden_Token=41b54bbe4fb948cd9c841ed941308798; _ga_5RQ0H2DBF0=GS1.1.1740472865.2.1.1740473820.0.0.0; _ga_877E0J2DYM=GS1.1.1740472865.2.1.1740473820.0.0.0; _ga=GA1.1.370415893.1740037992; _ga_D8GFJLDVNQ=GS1.2.1740477376.18.1.1740478057.0.0.0; _ga_YLF50693DS=GS1.1.1740478725.17.0.1740478725.0.0.0; TS01fe7274=019ba1692d249ed0e1192b5433b1a34dedb286887bc5461bda5a5a8a996efed5e2af90f3d164af8c00346c62061f92ea24244d72d3",
      "Referer": "https://taodentest2.mshopkeeper.vn/salecloudg1/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": JSON.stringify(body),
    "method": "POST"
  });


  // const response = await fetch("https://taodentest2.mshopkeeper.vn/salecloud/uploadg1/SAInvoice/save-sync", {
  //   "headers": {
  //     "accept": "application/json, text/plain, */*",
  //     "accept-language": "en-US,en;q=0.9,vi;q=0.8",
  //     "authorization": "Bearer 6IVCw6khhvNxa6Rt3W3CMmCQBLLETLxxDltmTp0r8lICDA7iswp2atbb-e7BLiRBi45Pz00h_ui30w9gRqFQ_4aJBqbgD4dIeLJ8I8xdA9-7YF9O6arWfnLe7diN-n3ESYekB6ojjjQPgJTHXfS-PdurqgLIetWrmdo2OqY0EyAmaVWSbBD9TAVbrC0ZRVDqvrO5dopv8E-H0elUyKrgfNJ5LEdwADU7BTBluokr7Zi2-t-09w7DvrZWuMU1FbepkHSkJfD8zNqNg9OxVyvO2jzkeEXPJ_ydRPWVH2PYCErNEswagMiNOIoF1tSJCkFxjVoq1Py64xcSVDgi-pS7D5wHn3vu-kUYGNFXX8OGeaGW5iKmg5UUEa1skoN0-SzJx24i0gwrd547pB2hwvS8s0g7kxj8PxuVrUFhJVUT0HpQoQvzm8zf4i2UQyBaGly9bgtEFdI55iO8HBicmOMvszKXYb8ssJBn9VcCOW__80UQY-eXcKAgHmpMN4xoLCXD9H2CmNqgSVuIdVXqgx_-R5ETY39JIQ-bInIsIKSqZQsjfHlfhLPT8ezSLmZ4roebKBw9f-DMSkHm9qmx8qP7ArFRfEuza8cYBeocaUztBCWLoOB2o7mnfWp3TxhoglKr0CLuMTVHEqCuzmI1A7IGFHYlZBbzEcDS3LpyyZU0azIjqKeLJucRMYUnvA7bAF3omQyjt1plNlJM46pCO3ZaeRp5Yh7NGjn1oR3fyhJ6EnHE9rN0SWNykXqOcndyDNQ0stmrz7okKX1xtgFQC9NjdA",
  //     "companycode": "taodentest2",
  //     "content-type": "application/json",
  //     "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
  //     "sec-ch-ua-mobile": "?0",
  //     "sec-ch-ua-platform": "\"macOS\"",
  //     "sec-fetch-dest": "empty",
  //     "sec-fetch-mode": "cors",
  //     "sec-fetch-site": "same-origin",
  //     "x-misa-branchid": "a9259b39-a403-4bdf-81f9-0be56b02f01d",
  //     "x-misa-userid": "88ebd114-b8e5-406a-9359-e6cdad1ee5bb",
  //     "x-misa-username": "phuongthuy11102000",
  //     "cookie": "x-deviceid=c5bcbd4f6a384c6c8741166dfc070944; ASP.NET_SessionId=nk3ek4z1ru0en0d0jkyfd5gy; _gid=GA1.2.189099670.1743227159; taodentest2_Token=1db623d883f34d4b9246f05d51910be7; _ga_YLF50693DS=GS1.1.1743259296.28.1.1743260105.0.0.0; _ga_D8GFJLDVNQ=GS1.2.1743259292.23.1.1743261022.0.0.0; TS01fe7274=019ba1692d80b7a2bded1a67eefe5f734d2c8afc2e20edaf44d52553c6fc21e472ca5c236bf02b3fa44b098323605663839a99a6bb; _ga_5RQ0H2DBF0=GS1.1.1743260026.16.1.1743261436.0.0.0; _ga_877E0J2DYM=GS1.1.1743260027.16.1.1743261436.0.0.0; _ga=GA1.1.2089273383.1740064661",
  //     "Referer": "https://taodentest2.mshopkeeper.vn/salecloudg1/",
  //     "Referrer-Policy": "strict-origin-when-cross-origin"
  //   },
  //   "body": "{\"UploadData\":\"[{\\\"EditMode\\\":1,\\\"TotalItemAmount\\\":-16490000,\\\"TotalItem\\\":0,\\\"ReceiveAmount\\\":-16490000,\\\"CashAmount\\\":0,\\\"CardAmount\\\":0,\\\"TotalAmount\\\":-16490000,\\\"RefType\\\":553,\\\"DiscountAmount\\\":0,\\\"VATAmount\\\":0,\\\"DeliveryAmount\\\":0,\\\"PointAmount\\\":0,\\\"TotalReceipt\\\":0,\\\"ReturnExchangeAmount\\\":0,\\\"TotalItemDiscountAmount\\\":0,\\\"DepositAmount\\\":0,\\\"TotalCoupon\\\":0,\\\"ChangeAmount\\\":16490000,\\\"NotTakeChangeAmount\\\":0,\\\"ChangeDeductedAmount\\\":0,\\\"PreOrder\\\":0,\\\"SaleChannelID\\\":\\\"00000000-0000-0000-0000-000000000000\\\",\\\"SaleChannelName\\\":\\\"Tại cửa hàng\\\",\\\"isCopyData\\\":true,\\\"IsTaxReduction\\\":false,\\\"BranchID\\\":\\\"a9259b39-a403-4bdf-81f9-0be56b02f01d\\\",\\\"LogID\\\":\\\"dab7d7f4-a833-4972-9fc8-a217a4257cb7\\\",\\\"RefNo\\\":\\\"\\\",\\\"UnitPriceType\\\":null,\\\"IsPointPromotion\\\":true,\\\"IsErrorPointAmount\\\":false,\\\"TotalActualAmount\\\":-16490000,\\\"RemainAmount\\\":-16490000,\\\"DebtReductionAmount\\\":0,\\\"DebitAmount\\\":0,\\\"haveCustomer\\\":false,\\\"TotalDebitAmount\\\":0,\\\"CustomerID\\\":\\\"0f2135ca-229c-4d24-a39c-f19d9cae9460\\\",\\\"CustomerCode\\\":\\\"KH002076\\\",\\\"CustomerAddress\\\":\\\"\\\",\\\"CustomerName\\\":\\\"Vũ Tuấn Anh\\\",\\\"CustomerTel\\\":\\\"0934571996\\\",\\\"Gender\\\":0,\\\"MembershipID\\\":null,\\\"MembershipCode\\\":null,\\\"MemberLevelID\\\":null,\\\"TotalItemReturnAmount\\\":-16490000,\\\"TotalItemAmountReturnWithDisCount\\\":-16490000,\\\"TaxReductionAmount\\\":0,\\\"PaymentStatus\\\":3,\\\"FunctionInvoice\\\":6,\\\"RefID\\\":\\\"2c06d833-9a90-42de-9f3b-35d689382e5d\\\",\\\"RefDate\\\":\\\"2025-03-29T22:18:38+07:00\\\",\\\"CreateInvoiceDate\\\":\\\"2025-03-29T22:18:38+07:00\\\",\\\"CompleteInvoiceDate\\\":\\\"2025-03-29T22:18:38+07:00\\\",\\\"CashierID\\\":\\\"88ebd114-b8e5-406a-9359-e6cdad1ee5bb\\\",\\\"DeviceID\\\":\\\"88ebd114-b8e5-406a-9359-e6cdad1ee5bb\\\",\\\"CashierTel\\\":\\\"0374032846\\\",\\\"CashierName\\\":\\\"Đặng Phương Thùy\\\",\\\"CashierEmail\\\":\\\"phuongthuy11102000@gmail.com\\\",\\\"IsCOD\\\":false,\\\"PromotionID\\\":\\\"\\\",\\\"PromotionName\\\":\\\"\\\",\\\"DiscountRate\\\":0,\\\"VoucherAmount\\\":0,\\\"CouponDiscountAmount\\\":0,\\\"CardRank\\\":\\\"\\\",\\\"PaymentTerm\\\":null,\\\"SAInvoiceDetails\\\":[{\\\"CODE\\\":\\\"MISA_kaz43p1l7_1743261461748\\\",\\\"InventoryItemID\\\":\\\"1e4e33c6-5038-481f-adc9-edd14f59165b\\\",\\\"SKUCode\\\":\\\"99%IPXSILVER256CU\\\",\\\"InventoryItemName\\\":\\\"iPhone X 256 Silver Cũ\\\",\\\"Quantity\\\":-1,\\\"UnitID\\\":\\\"746ec67b-d56b-4df7-8187-2fb7fcf31216\\\",\\\"UnitName\\\":\\\"Chiếc\\\",\\\"UnitPrice\\\":16490000,\\\"Amount\\\":-16490000,\\\"DiscountRate\\\":0,\\\"DiscountAmount\\\":0,\\\"errorQuantity\\\":false,\\\"RefDetailType\\\":2,\\\"Weight\\\":0,\\\"ConvertRate\\\":1,\\\"EditMode\\\":1,\\\"InventoryItemType\\\":1,\\\"UnitPriceDefault\\\":0,\\\"UnitPriceOld\\\":0,\\\"CostPrice\\\":700000,\\\"CloseQuantityDefault\\\":213,\\\"Color\\\":\\\"\\\",\\\"Size\\\":\\\"\\\",\\\"selectedSerial\\\":[\\\"356726089144646\\\"],\\\"selectedAllSerial\\\":[\\\"356726089144646\\\"],\\\"ManageType\\\":2,\\\"InventoryItemCategoryID\\\":\\\"4da10a4c-d2e3-4933-9c17-964713b8b346\\\",\\\"ItemCategoryName\\\":\\\"iPhone Cũ 99%\\\",\\\"TaxName\\\":\\\"KCT\\\",\\\"Barcode\\\":\\\"103219\\\",\\\"TotalAmount\\\":-16490000,\\\"SortOrder\\\":1,\\\"QuantityRoot\\\":-1,\\\"FeeReturnValue\\\":0,\\\"AllocationAmount\\\":0,\\\"AllocationPointAmount\\\":0,\\\"Serials\\\":\\\"356726089144646\\\",\\\"ItemEditType\\\":0,\\\"RefID\\\":\\\"2c06d833-9a90-42de-9f3b-35d689382e5d\\\",\\\"RefDetailID\\\":\\\"72afde31-5b75-401b-a23e-ee84474e457b\\\"}],\\\"SAInvoicePayments\\\":[{\\\"SAInvoicePaymentID\\\":\\\"99b8d507-42c3-49c7-b59d-1e647a163cd7\\\",\\\"Amount\\\":-16490000,\\\"CardID\\\":\\\"\\\",\\\"CardName\\\":\\\"Tiền mặt\\\",\\\"PaymentName\\\":\\\"Tiền mặt\\\",\\\"PaymentType\\\":1,\\\"EditMode\\\":1,\\\"disable\\\":false,\\\"RefID\\\":\\\"2c06d833-9a90-42de-9f3b-35d689382e5d\\\",\\\"CODE\\\":\\\"MISA_za6iqnwo8_1743261436573\\\",\\\"BankAccountID\\\":\\\"\\\"}],\\\"SAInvoiceCoupons\\\":[],\\\"SAInvoiceExtensions\\\":[],\\\"SAInvoiceDebitDetails\\\":[],\\\"EcomMappings\\\":[],\\\"EInvoices\\\":[]}]\",\"CompanyCode\":\"taodentest2\",\"BranchID\":\"a9259b39-a403-4bdf-81f9-0be56b02f01d\",\"ClientID\":\"SaleCloud\",\"CreatedDate\":\"2025-03-29T22:18:38+07:00\"}",
  //   "method": "POST"
  // });
  const rs = await response.json();
  rs.Code == 200 && rs.Success == true ? console.log("Phieu xuat hoa don thanh cong: ", rs.Data.RefNo) : console.log("Phieu xuat loi: ", maHoaDon);
}
