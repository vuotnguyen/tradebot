const BASE_API = "https://taodentest2.mshopkeeper.vn"
export const token = "1n_uBaX7M6dgAliT9tZgRG3fapTFO4lR-4ISdPzGDvXgvhyQu-4tp9MTnxUXqcshe_FdXXtREksvcDwzPvWiYrjnnwhQfaTDEnN_3hDSSdwSg9GZJwk1rykV7Wk9I6XfekSvqDsxxTjABbuQq5Ox8wTRkLPaEi_xGWwb0qtrXyYTWGJhPBHHx-Db-_Bh_xF_V5LYM5p2b56S2SUWfJb2rVdnZofALKCGK_meAqCL7prcK_9pJH0qwZ9iGwcHLIQ0GJAgsBVJiTjcMYHEhnX-mAYIdzMkUd9x5d7cOoyEBQLWxh-0_d2rXTqq4Iu22qkc2O3b150jwHwYPHK0ScCXnNS0SQ7pFxBm511N8CnsJFC0VeEdeISbA797nrybnExC6ySXhlGW47Twj_6glSUXK4wjw69tn39QPS5yxThjQJ2TrowINO7kHE8ikPP74TXtJjQ9BlDMOx7R4aRg37RD6Cs8DbBPvZQYozF6hf71miSJEdylw0Qm6lOsOvG7hUI1Mx-poejKGOaKcU0lTUHHwUiNjKLSxDQ19fObotsPkWDCoBWeh2VK_FDtPiE6MyMBcNmAQtL9x4pql8GmjZSKMbbBdrHEl4GmXwZ3Ep1O0njJ60WakCFKB17Kk81qcSLQKLkcbuGXkjSRXsyVp4TUqN-8rJIvH-VVZ7wItr-NDqaO-M8zMOlEKYOWzN2lqqpTLH8aVWuAvlt2q3Gk8SquUlwE8w76yhPQyQV0ri-lPxunFuNP-Mc_4o8jxGktYo4tGWZQk0MYh802Y1Cjy_5x5w"
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

    const response = await fetch(`${BASE_API}/backendg2/api/InventoryItems/GetItemPagingQuickSearch?filter=${JSON.stringify(filter)}`, {
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