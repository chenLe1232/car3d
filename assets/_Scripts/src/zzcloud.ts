export interface CloudFunc {
    name: string,
    status: number, // 0 , 1 
    show_num: string,
    show_per: string,
}

export interface CloudConfig {
    disFunc: { [index: string]: CloudFunc },
    adSwitch: number,
    validAd: number
}

