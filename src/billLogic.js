

import moment from "moment"
import { v4 } from "uuid" 
import  { data, detail1, detailString, jsonString, body1 }  from "./bill.js";
import { dataBill } from "./billData.js";

export const handleDataBill = () => {
    const groupedData = dataBill.reduce((acc, item) => {
        const { chiNhanh, maHoaDon, thoiGian, maKhachHang, ghiChu, giamGiaHoaDon, tongTien, maHang, imei, soLuong, donGia, giamGiaHangHoa, giaBan, thanhTien } = item;

        if (!acc[maHoaDon]) {
            acc[maHoaDon] = { chiNhanh, maHoaDon, thoiGian, maKhachHang, ghiChu, giamGiaHoaDon, tongTien, danhSachHang: [] };
        }

        acc[maHoaDon].danhSachHang.push({maHang, imei, donGia, soLuong,giamGiaHangHoa,giaBan, thanhTien });

        return acc;
    }, {});

    const result = Object.values(groupedData);
    console.log(result);

    return result;
    // try {
    //     // Loại bỏ escape characters bằng cách replace `\\"` thành `"`, sau đó parse JSON
    //     const cleanedJsonString = jsonString.replace(/\\"/g, '"');
    //     const dataObject = JSON.parse(cleanedJsonString);
    //     const detailObject = JSON.parse(detail1.replace(/\\"/g, '"'));
        
    //     console.log(dataObject);
    // } catch (error) {
    //     console.error("Lỗi parse JSON:", error);
    // }
}

const handleData = () => {

}

