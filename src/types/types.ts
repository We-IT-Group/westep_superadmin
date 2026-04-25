export interface Role {
    id: string;
    name: string;
    permissions: string[];
}

export interface Business {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    description?: string;
}

export interface BusinessDomain {
    id: string;
    businessId: string;
    businessName: string;
    landingHost: string;
    studentHost: string;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface BusinessDomainFormValues {
    businessId: string;
    landingHost: string;
    studentHost: string;
    active: boolean;
}

export interface User {
    birthDate?: string;
    businessId?: string;
    createdAt?: string;
    firstname: string;
    gender: string;
    id: string;
    lastname: string
    permissionsList: string[];
    phoneNumber: string
    roleName: string
}
