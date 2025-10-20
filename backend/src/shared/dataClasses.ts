
export type useraccountData = {
    id: number;
    username:string;
    userProfile: string;
    isSuspended: boolean;
}


export type roleData = {
    id: number;
    name: string;
    isSuspended?: boolean;
}

export type  service_typeData = {
    id: number;
    name: string;
}

export type csr_requestsData = {
    pin_id: number;
    csr_id: number;
    categoryID: number;
    message: string;
    requestedAt: Date;
    status: string;
}