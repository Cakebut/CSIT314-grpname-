export type usersTable = {
    id: number;
    username: string;
    password: string;
    roleid: number;
    issuspended: boolean;
}


export type roleTable = {
    id: number;
    name: string;
    issuspended?: boolean;
}

export type  service_typeTable = {
    id: number;
    name: string;
}

export type csr_requestsTable = {
    pin_id: number;
    csr_id: number;
    categoryID: number;
    message: string;
    requestedAt: Date;
    status: string;
}