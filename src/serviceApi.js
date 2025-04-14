const BASE_API = "https://taodentest2.mshopkeeper.vn"
const token = "cMuN39lnaa-pMJOFeE_8cGTFH0bAOlWeJETeMMY1kcqLppYHZ8tfxcce-_0ffJgEt3OJjGGwYTW7zqnVf-gk297lO-FD4lqNVhniNpYdWccy8hZcEACwnbNbJnPzagFSysFi7kFGSCptTctWl-SSmOBjCkV1OKfIzX1eOXs1GXHl4Iij6riYQhaVWZPzQDHRh-DIYfIqkviR67LbZviXoaih4P_1Q3Mi-jPAC5yYwmeggB--QmvncfL88ZXxj2DsS2BJxHlvFhi9WJ26yHsvhoaQ_FX9Yj99VnXwvzLOhprcNfayB4fYeXRocHbwu8_Fo4w-FKDFo4T8ibrcsTgbE47w2pJOtpPGiYKQ8WjLkuUS_e9tcdzVuxLwUHOFeCxH1ExqTMnaQ8-GVWYVhXyDq_EelSPINgyfOPqdyVDUr7BbRlpy2SeNWsIT8RpvlrEnQFFsZXBHsEXMJDfmzHCNTc8CSCD1DDQ55i5PoYniYj-EieZtkF_CrSyWSVMA4YPeEhWKjqHFCUOUAsLyg7Pqw_9mu1q1yLF0stsSBvcsfLtOJGME1-T7gVaasiS3xKpoztrn0SpcEm3CO1qBE075NoqBVLB4GJNvNw9b2VFjPqRUUdgYmb8B4WQ7BceGOfY_Nnb8Wc5asZJHeGajZa7-Pgg3E-T3NHgPMeqmWJQNExcT_pXq9ppeq_04LFR03rs0w3FjWTc3csTTYtKwc3kep1KlvfzPpoGBHMunfLC2ZAZkER-Q977iKzHnWcQmdU6Otz1Ap84ty2h-6oPgVRVDMQ"

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