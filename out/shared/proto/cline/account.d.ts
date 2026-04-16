export interface UserOrganization {
    id: string;
    name: string;
    [key: string]: any;
}
export declare const UserOrganization: {
    create: (data: any) => UserOrganization;
};
export interface User {
    id: string;
    email: string;
    [key: string]: any;
}
export declare const User: {
    create: (data: any) => User;
};
export interface OrganizationCredits {
    total: number;
    used: number;
    available: number;
    [key: string]: any;
}
export declare const OrganizationCredits: {
    create: (data: any) => OrganizationCredits;
};
export interface UserCredits {
    total: number;
    used: number;
    available: number;
    [key: string]: any;
}
export declare const UserCredits: {
    create: (data: any) => UserCredits;
};
//# sourceMappingURL=account.d.ts.map