const fetchHangHoa = async(branchId, maHangHoa ) => {
    const response = await fetch("https://taodentest.mshopkeeper.vn/backendg1/api/InventoryItem?_dc=1740478058265&inventoryItemCategoryID=00000000-0000-0000-0000-000000000000&branchID=4173f24c-800f-40dc-a2b8-642e52239902&isOutStock=0&page=1&start=0&limit=50&sort=%5B%7B%22property%22%3A%22InventoryItemName%22%2C%22direction%22%3A%22ASC%22%7D%5D&filter=%5B%7B%22xtype%22%3A%22filter%22%2C%22isFilterRow%22%3Atrue%2C%22property%22%3A%22Inactive%22%2C%22operator%22%3A0%2C%22value%22%3A0%2C%22type%22%3A7%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22isFilterRow%22%3Atrue%2C%22property%22%3A%22SKUCode%22%2C%22operator%22%3A1%2C%22value%22%3A%22BAODAKEYBOARDCOTECIIPAD10%22%2C%22type%22%3A1%2C%22addition%22%3A1%2C%22group%22%3A%22SKUCodeFFR%22%7D%5D", {
        "headers": {
          "accept": "application/json",
          "accept-language": "en-US,en;q=0.9,vi;q=0.8",
          "authorization": "Bearer 5EyAbZTC3zK1a3hXZeJeUmH2IE1Emk70fWmaKYXfvXxR_a7l_wyjnZA3tfdUDPpQG5tl1xi4JHP6zrlMVRZLL_WOoSZWp3AnYJBCShcAjl_z0wKbJwg_5aeRMzLB9WcaYqd5anS9g5le1hUz5tqCpF8H60u-amoBxqCvVexBIgChKuUKYgVRPrskCsu62eSKNY62evGvn4iO_oVM32-GHT3FTj2u5PN6c4aSIe9z_NTdi6QukKggko2mlTqkCrsAlneVJLgL26sUYM6luRpEy4n3UmDA9nSnrL72dIuhNiIENGeJCZpS34mzTPAdvihe4u88evhsNYojAHLEeObbVVOAiIJhTtxJqTHfJv7Cq2uoJ-XXtsfQdh2uESjqO6aL2pnVssTswxHysgE_cCE42OmiVccQ3hBf1Apm4EzyQXlmLxw3sHRzKtjL1C5qRgVEXjSmuk8sGYSXJF3N01TDqEVKs1X-R_fBwCy7S6lxwem1XhiatkpDs0VOE4CfrP8zmN2yAbmFFdzMmy0yAdpKD0LV0Z7j-u6sjXO4Ai1GIzvSrDEHpGZxkEMkrPQe9nmtvj9iO-W62VqAm9d4tsIhyM8l3VdW9-fajKihQKnpOHI7gZV8gpdtSlmBbuNs8IP10aUDsUgUvUJqtxvF4s2ypw284mvy4_viAfwjRAMp6hb0_hgmV1cRWpDg5Q-m_x767pY3tjikW8QHur3_lSrhOJBOTd-G2TQrxQ5yusH3YSLlydbG1eBmnmQRtpt0d47i",
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
}

const fetchKhachHang = async(maKhachHang) => {
    const response = await fetch(`https://taodentest.mshopkeeper.vn/backendg1/api/Customer?_dc=1740472948312&page=1&start=0&limit=50&filter=%5B%7B%22xtype%22%3A%22filter%22%2C%22isFilterRow%22%3Atrue%2C%22property%22%3A%22Inactive%22%2C%22operator%22%3A0%2C%22value%22%3A0%2C%22type%22%3A7%7D%2C%7B%22xtype%22%3A%22filter%22%2C%22isFilterRow%22%3Atrue%2C%22property%22%3A%22CustomerCode%22%2C%22operator%22%3A1%2C%22value%22%3A${maKhachHang}%2C%22type%22%3A1%2C%22addition%22%3A1%2C%22group%22%3A%22CustomerCodeFFR%22%7D%5D`, {
        "headers": {
          "accept": "application/json",
          "accept-language": "en-US,en;q=0.9,vi;q=0.8",
          "authorization": "Bearer 5EyAbZTC3zK1a3hXZeJeUmH2IE1Emk70fWmaKYXfvXxR_a7l_wyjnZA3tfdUDPpQG5tl1xi4JHP6zrlMVRZLL_WOoSZWp3AnYJBCShcAjl_z0wKbJwg_5aeRMzLB9WcaYqd5anS9g5le1hUz5tqCpF8H60u-amoBxqCvVexBIgChKuUKYgVRPrskCsu62eSKNY62evGvn4iO_oVM32-GHT3FTj2u5PN6c4aSIe9z_NTdi6QukKggko2mlTqkCrsAlneVJLgL26sUYM6luRpEy4n3UmDA9nSnrL72dIuhNiIENGeJCZpS34mzTPAdvihe4u88evhsNYojAHLEeObbVVOAiIJhTtxJqTHfJv7Cq2uoJ-XXtsfQdh2uESjqO6aL2pnVssTswxHysgE_cCE42OmiVccQ3hBf1Apm4EzyQXlmLxw3sHRzKtjL1C5qRgVEXjSmuk8sGYSXJF3N01TDqEVKs1X-R_fBwCy7S6lxwem1XhiatkpDs0VOE4CfrP8zmN2yAbmFFdzMmy0yAdpKD0LV0Z7j-u6sjXO4Ai1GIzvSrDEHpGZxkEMkrPQe9nmtvj9iO-W62VqAm9d4tsIhyM8l3VdW9-fajKihQKnpOHI7gZV8gpdtSlmBbuNs8IP10aUDsUgUvUJqtxvF4s2ypw284mvy4_viAfwjRAMp6hb0_hgmV1cRWpDg5Q-m_x767pY3tjikW8QHur3_lSrhOJBOTd-G2TQrxQ5yusH3YSLlydbG1eBmnmQRtpt0d47i",
          "companycode": "taodentest",
          "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": "\"Android\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-misa-branchid": "3f83b38e-c3c8-4030-8dae-106ca1e00e77",
          "x-misa-language": "vi-VN",
          "cookie": "x-deviceid=fae18cf23ea94c28b7fcfa66f2fd5660; ASP.NET_SessionId=ttkfrnhn0sryfyn322kau5iw; _gid=GA1.2.1900814718.1740360132; TS01fe7274=019ba1692d463e3f001f09a36e4ddb2e57b9e446639d7f816d5cb73c6ebf0d4dcab28e5e10201efff9f06f892b728ca163c44f37b3; _ga_5RQ0H2DBF0=GS1.1.1740472865.2.0.1740472865.0.0.0; _ga_877E0J2DYM=GS1.1.1740472865.2.0.1740472865.0.0.0; taodentest_Token=41b54bbe4fb948cd9c841ed941308798; _ga_YLF50693DS=GS1.1.1740472754.16.1.1740472905.0.0.0; _ga=GA1.2.370415893.1740037992; _ga_D8GFJLDVNQ=GS1.2.1740472467.17.1.1740472910.0.0.0",
          "Referer": "https://taodentest.mshopkeeper.vn/main",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
      });
}

const saveBill = async(body) => {
    const response = await fetch("https://taodentest.mshopkeeper.vn/salecloud/uploadg1/SAInvoice/save-sync", {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9,vi;q=0.8",
          "authorization": "Bearer 5EyAbZTC3zK1a3hXZeJeUmH2IE1Emk70fWmaKYXfvXxR_a7l_wyjnZA3tfdUDPpQG5tl1xi4JHP6zrlMVRZLL_WOoSZWp3AnYJBCShcAjl_z0wKbJwg_5aeRMzLB9WcaYqd5anS9g5le1hUz5tqCpF8H60u-amoBxqCvVexBIgChKuUKYgVRPrskCsu62eSKNY62evGvn4iO_oVM32-GHT3FTj2u5PN6c4aSIe9z_NTdi6QukKggko2mlTqkCrsAlneVJLgL26sUYM6luRpEy4n3UmDA9nSnrL72dIuhNiIENGeJCZpS34mzTPAdvihe4u88evhsNYojAHLEeObbVVOAiIJhTtxJqTHfJv7Cq2uoJ-XXtsfQdh2uESjqO6aL2pnVssTswxHysgE_cCE42OmiVccQ3hBf1Apm4EzyQXlmLxw3sHRzKtjL1C5qRgVEXjSmuk8sGYSXJF3N01TDqEVKs1X-R_fBwCy7S6lxwem1XhiatkpDs0VOE4CfrP8zmN2yAbmFFdzMmy0yAdpKD0LV0Z7j-u6sjXO4Ai1GIzvSrDEHpGZxkEMkrPQe9nmtvj9iO-W62VqAm9d4tsIhyM8l3VdW9-fajKihQKnpOHI7gZV8gpdtSlmBbuNs8IP10aUDsUgUvUJqtxvF4s2ypw284mvy4_viAfwjRAMp6hb0_hgmV1cRWpDg5Q-m_x767pY3tjikW8QHur3_lSrhOJBOTd-G2TQrxQ5yusH3YSLlydbG1eBmnmQRtpt0d47i",
          "companycode": "taodentest",
          "content-type": "application/json",
          "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": "\"Android\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-misa-branchid": "3f83b38e-c3c8-4030-8dae-106ca1e00e77",
          "x-misa-userid": "5c67b1b9-8987-4da8-9f14-89a80dc1aacc",
          "x-misa-username": "phuongthuy11102000",
          "cookie": "x-deviceid=fae18cf23ea94c28b7fcfa66f2fd5660; ASP.NET_SessionId=ttkfrnhn0sryfyn322kau5iw; _gid=GA1.2.1900814718.1740360132; taodentest_Token=41b54bbe4fb948cd9c841ed941308798; _ga_5RQ0H2DBF0=GS1.1.1740472865.2.1.1740473820.0.0.0; _ga_877E0J2DYM=GS1.1.1740472865.2.1.1740473820.0.0.0; _ga=GA1.1.370415893.1740037992; _ga_D8GFJLDVNQ=GS1.2.1740477376.18.1.1740478057.0.0.0; _ga_YLF50693DS=GS1.1.1740478725.17.0.1740478725.0.0.0; TS01fe7274=019ba1692d249ed0e1192b5433b1a34dedb286887bc5461bda5a5a8a996efed5e2af90f3d164af8c00346c62061f92ea24244d72d3",
          "Referer": "https://taodentest.mshopkeeper.vn/salecloudg1/",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": body,
        "method": "POST"
      });
}

const body = {
    EditMode: 1,
    TotalItemAmount: 0,
    TotalItem: 1,
    ReceiveAmount: 0,
    CashAmount: 0,
    RemainAmount: 0,
    CardAmount: 0,
    TotalAmount: 0,
    RefType: 550,
    DiscountAmount: 0,
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
    SaleChannelID: '00000000-0000-0000-0000-000000000000',
    SaleChannelName: 'Tại cửa hàng',
    EmployeeName: '',
    EmployeeCode: '',
    EmployeeID: '',
    EmployeeMobile: '',
    EmployeeEmail: '',
    isCopyData: true,
    IsTaxReduction: false,
    BranchID: '3f83b38e-c3c8-4030-8dae-106ca1e00e77',
    IsPointPromotion: true,
    RefID: '5bc50a0b-3ff5-4022-83c1-4469cc9ec0bc',
    LogID: 'a7fcae5c-a346-4987-a1d3-bcd227ccc1a2',
    UnitPriceType: 2,
    ServiceTaxRate: 10,
    IsApplyTax: true,
    TotalItemReturnAmount: 0,
    TotalItemAmountReturnWithDisCount: 0,
    TaxReductionAmount: 0,
    TotalItemAmountBeforeTax: 0,
    TotalItemDiscountAmountBeforeTax: 0,
    DiscountAmountBeforeTax: 0,
    IsErrorPointAmount: false,
    DeliveryAmountBeforeTax: 0,
    ReturnExchangeAmountBeforeTax: 0,
    TotalActualAmount: 0,
    TotalReceipt: 0,
    DebtReductionAmount: 0,
    DebitAmount: 0,
    MemberLevelName: '',
    MemberLevelID: null,
    MembershipID: null,
    MembershipCode: null,
    UsedPoint: 0,
    Point: 0,
    AddPoint: 0,
    AvailablePoint: 0,
    PointPromotionAmount: 0,
    TotalDebitAmount: 0,
    CustomerID: '0086be6e-6883-474f-af4f-a78a7a27cb34',
    CustomerCode: '0964950216',
    CustomerName: 'Đỗ Trà My',
    CustomerTel: '0964950216',
    Gender: 2,
    PaymentStatus: 3,
    FunctionInvoice: 6,
    RefDate: '2025-02-24T23:09:59+07:00',
    CreateInvoiceDate: '2025-02-24T23:09:59+07:00',
    CompleteInvoiceDate: '2025-02-24T23:09:59+07:00',
    CashierID: '5c67b1b9-8987-4da8-9f14-89a80dc1aacc',
    DeviceID: '5c67b1b9-8987-4da8-9f14-89a80dc1aacc',
    CashierTel: '0374032846',
    CashierName: 'Táo Đen Test',
    CashierEmail: 'phuongthuy11102000@gmail.com',
    IsCOD: false,
    PromotionID: '',
    PromotionName: '',
    DiscountRate: 0,
    VoucherAmount: 0,
    CouponDiscountAmount: 0,
    CardRank: '',
    PaymentTerm: null,
    SAInvoiceDetails: [ [Object] ],
    SAInvoicePayments: [],
    SAInvoiceCoupons: [],
    SAInvoiceExtensions: [],
    SAInvoiceDebitDetails: [],
    EcomMappings: [],
    EInvoices: []
  }
  const detailHangHoa =  {
    CODE: 'MISA_5ehsh20mm_1740466408719',
    InventoryItemID: '63ba9bb0-e32a-46f6-93bf-de0843194c96',
    SKUCode: 'SP000090',
    InventoryItemName: 'Cường Lực Full iPhone XSM/Pro Max',
    Quantity: 1,
    UnitID: '746ec67b-d56b-4df7-8187-2fb7fcf31216',
    UnitName: 'Chiếc',
    UnitPrice: 100000,
    Amount: 100000,
    DiscountRate: 0,
    DiscountAmount: 0,
    errorQuantity: true,
    CloseQuantity: 0,
    QuantityPurchase: 0,
    RefDetailType: 1,
    Weight: 0,
    ConvertRate: 1,
    EditMode: 1,
    InventoryItemType: 1,
    UnitPriceDefault: 100000,
    UnitPriceOld: 100000,
    CostPrice: 0,
    CloseQuantityDefault: 0,
    Color: '',
    Size: '',
    selectedSerial: [],
    selectedAllSerial: [],
    TaxRate: 10,
    UnitPriceBeforeTax: 90909,
    Barcode: '103094',
    TotalAmount: 100000,
    SortOrder: 1,
    QuantityRoot: 1,
    DiscountAmountBeforeTax: 0,
    FeeReturnValue: 0,
    AllocationAmount: 0,
    AllocationAmountBeforeTax: 0,
    AllocationPointAmount: 0,
    AllocationPointAmountBeforeTax: 0,
    AmountBeforeTax: 90909,
    TaxAmount: 9091,
    RefID: '7a1a581d-6d71-4638-864a-9e8218e6484b',
    RefDetailID: '132a7a45-f359-4eab-a72f-8e375e9396ca'
  }
  const detailHangHoas = [
    {
      CODE: 'MISA_qiben09ju_1740474554834',
      InventoryItemID: '63ba9bb0-e32a-46f6-93bf-de0843194c96',
      SKUCode: 'SP000090',
      InventoryItemName: 'Cường Lực Full iPhone XSM/Pro Max',
      Quantity: 1,
      UnitID: '746ec67b-d56b-4df7-8187-2fb7fcf31216',
      UnitName: 'Chiếc',
      UnitPrice: 100000,
      Amount: 100000,
      PromotionName: 'km',
      DiscountRate: 10,
      DiscountAmount: 10000,
      PromotionID: '',
      PromotionType: 0,
      errorQuantity: true,
      CloseQuantity: -1,
      QuantityPurchase: 0,
      RefDetailType: 1,
      Weight: 0,
      ConvertRate: 1,
      EditMode: 1,
      InventoryItemType: 1,
      UnitPriceDefault: 100000,
      UnitPriceOld: 100000,
      CostPrice: 0,
      CloseQuantityDefault: -1,
      Color: '',
      Size: '',
      ColourCode: '',
      selectedSerial: [],
      selectedAllSerial: [],
      InventoryItemParent: '00000000-0000-0000-0000-000000000000',
      TaxRate: 10,
      UnitPriceBeforeTax: 90909,
      Barcode: '103094',
      TotalAmount: 90000,
      SortOrder: 1,
      QuantityRoot: 1,
      DiscountAmountBeforeTax: 9091,
      FeeReturnValue: 0,
      AllocationAmount: 0,
      AllocationAmountBeforeTax: 0,
      AllocationPointAmount: 0,
      AllocationPointAmountBeforeTax: 0,
      AmountBeforeTax: 90909,
      TaxAmount: 8182,
      RemovePromotionByHand: true,
      DiscountAmountUnitPrice: 0,
      ItemEditType: 0,
      RefID: 'f33bdd70-5ee6-48ee-a540-8b3ae3e9ca36',
      RefDetailID: '2924da2d-1dea-45c2-ad97-3b2d86af8754'
    },
    {
      CODE: 'MISA_7u7vni8ek_1740474853423',
      InventoryItemID: '0086f407-f283-425c-bf29-ccc5b732f64c',
      SKUCode: 'BAODAKEYBOARDCOTECIIPAD10.9/11',
      InventoryItemName: 'Bao da Keyboard Coteci IPad 10.9/11 Inch',
      Quantity: 2,
      UnitID: '746ec67b-d56b-4df7-8187-2fb7fcf31216',
      UnitName: 'Chiếc',
      UnitPrice: 500000,
      Amount: 1000000,
      DiscountRate: 0,
      DiscountAmount: 0,
      errorQuantity: true,
      CloseQuantity: -1,
      QuantityPurchase: 0,
      RefDetailType: 1,
      Weight: 0,
      ConvertRate: 1,
      EditMode: 1,
      InventoryItemType: 1,
      UnitPriceDefault: 0,
      UnitPriceOld: 0,
      CostPrice: 805000,
      CloseQuantityDefault: -1,
      Color: '',
      Size: '',
      ColourCode: '',
      selectedSerial: [],
      selectedAllSerial: [],
      ManageType: 0,
      InventoryItemCategoryID: '60966b59-0c34-4856-88f2-298b02773888',
      InventoryItemParent: '00000000-0000-0000-0000-000000000000',
      TaxRate: 10,
      UnitPriceBeforeTax: 454545,
      Barcode: '101171',
      TotalAmount: 1000000,
      SortOrder: 2,
      QuantityRoot: 1,
      DiscountAmountBeforeTax: 0,
      FeeReturnValue: 0,
      AllocationAmount: 0,
      AllocationAmountBeforeTax: 0,
      AllocationPointAmount: 0,
      AllocationPointAmountBeforeTax: 0,
      AmountBeforeTax: 909090,
      TaxAmount: 90910,
      ItemEditType: 0,
      RefID: 'f33bdd70-5ee6-48ee-a540-8b3ae3e9ca36',
      RefDetailID: 'c1e7ca54-7eec-45df-a8cb-4b8993ee01a4'
    }
  ]