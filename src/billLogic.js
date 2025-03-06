

import moment from "moment"
import { v4 } from "uuid"
// import { store } from "./bill.js";
import { token } from "./data.js";
import excelToJson from "convert-excel-to-json";
import { cuaHang } from "./cuaHang.js";

const handleDataBill = () => {
  const rs = excelToJson({sourceFile: "data/all2025taoden.xlsx", columnToKey: {
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

  
  const groupedData = rs.sheetTwo.reduce((acc, item) => {
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
      const uuid = v4()
      for (const element of item.danhSachHang) {
        const timestamp = Date.now();
        const maHang = element.maHang.replace(/\\\\/g, "\\")
        const data = await fetchHangHoa(store.BranchID, encodeURIComponent(JSON.stringify(element.maHang)))
 
        
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
              DiscountAmount: element.giamGiaHangHoa,
              errorQuantity: false,
              RefDetailType: 1,
              Weight: 0,
              ConvertRate: 1,
              EditMode: 1,
              InventoryItemType: 1,
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
              UnitPriceBeforeTax: element.donGia * 0.9,
              Barcode: itemDetail.Barcode,
              TotalAmount: element.thanhTien,
              SortOrder: gioHang.length + 1,
              QuantityRoot: 1,
              DiscountAmountBeforeTax: element * 0.1,
              FeeReturnValue: 0,
              AllocationAmount: 0, // ?
              AllocationAmountBeforeTax: 0, //?
              AllocationPointAmount: 0,//?
              AllocationPointAmountBeforeTax: 0,//?
              AmountBeforeTax: element.donGia * 0.9,//?
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
        TotalItemAmount: item.tongTien,
        TotalItem: gioHang.length + 1,
        ReceiveAmount: item.tongTien,
        CashAmount: item.tongTien,
        RemainAmount: 0,
        CardAmount: 0,
        TotalAmount: item.tongTien,
        RefType: 550,
        DiscountAmount: item.giamGiaHoaDon,
        VATAmount: 0,
        DeliveryAmount: 0,
        PointAmount: 0,
        ReturnExchangeAmount: 0,
        TotalItemDiscountAmount: 0,
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
        TotalActualAmount: item.tongTien,
        DebtReductionAmount: 0,
        TotalReceipt: 0,
        PromotionID: "",
        PromotionName: "Giảm giá trực tiếp - beyonce testttttt",
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
        SAInvoicePayments: [],
        SAInvoiceCoupons: [],
        SAInvoiceExtensions: [],
        SAInvoiceDebitDetails: [],
        EcomMappings: [],
        EInvoices: []
      }
      const body = {
        BranchID: store.BranchID,
        ClientID: "SaleCloud",
        CompanyCode: "taodentest",
        CreatedDate: moment(new Date(item.thoiGian)).format("YYYY-MM-DDTHH:mm:ssZ"),
        UploadData: JSON.stringify([bill])
      }
      await saveBill(store.BranchID,body, item.maHoaDon)
      // console.log(`phieu xuat ${moment(new Date(item.thoiGian)).format("YYYY-MM-DDTHH:mm:ssZ")}`);
    } catch (error) {
        console.log(`phieu xuat ${item.maHoaDon} loi:  ${error}`);
        
    }
  }
}

const fetchHangHoa = async (branchId, maHangHoa) => {
  const response = await fetch(`https://taodentest.mshopkeeper.vn/backendg1/api/InventoryItem?_dc=1740478058265&inventoryItemCategoryID=00000000-0000-0000-0000-000000000000&branchID=${branchId}&isOutStock=0&page=1&start=0&limit=50&sort=%5B%7B%22property%22%3A%22InventoryItemName%22%2C%22direction%22%3A%22ASC%22%7D%5D&filter=%5B%7B%22xtype%22%3A%22filter%22%2C%22isFilterRow%22%3Atrue%2C%22property%22%3A%22Inactive%22%2C%22operator%22%3A0%2C%22value%22%3A0%2C%22type%22%3A7%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22isFilterRow%22%3Atrue%2C%22property%22%3A%22SKUCode%22%2C%22operator%22%3A1%2C%22value%22%3A${maHangHoa}%2C%22type%22%3A1%2C%22addition%22%3A1%2C%22group%22%3A%22SKUCodeFFR%22%7D%5D`, {
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
      "x-misa-branchid": "4173f24c-800f-40dc-a2b8-642e52239902",
      "x-misa-language": "vi-VN",
      "cookie": "x-deviceid=fae18cf23ea94c28b7fcfa66f2fd5660; ASP.NET_SessionId=ttkfrnhn0sryfyn322kau5iw; _gid=GA1.2.1900814718.1740360132; taodentest_Token=41b54bbe4fb948cd9c841ed941308798; _ga_YLF50693DS=GS1.1.1740472754.16.1.1740472905.0.0.0; _ga_5RQ0H2DBF0=GS1.1.1740472865.2.1.1740473820.0.0.0; _ga_877E0J2DYM=GS1.1.1740472865.2.1.1740473820.0.0.0; _ga=GA1.1.370415893.1740037992; TS01fe7274=019ba1692d0d41e2e6fb646d3a24ca2a58fcc26d0df9447ba7548fe1186a87366f2a49d579bdd948f872771f072cfc06ef5956608f; _gat=1; _ga_D8GFJLDVNQ=GS1.2.1740477376.18.1.1740478057.0.0.0",
      "Referer": "https://taodentest.mshopkeeper.vn/main",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": null,
    "method": "GET"
  });
  const rs = await response.json();
  return rs.Data
}

const fetchKhachHang = async (maKhachHang) => {
  const response = await fetch(`https://taodentest.mshopkeeper.vn/backendg1/api/Customer?_dc=1740472948312&page=1&start=0&limit=50&filter=%5B%7B%22xtype%22%3A%22filter%22%2C%22isFilterRow%22%3Atrue%2C%22property%22%3A%22Inactive%22%2C%22operator%22%3A0%2C%22value%22%3A0%2C%22type%22%3A7%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22isFilterRow%22%3Atrue%2C%22property%22%3A%22CustomerCode%22%2C%22operator%22%3A1%2C%22value%22%3A%22${maKhachHang}%22%2C%22type%22%3A1%2C%22addition%22%3A1%2C%22group%22%3A%22CustomerCodeFFR%22%7D%5D`, {
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
      "x-misa-language": "vi-VN",
      "cookie": "x-deviceid=fae18cf23ea94c28b7fcfa66f2fd5660; ASP.NET_SessionId=ttkfrnhn0sryfyn322kau5iw; _gid=GA1.2.1900814718.1740360132; TS01fe7274=019ba1692d463e3f001f09a36e4ddb2e57b9e446639d7f816d5cb73c6ebf0d4dcab28e5e10201efff9f06f892b728ca163c44f37b3; _ga_5RQ0H2DBF0=GS1.1.1740472865.2.0.1740472865.0.0.0; _ga_877E0J2DYM=GS1.1.1740472865.2.0.1740472865.0.0.0; taodentest_Token=41b54bbe4fb948cd9c841ed941308798; _ga_YLF50693DS=GS1.1.1740472754.16.1.1740472905.0.0.0; _ga=GA1.2.370415893.1740037992; _ga_D8GFJLDVNQ=GS1.2.1740472467.17.1.1740472910.0.0.0",
      "Referer": "https://taodentest.mshopkeeper.vn/main",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": null,
    "method": "GET"
  });
  const rs = await response.json();
  return rs.Data[0]
}

const saveBill = async (branchID,body, maHoaDon) => {
  const response = await fetch("https://taodentest.mshopkeeper.vn/salecloud/uploadg1/SAInvoice/save-sync", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9,vi;q=0.8",
      "authorization": `Bearer ${token}`,
      "companycode": "taodentest",
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
      "cookie": "x-deviceid=fae18cf23ea94c28b7fcfa66f2fd5660; ASP.NET_SessionId=ttkfrnhn0sryfyn322kau5iw; _gid=GA1.2.1900814718.1740360132; taodentest_Token=41b54bbe4fb948cd9c841ed941308798; _ga_5RQ0H2DBF0=GS1.1.1740472865.2.1.1740473820.0.0.0; _ga_877E0J2DYM=GS1.1.1740472865.2.1.1740473820.0.0.0; _ga=GA1.1.370415893.1740037992; _ga_D8GFJLDVNQ=GS1.2.1740477376.18.1.1740478057.0.0.0; _ga_YLF50693DS=GS1.1.1740478725.17.0.1740478725.0.0.0; TS01fe7274=019ba1692d249ed0e1192b5433b1a34dedb286887bc5461bda5a5a8a996efed5e2af90f3d164af8c00346c62061f92ea24244d72d3",
      "Referer": "https://taodentest.mshopkeeper.vn/salecloudg1/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": JSON.stringify(body),
    "method": "POST"
  });

  const rs = await response.json();
  rs.Code == 200 && rs.Success == true ? console.log("Phieu xuat hoa don thanh cong: ", rs.Data.RefNo) : console.log("Phieu xuat loi: ", maHoaDon);
}
