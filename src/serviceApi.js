const BASE_API = "https://taodentest2.mshopkeeper.vn/"


export const apiNhapKho = async(body) => {
    const response = await fetch(`${BASE_API}backendg2/api/INInwards`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "accept": "application/json",
            "authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body)
    })
    const data = await response.json();
    return data
}

export const apiNhapHoaDon = async(body) => {
    const response = await fetch(`${BASE_API}salecloud/uploadg2/SAInvoice/save-sync`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "accept": "application/json",
            "authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body)
    })
    const data = await response.json();
    return data
}
export const apiGetHangHoa = async(maHang) => {
    const filter=[{xtype:"filter",property:"SKUCode",operator:1,value:`${maHang}`,type:1},
        {xtype:"filter",property:"InventoryItemName",operator:1,value:`${maHang}`,type:1}]

    const response = await fetch(`${BASE_API}backendg2/api/InventoryItems/GetItemPagingQuickSearch?filter=${filter}`, {
        method: "GET",
        headers: {
            "content-type": "application/json",
            "accept": "application/json",
            "authorization": `Bearer ${token}`,
        },
    })
    const data = await response.json();
    return data
}

export const apiGetKhachHang = async(maKhachHang) => {
    const filter=[{xtype:"filter",isFilterRow:true,property:"Inactive",operator:0,value:0,type:7},
        {xtype:"filter",isFilterRow:true,property:"CustomerCode",operator:1,value:`${maKhachHang}`,type:1,addition:1,group:"CustomerCodeFFR"}]

    const response = await fetch(`${BASE_API}backendg2/api/Customer?filter=${filter}`, {
        method: "GET",
        headers: {
            "content-type": "application/json",
            "accept": "application/json",
            "authorization": `Bearer ${token}`,
        },
    })
    const data = await response.json();
    return data
}

export const apiGetNhaCungCap = async(maNhaCungCap) => {
    const response = await fetch(`${BASE_API}backendg2/api/ObjectDetails?&content=${maNhaCungCap}`, {
        method: "GET",
        headers: {
            "content-type": "application/json",
            "accept": "application/json",
            "authorization": `Bearer ${token}`,
        },
    })
    const data = await response.json();
    return data
}